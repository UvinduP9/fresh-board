/**
 * Push translations from locales/ → Sanity
 * 
 * This script:
 * 1. Compares current locale files to the lock file (last pulled state)
 * 2. Only pushes diffs (created, updated, deprecated)
 * 3. Uses optimistic locking with _rev to detect conflicts
 * 4. Creates missing keys automatically
 * 5. Marks removed keys as deprecated (soft delete)
 * 
 * Usage: npx tsx scripts/push-to-sanity.ts
 * 
 * Options:
 *   --dry-run    Preview changes without pushing
 *   --force      Skip conflict detection (use with caution)
 *   --dataset    Target dataset (defaults to .env.local value)
 */

import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Parse CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const datasetArg = args.find(arg => arg.startsWith('--dataset='));
const DATASET = datasetArg ? datasetArg.split('=')[1] : process.env.NEXT_PUBLIC_SANITY_DATASET!;

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

const LOCALES_DIR = path.join(process.cwd(), 'locales');
const LOCK_FILE = path.join(LOCALES_DIR, '.sanity-i18n-lock.json');
const SUPPORTED_LOCALES = ['en', 'no'] as const;
const NAMESPACES = ['navigation', 'browse', 'product', 'common', 'home', 'content', 'vendors', 'about'];

interface LockEntry {
  _id: string;
  _rev: string;
  hash: string;
}

interface LockFile {
  version: 1;
  dataset: string;
  lastPulled: string;
  entries: Record<string, LockEntry>;
}

interface LocalTranslation {
  namespace: string;
  key: string;
  en: string;
  no: string;
}

interface SanityDoc {
  _id: string;
  _rev: string;
  namespace: string;
  key: string;
  en: string;
  no: string;
  deprecated?: boolean;
  deprecatedAt?: string;
}

/**
 * Create a hash of translation content for change detection
 */
function hashTranslation(item: LocalTranslation): string {
  const content = JSON.stringify({
    namespace: item.namespace,
    key: item.key,
    en: item.en,
    no: item.no,
  });
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Flatten nested object to dot-notation keys
 */
function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }
  
  return result;
}

/**
 * Load lock file
 */
