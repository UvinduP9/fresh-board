# Translation Commands

Quick reference for managing translations between local files and Sanity.

## Pull from Sanity → Local

```bash
npm run i18n:pull
```
Downloads all translations from Sanity to `locales/` folder. Uses dataset from `.env.local`.

## Push Local → Sanity

```bash
npm run i18n:push          # Push changes to current dataset
npm run i18n:push:dry      # Preview changes without pushing
npm run i18n:push:force    # Force push, skip conflict detection
```
Uploads local translation changes to Sanity. Only pushes differences.

### When to use `--force`

Use `--force` when you need to override conflict checks, such as:
- **Structural changes**: When a translation key changes from a string to an object (or vice versa)
  - Example: `hero.title: "Welcome"` → `hero.title.main: "Welcome"` and `hero.title.sub: "Subtitle"`
  - Force mode drops the old structure and creates the new one
- **No lock file**: When pushing without having run `i18n:pull` first
- **Resolving conflicts**: When Sanity was modified externally and you want to override with local changes

⚠️ **Warning**: Force mode skips optimistic locking. Use with caution to avoid overwriting concurrent changes.

## Backup Translations

```bash
npm run i18n:backup                    # Backup from current dataset
npm run i18n:backup:testing            # Backup from testing
npm run i18n:backup:production         # Backup from production
```
Exports translations to timestamped folder in `backups/`. Includes metadata file.

## Sync Between Datasets

```bash
npm run i18n:sync:dry      # Preview testing → production sync
npm run i18n:sync          # Sync testing → production
npm run i18n:sync:force    # Force sync, skip conflict checks
```
Copies translations from testing to production dataset.

## Dataset Configuration

Set target dataset in `.env.local`:
```
NEXT_PUBLIC_SANITY_DATASET="testing"    # Use testing dataset
NEXT_PUBLIC_SANITY_DATASET="production" # Use production dataset
```

## Workflow Example

1. Make changes to local JSON files in `locales/`
2. `npm run i18n:push` - Push to testing dataset
3. Test changes on frontend
4. `npm run i18n:backup:production` - Backup production (optional)
5. `npm run i18n:sync:dry` - Preview sync to production
6. `npm run i18n:sync` - Sync testing → production
7. Update `.env.local` to use production dataset
8. Restart dev server
