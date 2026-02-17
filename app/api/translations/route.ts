import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// Server-side Sanity client with token for authenticated access
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Server-side token for full access
});

interface SanityTranslation {
  namespace: string;
  key: string;
  en: string;
  no: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';

  // Validate locale
  if (locale !== 'en' && locale !== 'no') {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
  }

  try {
    // Fetch all translations from Sanity with token
    const query = `*[_type == "translation"]{ namespace, key, en, no }`;
    const results: SanityTranslation[] = await sanityClient.fetch(query);

    console.log(`[API] Fetched ${results.length} translation documents from Sanity`);

    // Group by namespace and extract values for the requested locale
    const namespaces: Record<string, Record<string, string>> = {};

    for (const item of results) {
      if (!namespaces[item.namespace]) {
        namespaces[item.namespace] = {};
      }
      // Use the locale field (en or no) to get the value
      namespaces[item.namespace][item.key] = item[locale as 'en' | 'no'];
    }

    // Return grouped translations
    return NextResponse.json({
      locale,
      count: results.length,
      namespaces,
    });
  } catch (error) {
    console.error('[API] Failed to fetch translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}
