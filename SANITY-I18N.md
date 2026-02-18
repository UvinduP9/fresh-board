# Sanity i18n Translation System

This document describes the translation synchronization system between local JSON files and Sanity CMS.

## Overview

The translation system uses a **bidirectional sync** approach:
- **Pull**: Sanity → `locales/` (source of truth for production)
- **Push**: `locales/` → Sanity (for development changes)

All translations are stored in Sanity as the single source of truth, with local JSON files serving as a working copy for development and version control.

## Architecture

### Sanity Schema

Translations are stored in Sanity with the following structure:

```typescript
{
  _id: "home-hero.title",           // Generated: {namespace}-{key}
  _type: "translation",
  _rev: "abc123...",                // Sanity revision (changes on edit)
  namespace: "home",                // e.g., home, browse, about, etc.
  key: "hero.title",                // Dot-notation path
  en: "Welcome to FreshBoard",      // English translation
  no: "Velkommen til FreshBoard",   // Norwegian translation
  deprecated: false,                // Soft delete flag
  deprecatedAt: null                // When deprecated
}
```

### Local File Structure

```
locales/
├── .sanity-i18n-lock.json    # Lock file for change tracking
├── en/
│   ├── home.json
│   ├── browse.json
│   ├── about.json
│   └── ...
└── no/
    ├── home.json
    ├── browse.json
    ├── about.json
    └── ...
```

### Lock File

The lock file (`locales/.sanity-i18n-lock.json`) tracks the state of each translation:

```json
{
  "version": 1,
  "dataset": "production",
  "lastPulled": "2026-02-17T08:11:48.994Z",
  "entries": {
    "home.hero.title": {
      "_id": "home-hero.title",
      "_rev": "6sxUO8wEGOXoiYpipN3HwF",
      "hash": "a050203db3d68f1e"
    }
  }
}
```

- `_id`: Sanity document ID
- `_rev`: Sanity revision at time of pull
- `hash`: SHA256 fingerprint of translation content (for change detection)

## Commands

### Pull (Sanity → Local)

```bash
npm run i18n:pull
```

Fetches all published translations from Sanity and writes them to local JSON files.

**Features:**
- Generates nested JSON structure from flat keys
- Creates/updates lock file with `_id`, `_rev`, and content hash
- Idempotent: running twice produces no file changes
- Reports added/updated/unchanged/removed counts

**Example output:**
```
🔄 Pulling translations from Sanity...

📥 Fetched 103 translation documents from Sanity

📊 Summary:
   Total translations: 103
   Added: 0
   Updated: 2
   Unchanged: 101
   Removed: 0
   Files written: 2
   Lock file updated: yes

✅ Pull complete!
```

### Push (Local → Sanity)

```bash
npm run i18n:push        # Push changes
npm run i18n:push:dry    # Preview without pushing
```

Pushes local changes to Sanity, using optimistic locking to prevent overwrites.

**Features:**
- Only pushes diffs (not everything)
- Uses `_rev` for optimistic locking (detects conflicts)
- Auto-creates missing keys in Sanity
- Soft deletes removed keys (marks as `deprecated: true`)
- Dry-run mode for previewing changes

**Example output:**
```
🚀 Pushing translations to Sanity...

📂 Found 103 translations in local files
☁️  Found 103 translations in Sanity

📊 Changes detected:
   Create:      2
   Update:      1
   Undeprecate: 0
   Deprecate:   1
   Skipped:     99
   Conflicts:   0

   ✓ Created: home.newFeature.title
   ✓ Created: home.newFeature.description
   ✓ Updated: home.hero.title
   ✓ Deprecated: home.oldFeature.title

✅ Push complete! Run `npm run i18n:pull` to update the lock file.
```

## Workflow

### Standard Development Workflow

```
1. npm run i18n:pull          # Sync latest from Sanity
2. Edit locales/*.json        # Make your changes
3. npm run i18n:push:dry      # Preview what will change
4. npm run i18n:push          # Push to Sanity
5. npm run i18n:pull          # Update lock file
6. git commit                 # Commit changes
```

### Handling Conflicts

If someone edited translations in Sanity Studio after your last pull:

```
📊 Changes detected:
   Conflicts:   2

⚠️  Conflicts (will not be pushed):
   - home.hero.title: Sanity was modified (rev changed)
   - about.mission.description: Sanity was modified (rev changed)
```

**Resolution:**
1. Run `npm run i18n:pull` to get latest from Sanity
2. Manually merge your changes if needed
3. Run `npm run i18n:push` again

### Force Push (Use with Caution)

```bash
npx tsx scripts/push-to-sanity.ts --force
```

Skips conflict detection. Only use when you're certain your local version should overwrite Sanity.

## Soft Delete (Deprecation)

When a translation key is removed from local files, it is **not** deleted from Sanity. Instead:

1. The `deprecated` field is set to `true`
2. The `deprecatedAt` timestamp is recorded
3. The translation remains in Sanity for reference

In Sanity Studio, deprecated translations appear with a warning icon:
```
⚠️ home.oldFeature.title
EN: Old Feature | NO: Gammel funksjon (DEPRECATED)
```

If you later add the key back to local files, it will be **undeprecated** automatically.

## API Route

The app fetches translations at runtime via an API route that has access to the Sanity token:

```
GET /api/translations?locale=en
```

This is necessary because the Sanity dataset has restricted public access. The API route runs server-side with the `SANITY_API_TOKEN` for full access.

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token
```

## Namespaces

Supported namespaces:
- `navigation` - Header/footer navigation
- `browse` - Browse/search page
- `product` - Product details
- `common` - Shared UI elements
- `home` - Home page
- `content` - Dynamic content (categories, locations, vendors)
- `vendors` - Vendors page
- `about` - About page

## Scripts Location

- `scripts/pull-from-sanity.ts` - Pull implementation
- `scripts/push-to-sanity.ts` - Push implementation
- `sanity/schemaTypes/translation.ts` - Sanity schema

## Troubleshooting

### "No lock file found"
Run `npm run i18n:pull` first to establish baseline.

### "Sanity was modified" conflicts
Someone edited in Sanity Studio. Pull first, then merge your changes.

### Missing translations at runtime
Check browser console for API errors. Ensure `SANITY_API_TOKEN` is set.

### Translations not updating
Clear the in-memory cache by restarting the dev server, or wait 5 minutes for cache expiry.