function loadLockFile(): LockFile | null {
  if (!fs.existsSync(LOCK_FILE)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(LOCK_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Read all local translation files
 */
function readLocalTranslations(): Map<string, LocalTranslation> {
  const translations = new Map<string, LocalTranslation>();
  
  for (const namespace of NAMESPACES) {
    const enFile = path.join(LOCALES_DIR, 'en', `${namespace}.json`);
    const noFile = path.join(LOCALES_DIR, 'no', `${namespace}.json`);
    
    if (!fs.existsSync(enFile) || !fs.existsSync(noFile)) {
      console.warn(`⚠️  Missing files for namespace: ${namespace}`);
      continue;
    }
    
    const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
    const noData = JSON.parse(fs.readFileSync(noFile, 'utf-8'));
    
    const enFlat = flatten(enData);
    const noFlat = flatten(noData);
    
    // Merge EN and NO into single translations
    const allKeys = new Set([...Object.keys(enFlat), ...Object.keys(noFlat)]);
    
    for (const key of allKeys) {
      const lockKey = `${namespace}.${key}`;
      translations.set(lockKey, {
        namespace,
        key,
        en: enFlat[key] || '',
        no: noFlat[key] || '',
      });
    }
  }
  
  return translations;
}

/**
 * Fetch current state from Sanity
 */
async function fetchSanityState(): Promise<Map<string, SanityDoc>> {
  const query = `*[_type == "translation"]{ _id, _rev, namespace, key, en, no, deprecated, deprecatedAt }`;
  const results: SanityDoc[] = await client.fetch(query);
  
  const map = new Map<string, SanityDoc>();
  for (const doc of results) {
    const lockKey = `${doc.namespace}.${doc.key}`;
    map.set(lockKey, doc);
  }
  
  return map;
}

/**
 * Generate document ID from namespace and key
 */
function generateDocId(namespace: string, key: string): string {
  return `${namespace}-${key}`;
}

async function push() {
  console.log(DRY_RUN ? '🔍 DRY RUN - No changes will be made\n' : '🚀 Pushing translations to Sanity...\n');
  console.log(`📍 Target dataset: ${DATASET}\n`);
  
  // Load lock file
  const lockFile = loadLockFile();
  if (!lockFile && !FORCE) {
    console.error('❌ No lock file found. Run `npm run i18n:pull` first to establish baseline.');
    console.error('   Or use --force to push without a lock file (not recommended).');
    process.exit(1);
  }
  
  // Read local translations
  const localTranslations = readLocalTranslations();
  console.log(`📂 Found ${localTranslations.size} translations in local files\n`);
  
  // Fetch current Sanity state
  const sanityState = await fetchSanityState();
  console.log(`☁️  Found ${sanityState.size} translations in Sanity\n`);
  
  // Categorize changes
  const toCreate: LocalTranslation[] = [];
  const toUpdate: { local: LocalTranslation; sanity: SanityDoc; lockEntry?: LockEntry }[] = [];
  const toUndeprecate: { local: LocalTranslation; sanity: SanityDoc }[] = [];
  const toDeprecate: SanityDoc[] = [];
  const conflicts: { lockKey: string; reason: string }[] = [];
  const skipped: string[] = [];
  
  // Check each local translation
  for (const [lockKey, local] of localTranslations) {
    const sanityDoc = sanityState.get(lockKey);
    const lockEntry = lockFile?.entries[lockKey];
    const localHash = hashTranslation(local);
    
    if (!sanityDoc) {
      // New translation - create it
      toCreate.push(local);
    } else if (sanityDoc.deprecated) {
      // Was deprecated, now exists locally again - undeprecate
      toUndeprecate.push({ local, sanity: sanityDoc });
    } else {
      // Exists in both - check if changed
      const sanityHash = hashTranslation({
        namespace: sanityDoc.namespace,
        key: sanityDoc.key,
        en: sanityDoc.en,
        no: sanityDoc.no,
      });
      
      if (localHash === sanityHash) {
        // No change
        skipped.push(lockKey);
      } else if (!lockEntry) {
        // No lock entry - can't verify, push if forced
        if (FORCE) {
          toUpdate.push({ local, sanity: sanityDoc });
        } else {
          conflicts.push({ 
            lockKey, 
            reason: 'No lock entry - cannot verify if Sanity was modified. Use --force to override.' 
          });
        }
      } else if (lockEntry._rev !== sanityDoc._rev) {
        // Sanity was modified since last pull - conflict!
        conflicts.push({ 
          lockKey, 
          reason: `Sanity was modified (rev changed from ${lockEntry._rev.slice(0, 8)}... to ${sanityDoc._rev.slice(0, 8)}...)` 
        });
      } else if (lockEntry.hash !== localHash) {
        // Local was modified since last pull - safe to update
        toUpdate.push({ local, sanity: sanityDoc, lockEntry });
      } else {
        // Hash matches lock but not Sanity - Sanity was modified but _rev same?
        // This shouldn't happen, but handle it as a conflict
        conflicts.push({ 
          lockKey, 
          reason: 'Unexpected state - hash mismatch' 
        });
      }
    }
  }
  
  // Check for removed translations (in Sanity but not in local)
  for (const [lockKey, sanityDoc] of sanityState) {
    if (!localTranslations.has(lockKey) && !sanityDoc.deprecated) {
      toDeprecate.push(sanityDoc);
    }
  }
  
  // Print summary
  console.log('📊 Changes detected:');
  console.log(`   Create:      ${toCreate.length}`);
  console.log(`   Update:      ${toUpdate.length}`);
  console.log(`   Undeprecate: ${toUndeprecate.length}`);
  console.log(`   Deprecate:   ${toDeprecate.length}`);
  console.log(`   Skipped:     ${skipped.length}`);
  console.log(`   Conflicts:   ${conflicts.length}`);
  console.log('');
  
  // Show conflicts
  if (conflicts.length > 0) {
    console.log('⚠️  Conflicts (will not be pushed):');
    for (const { lockKey, reason } of conflicts.slice(0, 10)) {
      console.log(`   - ${lockKey}: ${reason}`);
    }
    if (conflicts.length > 10) {
      console.log(`   ... and ${conflicts.length - 10} more`);
    }
    console.log('');
  }
  
  if (DRY_RUN) {
    // Show what would be created
    if (toCreate.length > 0) {
      console.log('📝 Would create:');
      for (const t of toCreate.slice(0, 5)) {
        console.log(`   + ${t.namespace}.${t.key}`);
      }
      if (toCreate.length > 5) console.log(`   ... and ${toCreate.length - 5} more`);
      console.log('');
    }
    
    // Show what would be updated
    if (toUpdate.length > 0) {
      console.log('✏️  Would update:');
      for (const { local } of toUpdate.slice(0, 5)) {
        console.log(`   ~ ${local.namespace}.${local.key}`);
      }
      if (toUpdate.length > 5) console.log(`   ... and ${toUpdate.length - 5} more`);
      console.log('');
    }
    
    // Show what would be deprecated
    if (toDeprecate.length > 0) {
      console.log('🗑️  Would deprecate:');
      for (const doc of toDeprecate.slice(0, 5)) {
        console.log(`   ⚠️ ${doc.namespace}.${doc.key}`);
      }
      if (toDeprecate.length > 5) console.log(`   ... and ${toDeprecate.length - 5} more`);
      console.log('');
    }
    
    console.log('✅ Dry run complete. Use without --dry-run to apply changes.');
    return;
  }
  
  // Execute changes
  let created = 0;
  let updated = 0;
  let undeprecated = 0;
  let deprecated = 0;
  let failed = 0;
  
  // Create new translations
  for (const local of toCreate) {
    try {
      const docId = generateDocId(local.namespace, local.key);
      await client.createOrReplace({
        _id: docId,
        _type: 'translation',
        namespace: local.namespace,
        key: local.key,
        en: local.en,
        no: local.no,
        deprecated: false,
      });
      created++;
      console.log(`   ✓ Created: ${local.namespace}.${local.key}`);
    } catch (error: any) {
      failed++;
      console.error(`   ✗ Failed to create ${local.namespace}.${local.key}: ${error.message}`);
    }
  }
  
  // Update existing translations (with optimistic locking)
  for (const { local, sanity, lockEntry } of toUpdate) {
    try {
      // Use patch with ifRevisionId for optimistic locking
      await client
        .patch(sanity._id)
        .ifRevisionId(lockEntry?._rev || sanity._rev)
        .set({
          en: local.en,
          no: local.no,
          deprecated: false,
          deprecatedAt: undefined,
        })
        .commit();
      updated++;
      console.log(`   ✓ Updated: ${local.namespace}.${local.key}`);
    } catch (error: any) {
      if (error.message?.includes('revision')) {
        conflicts.push({ 
          lockKey: `${local.namespace}.${local.key}`, 
          reason: 'Revision mismatch during update' 
        });
      }
      failed++;
      console.error(`   ✗ Failed to update ${local.namespace}.${local.key}: ${error.message}`);
    }
  }
  
  // Undeprecate translations
  for (const { local, sanity } of toUndeprecate) {
    try {
      await client
        .patch(sanity._id)
        .set({
          en: local.en,
          no: local.no,
          deprecated: false,
          deprecatedAt: undefined,
        })
        .commit();
      undeprecated++;
      console.log(`   ✓ Undeprecated: ${local.namespace}.${local.key}`);
    } catch (error: any) {
      failed++;
      console.error(`   ✗ Failed to undeprecate ${local.namespace}.${local.key}: ${error.message}`);
    }
  }
  
  // Deprecate removed translations (soft delete)
  for (const doc of toDeprecate) {
    try {
      await client
        .patch(doc._id)
        .set({
          deprecated: true,
          deprecatedAt: new Date().toISOString(),
        })
        .commit();
      deprecated++;
      console.log(`   ✓ Deprecated: ${doc.namespace}.${doc.key}`);
    } catch (error: any) {
      failed++;
      console.error(`   ✗ Failed to deprecate ${doc.namespace}.${doc.key}: ${error.message}`);
    }
  }
  
  // Final summary
  console.log('\n📊 Results:');
  console.log(`   Created:      ${created}`);
  console.log(`   Updated:      ${updated}`);
  console.log(`   Undeprecated: ${undeprecated}`);
  console.log(`   Deprecated:   ${deprecated}`);
  console.log(`   Failed:       ${failed}`);
  console.log(`   Conflicts:    ${conflicts.length}`);
  
  if (conflicts.length > 0) {
    console.log('\n⚠️  Some translations had conflicts. Run `npm run i18n:pull` to sync and resolve.');
  }
  
  if (failed === 0 && conflicts.length === 0) {
    console.log('\n✅ Push complete! Run `npm run i18n:pull` to update the lock file.');
  } else {
    console.log('\n⚠️  Push completed with issues. Review the output above.');
  }
}

push().catch((error) => {
  console.error('❌ Push failed:', error);
  process.exit(1);
});
