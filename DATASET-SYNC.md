# Dataset Sync Script

## Purpose

Sync translations between Sanity datasets (e.g., `testing` → `production`).

Use this when:
- Testing dataset is up to date and you want to promote changes to production
- Production is behind and needs to catch up with testing
- You want to sync between any two datasets

## Usage

### Preview Changes (Dry Run)
```bash
npx tsx scripts/sync-datasets.ts testing production --dry-run
```

### Apply Changes
```bash
npx tsx scripts/sync-datasets.ts testing production
```

### Force Mode (Skip Optimistic Locking)
```bash
npx tsx scripts/sync-datasets.ts testing production --force
```

## How It Works

1. **Fetch translations** from both source and target datasets
2. **Compare** translations using content hashing
3. **Categorize** changes:
   - **Create**: New translations in source that don't exist in target
   - **Update**: Translations that changed between source and target
   - **Undeprecate**: Translations deprecated in target but active in source
   - **Deprecate**: Translations removed from source (soft delete in target)
4. **Apply changes** in batches (up to 200 mutations per transaction)

## Features

### Diff Detection
Compares content hash of each translation to detect actual changes, ignoring `_rev` differences that don't affect content.

### Batched Operations
Uses Sanity's transaction API to batch up to 200 mutations per request, making it efficient for large datasets.

### Optimistic Locking
By default, uses `_rev` to detect if target documents were modified. If conflicts are detected, the operation fails for those documents.

Use `--force` to skip this check and overwrite target changes.

### Soft Delete
When translations are removed from source, they're marked as `deprecated: true` in target instead of being hard deleted.

## Example Output

```bash
$ npx tsx scripts/sync-datasets.ts testing production --dry-run

🔄 Syncing translations: testing → production

🔍 DRY RUN MODE - No changes will be made

📥 Fetching translations from testing...
   Found 150 translations in testing

📥 Fetching translations from production...
   Found 103 translations in production

📊 Changes detected:
   Create:      47
   Update:      12
   Undeprecate: 2
   Deprecate:   5
   Skipped:     84
   Conflicts:   0

📝 Would create:
   + home.newFeature.title
   + home.newFeature.description
   + about.team.member1.name
   ... and 44 more

✏️  Would update:
   ~ home.hero.title
   ~ browse.filters.category
   ... and 10 more

🗑️  Would deprecate:
   ⚠️ home.oldFeature.title
   ... and 4 more

✅ Dry run complete. Remove --dry-run to apply changes.
```

## NPM Script

Add to `package.json`:
```json
{
  "scripts": {
    "i18n:sync-datasets": "tsx scripts/sync-datasets.ts"
  }
}
```

Then use:
```bash
npm run i18n:sync-datasets testing production --dry-run
```

## Common Workflows

### Promote Testing to Production
```bash
# 1. Preview changes
npx tsx scripts/sync-datasets.ts testing production --dry-run

# 2. Apply changes
npx tsx scripts/sync-datasets.ts testing production

# 3. Pull to update lock file
npm run i18n:pull
```

### Backfill Production from Testing
If production is months behind:
```bash
# Use force mode to overwrite any production changes
npx tsx scripts/sync-datasets.ts testing production --force
```

### Sync Between Any Datasets
```bash
# From staging to production
npx tsx scripts/sync-datasets.ts staging production --dry-run

# From production to development
npx tsx scripts/sync-datasets.ts production development --dry-run
```

## Performance

- **Small sync** (< 100 changes): ~5-10 seconds
- **Medium sync** (100-1000 changes): ~30-60 seconds  
- **Large sync** (1000-10000 changes): ~2-5 minutes

Thanks to batching, it can handle thousands of translations efficiently.

## Safety

- Always run `--dry-run` first to preview changes
- Uses optimistic locking by default to prevent overwrites
- Soft deletes (deprecation) instead of hard deletes
- Shows detailed logs for each batch operation

## Troubleshooting

### "revision" errors
Target dataset was modified while syncing. Re-run the command or use `--force`.

### Permission errors
Ensure `SANITY_API_TOKEN` in `.env.local` has write access to both datasets.

### Missing translations after sync
Check if they were deprecated. Query Sanity: `*[_type == "translation" && deprecated == true]`
