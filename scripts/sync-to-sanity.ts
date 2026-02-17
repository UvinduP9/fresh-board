import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  apiVersion: '2026-02-17',
  token: process.env.SANITY_API_TOKEN,
})

const LOCALES = ['en', 'no']
const NAMESPACES = ['navigation', 'browse', 'product', 'common', 'home', 'content', 'vendors', 'about']

// Flatten nested objects into dot notation
function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {}
  
  for (const key in obj) {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey))
    } else if (typeof value === 'string') {
      flattened[newKey] = value
    }
  }
  
  return flattened
}

async function syncTranslationsToSanity() {
  console.log('🚀 Starting translation sync to Sanity...\n')
  
  // First, load all translations for both locales
  const translationsByKey: Record<string, { namespace: string; key: string; en: string; no: string }> = {}
  
  for (const namespace of NAMESPACES) {
    for (const locale of LOCALES) {
      const filePath = path.join(process.cwd(), 'locales', locale, `${namespace}.json`)
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${locale}/${namespace}.json (file not found)`)
        continue
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const translations = JSON.parse(fileContent)
      const flattenedTranslations = flattenObject(translations)
      
      console.log(`📝 Processing ${locale}/${namespace}.json (${Object.keys(flattenedTranslations).length} keys)`)
      
      for (const [key, value] of Object.entries(flattenedTranslations)) {
        const uniqueKey = `${namespace}-${key}`
        
        if (!translationsByKey[uniqueKey]) {
          translationsByKey[uniqueKey] = {
            namespace,
            key,
            en: '',
            no: '',
          }
        }
        
        translationsByKey[uniqueKey][locale as 'en' | 'no'] = value
      }
    }
  }
  
  // Create documents
  const documents = Object.entries(translationsByKey).map(([uniqueKey, data]) => ({
    _type: 'translation',
    _id: uniqueKey,
    namespace: data.namespace,
    key: data.key,
    en: data.en,
    no: data.no,
  }))
  
  console.log(`\n📊 Total documents to sync: ${documents.length}`)
  console.log('⬆️  Uploading to Sanity...\n')
  
  // Create or update documents in batches
  const batchSize = 100
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize)
    const transaction = client.transaction()
    
    batch.forEach(doc => {
      transaction.createOrReplace(doc)
    })
    
    await transaction.commit()
    console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`)
  }
  
  console.log('\n✨ Translation sync completed successfully!')
}

// Run the sync
syncTranslationsToSanity().catch(error => {
  console.error('❌ Error syncing translations:', error)
  process.exit(1)
})
