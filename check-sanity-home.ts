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

async function checkHomeTranslations() {
  const query = `*[_type == "translation" && namespace == "home"]{ _id, key, en, no } | order(key asc)`
  const results = await client.fetch(query)
  
  console.log(`Found ${results.length} translations in home namespace:\n`)
  results.forEach((item: any) => {
    console.log(`${item.key}:`)
    console.log(`  EN: ${item.en}`)
    console.log(`  NO: ${item.no}`)
    console.log('')
  })
}

checkHomeTranslations().catch(console.error)
