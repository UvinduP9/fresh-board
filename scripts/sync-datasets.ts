/**
 * Sync translations between Sanity datasets
 * 
 * This script syncs translations from a source dataset to a target dataset.
 * Useful for promoting changes from testing → production.
 * 
 * Usage:
 *   npx tsx scripts/sync-datasets.ts testing production [--dry-run] [--force]
 * 
 * Features:
 * - Detects diffs between source and target datasets
 * - Creates missing translations
 * - Updates changed translations
 * - Marks removed translations as deprecated (soft delete)
 * - Uses optimistic locking to prevent overwrites (unless --force)
 * - Batches operations for performance (up to 200 mutations per transaction)
 * 
 * Options:
 *   --dry-run    Preview changes without applying them
 *   --force      Skip optimistic locking (overwrite target changes)
 */

import { createClient } from '@sanity/client';
import * as crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Parse CLI args
const args = process.argv.slice(2);
const sourceDataset = args[0];
const targetDataset = args[1];
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');

if (!sourceDataset || !targetDataset) {
  console.error('❌ Usage: npx tsx scripts/sync-datasets.ts <source> <target> [--dry-run] [--force]');
  console.error('   Example: npx tsx scripts/sync-datasets.ts testing production --dry-run');
  process.exit(1);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const token = process.env.SANITY_API_TOKEN!;

if (!projectId || !token) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_API_TOKEN');
  process.exit(1);
}

// Create clients for source and target datasets
const sourceClient = createClient({
  projectId,
  dataset: sourceDataset,
  useCdn: false,
  apiVersion: '2024-01-01',
  token,
});

const targetClient = createClient({
  projectId,
  dataset: targetDataset,
  useCdn: false,
  apiVersion: '2024-01-01',
  token,
});

interface Translation {
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
function hashTranslation(item: Translation): string {
  const content = JSON.stringify({
    namespace: item.namespace,
    key: item.key,
    en: item.en,
    no: item.no,
  });
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Fetch all translations from a dataset
 */
async function fetchTranslations(client: any, datasetName: string): Promise<Map<string, Translation>> {
  console.log(`📥 Fetching translations from ${datasetName}...`);
  
  const query = `*[_type == "translation"] | order(namespace asc, key asc) {
    _id,
    _rev,
    namespace,
    key,
    en,
    no,
    deprecated,
    deprecatedAt
  }`;
  
  const results: Translation[] = await client.fetch(query);
  console.log(`   Found ${results.length} translations in ${datasetName}\n`);
  
  const map = new Map<string, Translation>();
  for (const doc of results) {
    const key = `${doc.namespace}.${doc.key}`;
    map.set(key, doc);
  }
  
  return map;
}

/**
 * Batch operations into chunks
 */
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function sync() {
  console.log(`🔄 Syncing translations: ${sourceDataset} → ${targetDataset}\n`);
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  if (FORCE) {
    console.log('⚠️  FORCE MODE - Optimistic locking disabled\n');
  }
  
  // Fetch translations from both datasets
  const sourceTranslations = await fetchTranslations(sourceClient, sourceDataset);
  const targetTranslations = await fetchTranslations(targetClient, targetDataset);
  
  // Categorize changes
  const toCreate: Translation[] = [];
  const toUpdate: { source: Translation; target: Translation }[] = [];
  const toUndeprecate: { source: Translation; target: Translation }[] = [];
  const toDeprecate: Translation[] = [];
  const conflicts: { key: string; reason: string }[] = [];
  const skipped: string[] = [];
  
  // Check each source translation
  for (const [key, source] of sourceTranslations) {
    const target = targetTranslations.get(key);
    const sourceHash = hashTranslation(source);
    
    if (!target) {
      // New translation in source - create in target
      if (!source.deprecated) {
        toCreate.push(source);
      }
    } else if (source.deprecated && !target.deprecated) {
      // Deprecated in source but active in target - deprecate in target
      toDeprecate.push(target);
    } else if (!source.deprecated && target.deprecated) {
      // Active in source but deprecated in target - undeprecate in target
      toUndeprecate.push({ source, target });
    } else if (!source.deprecated && !target.deprecated) {
      // Both active - check if changed
      const targetHash = hashTranslation(target);
      
      if (sourceHash === targetHash) {
        // No change
        skipped.push(key);
      } else {
        // Changed - check for conflicts
        if (!FORCE) {
          // In non-force mode, we should ideally check if target was modified since source's last sync
          // For now, we'll just update it and rely on _rev for conflict detection
          toUpdate.push({ source, target });
        } else {
          toUpdate.push({ source, target });
        }
      }
    } else {
      // Both deprecated - skip
      skipped.push(key);
    }
  }
  
  // Check for translations that exist only in target (removed from source)
  for (const [key, target] of targetTranslations) {
    if (!sourceTranslations.has(key) && !target.deprecated) {
      // Exists in target but not in source - deprecate in target
      toDeprecate.push(target);
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
  
  if (DRY_RUN) {
    // Show what would be created
    if (toCreate.length > 0) {
      console.log('📝 Would create:');
      for (const t of toCreate.slice(0, 10)) {
        console.log(`   + ${t.namespace}.${t.key}`);
      }
      if (toCreate.length > 10) console.log(`   ... and ${toCreate.length - 10} more`);
      console.log('');
    }
    
    // Show what would be updated
    if (toUpdate.length > 0) {
      console.log('✏️  Would update:');
      for (const { source } of toUpdate.slice(0, 10)) {
        console.log(`   ~ ${source.namespace}.${source.key}`);
      }
      if (toUpdate.length > 10) console.log(`   ... and ${toUpdate.length - 10} more`);
      console.log('');
    }
    
    // Show what would be undeprecated
    if (toUndeprecate.length > 0) {
      console.log('🔄 Would undeprecate:');
      for (const { source } of toUndeprecate.slice(0, 10)) {
        console.log(`   ↩️  ${source.namespace}.${source.key}`);
      }
      if (toUndeprecate.length > 10) console.log(`   ... and ${toUndeprecate.length - 10} more`);
      console.log('');
    }
    
    // Show what would be deprecated
    if (toDeprecate.length > 0) {
      console.log('🗑️  Would deprecate:');
      for (const doc of toDeprecate.slice(0, 10)) {
        console.log(`   ⚠️ ${doc.namespace}.${doc.key}`);
      }
      if (toDeprecate.length > 10) console.log(`   ... and ${toDeprecate.length - 10} more`);
      console.log('');
    }
    
    console.log('✅ Dry run complete. Remove --dry-run to apply changes.');
    return;
  }
  
  // Execute changes with batching
  let created = 0;
  let updated = 0;
  let undeprecated = 0;
  let deprecated = 0;
  let failed = 0;
  
  const BATCH_SIZE = 200; // Sanity transaction limit
  
  // Create new translations (batched)
  if (toCreate.length > 0) {
    console.log(`\n📝 Creating ${toCreate.length} translations...`);
    const batches = chunk(toCreate, BATCH_SIZE);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`   Batch ${i + 1}/${batches.length}: ${batch.length} documents`);
      
      try {
        const transaction = targetClient.transaction();
        
        for (const source of batch) {
          transaction.createOrReplace({
            _id: source._id,
            _type: 'translation',
            namespace: source.namespace,
            key: source.key,
            en: source.en,
            no: source.no,
            deprecated: false,
          });
        }
        
        await transaction.commit();
        created += batch.length;
        console.log(`   ✓ Created ${batch.length} translations`);
      } catch (error: any) {
        failed += batch.length;
        console.error(`   ✗ Batch failed: ${error.message}`);
      }
    }
  }
  
  // Update existing translations (batched)
  if (toUpdate.length > 0) {
    console.log(`\n✏️  Updating ${toUpdate.length} translations...`);
    const batches = chunk(toUpdate, BATCH_SIZE);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`   Batch ${i + 1}/${batches.length}: ${batch.length} documents`);
      
      try {
        const transaction = targetClient.transaction();
        
        for (const { source, target } of batch) {
          const patch = transaction.patch(target._id);
          
          if (!FORCE) {
            patch.ifRevisionId(target._rev);
          }
          
          patch.set({
            en: source.en,
            no: source.no,
            deprecated: false,
            deprecatedAt: undefined,
          });
        }
        
        await transaction.commit();
        updated += batch.length;
        console.log(`   ✓ Updated ${batch.length} translations`);
      } catch (error: any) {
        if (error.message?.includes('revision')) {
          console.error(`   ✗ Batch had revision conflicts - some target documents were modified`);
        } else {
          console.error(`   ✗ Batch failed: ${error.message}`);
        }
        failed += batch.length;
      }
    }
  }
  
