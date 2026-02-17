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

// Unflatten dot notation back to nested objects
function unflattenObject(flattened: Record<string, string>): any {
  const result: any = {}
  
  for (const [key, value] of Object.entries(flattened)) {
    const keys = key.split('.')
    let current = result
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
  }
  
  return result
}

async function syncTranslationsFromSanity() {
  console.log('🚀 Starting translation sync from Sanity...\n')
  
  const query = '*[_type == "translation"]{ locale, namespace, key, value }'
  const translations = await client.fetch(query)
  
  console.log(`📊 Fetched ${translations.length} translations from Sanity\n`)
  
  for (const locale of LOCALES) {
    for (const namespace of NAMESPACES) {
      const filteredTranslations = translations.filter(
        (t: any) => t.locale === locale && t.namespace === namespace
      )
      
      if (filteredTranslations.length === 0) {
        console.log(`⚠️  No translations found for ${locale}/${namespace}`)
        continue
      }
      
      const flattened: Record<string, string> = {}
      filteredTranslations.forEach((t: any) => {
        flattened[t.key] = t.value
      })
      
      const nested = unflattenObject(flattened)
      
      const dirPath = path.join(process.cwd(), 'locales', locale)
      const filePath = path.join(dirPath, `${namespace}.json`)
      
      // Ensure directory exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
      
      // Write JSON file with pretty formatting
      fs.writeFileSync(filePath, JSON.stringify(nested, null, 2) + '\n')
      
      console.log(`✅ Updated ${locale}/${namespace}.json (${filteredTranslations.length} keys)`)
    }
  }
  
  console.log('\n✨ Translation sync from Sanity completed successfully!')
}

// Run the sync
syncTranslationsFromSanity().catch(error => {
  console.error('❌ Error syncing translations:', error)
  process.exit(1)
})
