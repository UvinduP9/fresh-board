import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  apiVersion: '2026-02-17',
  token: process.env.SANITY_API_TOKEN,
})

async function deleteAllTranslations() {
  console.log('🗑️  Deleting all existing translation documents...\n')
  
  // Delete all documents of type 'translation'
  const result = await client.delete({
    query: '*[_type == "translation"]'
  })
  
  console.log(`✅ Deleted ${result.results?.length || 0} translation documents\n`)
  console.log('✨ Dataset cleared successfully!')
}

deleteAllTranslations().catch(error => {
  console.error('❌ Error deleting translations:', error)
  process.exit(1)
})
