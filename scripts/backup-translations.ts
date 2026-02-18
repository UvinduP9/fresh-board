/**
 * Backup translations from Sanity to a specified folder
 * 
 * This script:
 * 1. Fetches all translations from Sanity (from specified dataset)
 * 2. Organizes them by namespace and locale
 * 3. Saves them as JSON files in the specified backup folder
 * 
 * Usage: 
 *   tsx scripts/backup-translations.ts [backup-folder]
 *   tsx scripts/backup-translations.ts --dataset=testing backups/2024-02-18
 * 
 * Options:
 *   --dataset    Source dataset (defaults to .env.local value)
 *   [folder]     Backup folder path (defaults to backups/YYYY-MM-DD-HHmmss)
 */

import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Parse CLI args
const args = process.argv.slice(2);
const datasetArg = args.find(arg => arg.startsWith('--dataset='));
const DATASET = datasetArg ? datasetArg.split('=')[1] : process.env.NEXT_PUBLIC_SANITY_DATASET!;

// Get backup folder from args or use default (project root)
const backupFolderArg = args.find(arg => !arg.startsWith('--'));
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '-');
const BACKUP_FOLDER = backupFolderArg || `backup-${DATASET}-${timestamp}`;

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

const SUPPORTED_LOCALES = ['en', 'no'] as const;
const NAMESPACES = ['navigation', 'browse', 'product', 'common', 'home', 'content', 'vendors', 'about'];

interface SanityTranslation {
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
 * Unflatten dot-notation keys to nested object
 */
function unflatten(flat: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      if (!(part in current)) {
        current[part] = {};
      } else if (typeof current[part] !== 'object') {
        // Handle conflict: if current[part] is a string but we need it to be an object
        // Store the string value under a special '_value' key
        current[part] = { _value: current[part] };
      }
      
      current = current[part];
    }
    
    const lastPart = parts[parts.length - 1];
    
    if (typeof current[lastPart] === 'object' && !Array.isArray(current[lastPart])) {
      // If it's already an object, store the value under '_value'
      current[lastPart]._value = value;
    } else {
      current[lastPart] = value;
    }
  }
  
  return result;
}

/**
 * Fetch all translations from Sanity
 */
async function fetchTranslations(): Promise<SanityTranslation[]> {
  const query = `*[_type == "translation" && !deprecated]{ _id, _rev, namespace, key, en, no, deprecated, deprecatedAt } | order(namespace asc, key asc)`;
  return await client.fetch(query);
}

/**
 * Organize translations by namespace and locale
 */
function organizeByNamespaceAndLocale(translations: SanityTranslation[]): Map<string, Map<string, Record<string, string>>> {
  // Map<namespace, Map<locale, flatTranslations>>
  const organized = new Map<string, Map<string, Record<string, string>>>();
  
  for (const translation of translations) {
    const { namespace, key, en, no } = translation;
    
    if (!organized.has(namespace)) {
      organized.set(namespace, new Map());
    }
    
    const namespaceMap = organized.get(namespace)!;
    
    // Add to EN locale
    if (!namespaceMap.has('en')) {
      namespaceMap.set('en', {});
    }
    namespaceMap.get('en')![key] = en;
    
    // Add to NO locale
    if (!namespaceMap.has('no')) {
      namespaceMap.set('no', {});
    }
    namespaceMap.get('no')![key] = no;
  }
  
  return organized;
}

/**
 * Save translations to backup folder
 */
function saveToBackupFolder(organized: Map<string, Map<string, Record<string, string>>>, backupPath: string): void {
  // Create backup folder structure
  for (const locale of SUPPORTED_LOCALES) {
    const localeDir = path.join(backupPath, locale);
    fs.mkdirSync(localeDir, { recursive: true });
  }
  
  // Write JSON files
  for (const [namespace, localeMap] of organized) {
    for (const [locale, flatTranslations] of localeMap) {
      const nested = unflatten(flatTranslations);
      const filePath = path.join(backupPath, locale, `${namespace}.json`);
      fs.writeFileSync(filePath, JSON.stringify(nested, null, 2) + '\n', 'utf-8');
      console.log(`   ✓ Saved: ${locale}/${namespace}.json`);
    }
  }
}

/**
 * Create metadata file with backup info
 */
function saveMetadata(backupPath: string, translationCount: number): void {
  const metadata = {
    dataset: DATASET,
    timestamp: new Date().toISOString(),
    translationCount,
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  };
  
  const metadataPath = path.join(backupPath, 'backup-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n', 'utf-8');
  console.log(`   ✓ Saved: backup-metadata.json`);
}

async function backup() {
  console.log('📦 Backing up translations from Sanity...\n');
  console.log(`📍 Source dataset: ${DATASET}`);
  console.log(`📁 Backup folder: ${BACKUP_FOLDER}\n`);
  
  // Fetch translations
  console.log('⬇️  Fetching translations from Sanity...');
  const translations = await fetchTranslations();
  console.log(`   Found ${translations.size} translations\n`);
  
  if (translations.length === 0) {
    console.log('⚠️  No translations found in Sanity. Nothing to backup.');
    return;
  }
  
  // Organize by namespace and locale
  console.log('📋 Organizing translations...');
  const organized = organizeByNamespaceAndLocale(translations);
  console.log(`   Organized into ${organized.size} namespaces\n`);
  
  // Save to backup folder
  console.log('💾 Saving backup files...');
  saveToBackupFolder(organized, BACKUP_FOLDER);
  console.log('');
  
  // Save metadata
  console.log('📝 Saving metadata...');
  saveMetadata(BACKUP_FOLDER, translations.length);
  console.log('');
  
  // Summary
  console.log('✅ Backup complete!');
  console.log(`   Location: ${path.resolve(BACKUP_FOLDER)}`);
  console.log(`   Translations: ${translations.length}`);
  console.log(`   Namespaces: ${organized.size}`);
  console.log(`   Locales: ${SUPPORTED_LOCALES.length}`);
}

backup().catch((error) => {
  console.error('❌ Backup failed:', error);
  process.exit(1);
});
