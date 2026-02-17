import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

console.log('[sanityClient] Environment check:', {
  hasProjectId: !!projectId,
  hasDataset: !!dataset,
  projectId: projectId?.substring(0, 5) + '...',
  dataset,
});

// Only create client if environment variables are available (client-side)
export const sanityClient = projectId && dataset ? createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false, // Disable CDN to get fresh data (CDN was returning stale/cached data)
}) : null;

console.log('[sanityClient] Client created:', !!sanityClient);
