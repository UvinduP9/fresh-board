/**
 * Pull translations from Sanity → locales/
 * 
 * This script:
 * 1. Fetches all published translation documents from Sanity
 * 2. Generates JSON files in locales/{locale}/{namespace}.json
 * 3. Maintains a lock file to track changes and ensure idempotency
 * 
 * Usage: npx tsx scripts/pull-from-sanity.ts
 */

import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

const LOCALES_DIR = path.join(process.cwd(), 'locales');
const LOCK_FILE = path.join(LOCALES_DIR, '.sanity-i18n-lock.json');
const SUPPORTED_LOCALES = ['en', 'no'] as const;

interface SanityTranslation {
  _id: string;
  _rev: string;
  namespace: string;
  key: string;
  en: string;
  no: string;
}

interface LockEntry {
  _id: string;
  _rev: string;
  hash: string; // Hash of the translation content
}

interface LockFile {
  version: 1;
  dataset: string;
  lastPulled: string;
  entries: Record<string, LockEntry>; // keyed by "namespace.key"
}

/**
 * Create a hash of translation content for change detection
 */
function hashTranslation(item: SanityTranslation): string {
  const content = JSON.stringify({
    namespace: item.namespace,
    key: item.key,
    en: item.en,
    no: item.no,
  });
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Unflatten a flat key-value object into nested structure
 * e.g., { "hero.title": "Hello" } → { hero: { title: "Hello" } }
 * 
 * Handles conflicts where a key is both a value and a parent:
 * - "hero.title" = "Hello" AND "hero.title.new" = "World"
 * - In this case, we store the value with a special "_value" key
 */
function unflatten(flatData: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  
  // Sort keys by length (shorter first) to ensure parents are created before children
  const sortedKeys = Object.keys(flatData).sort((a, b) => {
    const aDepth = a.split('.').length;
    const bDepth = b.split('.').length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.localeCompare(b);
  });
  
  for (const key of sortedKeys) {
    const value = flatData[key];
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      } else if (typeof current[part] === 'string') {
        // Conflict: this path was a leaf value but now needs to be a parent
        // Convert to object and store original value with _value key
        const existingValue = current[part];
        current[part] = { _value: existingValue };
        console.warn(`⚠️  Key conflict: "${parts.slice(0, i + 1).join('.')}" is both a value and a parent. Using _value for the leaf.`);
      }
      current = current[part];
    }
    
    const lastPart = parts[parts.length - 1];
    if (lastPart in current && typeof current[lastPart] === 'object') {
      // This key already exists as a parent object, store value with _value
      current[lastPart]._value = value;
      console.warn(`⚠️  Key conflict: "${key}" is both a value and a parent. Using _value for the leaf.`);
    } else {
      current[lastPart] = value;
    }
  }
  
  return result;
}

/**
 * Sort object keys recursively for consistent JSON output
 */
function sortObjectKeys(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    sorted[key] = sortObjectKeys(obj[key]);
  }
  
  return sorted;
}

/**
 * Load existing lock file or create empty one
 */