  // Undeprecate translations (batched)
  if (toUndeprecate.length > 0) {
    console.log(`\n🔄 Undeprecating ${toUndeprecate.length} translations...`);
    const batches = chunk(toUndeprecate, BATCH_SIZE);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`   Batch ${i + 1}/${batches.length}: ${batch.length} documents`);
      
      try {
        const transaction = targetClient.transaction();
        
        for (const { source, target } of batch) {
          transaction.patch(target._id).set({
            en: source.en,
            no: source.no,
            deprecated: false,
            deprecatedAt: undefined,
          });
        }
        
        await transaction.commit();
        undeprecated += batch.length;
        console.log(`   ✓ Undeprecated ${batch.length} translations`);
      } catch (error: any) {
        failed += batch.length;
        console.error(`   ✗ Batch failed: ${error.message}`);
      }
    }
  }
  
  // Deprecate removed translations (batched)
  if (toDeprecate.length > 0) {
    console.log(`\n🗑️  Deprecating ${toDeprecate.length} translations...`);
    const batches = chunk(toDeprecate, BATCH_SIZE);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`   Batch ${i + 1}/${batches.length}: ${batch.length} documents`);
      
      try {
        const transaction = targetClient.transaction();
        
        for (const target of batch) {
          transaction.patch(target._id).set({
            deprecated: true,
            deprecatedAt: new Date().toISOString(),
          });
        }
        
        await transaction.commit();
        deprecated += batch.length;
        console.log(`   ✓ Deprecated ${batch.length} translations`);
      } catch (error: any) {
        failed += batch.length;
        console.error(`   ✗ Batch failed: ${error.message}`);
      }
    }
  }
  
  // Final summary
  console.log('\n📊 Final Results:');
  console.log(`   Created:      ${created}`);
  console.log(`   Updated:      ${updated}`);
  console.log(`   Undeprecated: ${undeprecated}`);
  console.log(`   Deprecated:   ${deprecated}`);
  console.log(`   Failed:       ${failed}`);
  
  if (failed === 0) {
    console.log(`\n✅ Sync complete! ${sourceDataset} → ${targetDataset}`);
  } else {
    console.log(`\n⚠️  Sync completed with ${failed} failures. Review the output above.`);
  }
}

sync().catch((error) => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});