function loadLockFile(): LockFile {
  if (fs.existsSync(LOCK_FILE)) {
    try {
      const content = fs.readFileSync(LOCK_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('⚠️  Could not parse lock file, creating new one');
    }
  }
  
  return {
    version: 1,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    lastPulled: new Date().toISOString(),
    entries: {},
  };
}

/**
 * Save lock file
 */
function saveLockFile(lockFile: LockFile): void {
  const content = JSON.stringify(lockFile, null, 2) + '\n';
  fs.writeFileSync(LOCK_FILE, content, 'utf-8');
}

async function pull() {
  console.log('🔄 Pulling translations from Sanity...\n');
  
  // Fetch all translation documents
  const query = `*[_type == "translation"] | order(namespace asc, key asc) {
    _id,
    _rev,
    namespace,
    key,
    en,
    no
  }`;
  
  const results: SanityTranslation[] = await client.fetch(query);
  console.log(`📥 Fetched ${results.length} translation documents from Sanity\n`);
  
  if (results.length === 0) {
    console.log('⚠️  No translations found in Sanity');
    return;
  }
  
  // Load existing lock file
  const existingLock = loadLockFile();
  const newLock: LockFile = {
    version: 1,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    lastPulled: new Date().toISOString(),
    entries: {},
  };
  
  // Track changes
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  
  // Group translations by namespace and locale
  const byNamespaceAndLocale: Record<string, Record<string, Record<string, string>>> = {};
  
  for (const item of results) {
    const lockKey = `${item.namespace}.${item.key}`;
    const hash = hashTranslation(item);
    
    // Track in new lock file
    newLock.entries[lockKey] = {
      _id: item._id,
      _rev: item._rev,
      hash,
    };
    
    // Check if changed
    const existing = existingLock.entries[lockKey];
    if (!existing) {
      added++;
    } else if (existing.hash !== hash) {
      updated++;
    } else {
      unchanged++;
    }
    
    // Group by namespace and locale
    for (const locale of SUPPORTED_LOCALES) {
      if (!byNamespaceAndLocale[locale]) {
        byNamespaceAndLocale[locale] = {};
      }
      if (!byNamespaceAndLocale[locale][item.namespace]) {
        byNamespaceAndLocale[locale][item.namespace] = {};
      }
      byNamespaceAndLocale[locale][item.namespace][item.key] = item[locale];
    }
  }
  
  // Check for removed translations
  const removedKeys = Object.keys(existingLock.entries).filter(
    key => !newLock.entries[key]
  );
  
  // Write JSON files
  let filesWritten = 0;
  
  for (const locale of SUPPORTED_LOCALES) {
    const localeDir = path.join(LOCALES_DIR, locale);
    
    // Ensure directory exists
    if (!fs.existsSync(localeDir)) {
      fs.mkdirSync(localeDir, { recursive: true });
    }
    
    const namespaces = byNamespaceAndLocale[locale] || {};
    
    for (const [namespace, flatData] of Object.entries(namespaces)) {
      const filePath = path.join(localeDir, `${namespace}.json`);
      
      // Unflatten and sort for consistent output
      const nested = unflatten(flatData);
      const sorted = sortObjectKeys(nested);
      const content = JSON.stringify(sorted, null, 2) + '\n';
      
      // Check if file content changed
      let existingContent = '';
      if (fs.existsSync(filePath)) {
        existingContent = fs.readFileSync(filePath, 'utf-8');
      }
      
      if (content !== existingContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        filesWritten++;
      }
    }
  }
  
  // Only update lock file if something changed
  const lockChanged = 
    added > 0 || 
    updated > 0 || 
    removedKeys.length > 0 ||
    JSON.stringify(existingLock.entries) !== JSON.stringify(newLock.entries);
  
  if (lockChanged) {
    saveLockFile(newLock);
  }
  
  // Print summary
  console.log('📊 Summary:');
  console.log(`   Total translations: ${results.length}`);
  console.log(`   Added: ${added}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Unchanged: ${unchanged}`);
  console.log(`   Removed: ${removedKeys.length}`);
  console.log(`   Files written: ${filesWritten}`);
  console.log(`   Lock file updated: ${lockChanged ? 'yes' : 'no'}`);
  
  if (removedKeys.length > 0) {
    console.log('\n⚠️  Removed translations (no longer in Sanity):');
    for (const key of removedKeys.slice(0, 10)) {
      console.log(`   - ${key}`);
    }
    if (removedKeys.length > 10) {
      console.log(`   ... and ${removedKeys.length - 10} more`);
    }
  }
  
  console.log('\n✅ Pull complete!');
}

pull().catch((error) => {
  console.error('❌ Pull failed:', error);
  process.exit(1);
});
