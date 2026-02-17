# FreshBoard - Sanity CMS Integration

## Overview

FreshBoard uses Sanity CMS for managing translations in a bilingual (English/Norwegian) application. The system allows bidirectional sync between local JSON files and Sanity Studio.

## Setup

### 1. Sanity Configuration

The project is already connected to Sanity:
- **Project ID**: `laz2ju6r`
- **Dataset**: `production`
- **Studio URL**: http://localhost:3000/studio (when running dev server)

### 2. Create API Token

To enable syncing, you need to create a Sanity API token:

1. Go to https://www.sanity.io/manage
2. Select the `fresh-board` project
3. Go to **API** → **Tokens**
4. Click **Add API Token**
5. Name it "Translation Sync Token"
6. Permissions: **Editor** (or **Admin** if you want full access)
7. Copy the token

### 3. Add Token to Environment

Add the token to `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID="laz2ju6r"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-token-here"
```

## Translation Schema

The Sanity schema includes a `translation` document type with:
- **locale**: `en` or `no`
- **namespace**: `navigation`, `browse`, `product`, `common`, `home`, `content`, `vendors`, `about`
- **key**: Dot-notation path (e.g., `home.hero.title`)
- **value**: The translated text
- **description**: Optional context/notes

## Sync Commands

### Sync Local JSON → Sanity (Upload)

```bash
npm run sync:to-sanity
```

This will:
- Read all JSON files from `locales/en/` and `locales/no/`
- Flatten nested objects into dot notation
- Upload all translations to Sanity
- Create or replace existing documents

### Sync Sanity → Local JSON (Download)

```bash
npm run sync:from-sanity
```

This will:
- Fetch all translations from Sanity
- Group by locale and namespace
- Unflatten dot notation back to nested objects
- Overwrite local JSON files

## Workflow

### Initial Setup (First Time)
1. Run `npm run sync:to-sanity` to populate Sanity with existing translations
2. Access Sanity Studio at http://localhost:3000/studio
3. Verify translations are loaded

### Regular Workflow

**Option A: Edit in Sanity Studio (Recommended)**
1. Go to http://localhost:3000/studio
2. Edit translations in the UI
3. Run `npm run sync:from-sanity` to update local JSON files
4. Restart Next.js dev server to see changes

**Option B: Edit Local Files**
1. Edit JSON files in `locales/en/` or `locales/no/`
2. Run `npm run sync:to-sanity` to upload to Sanity
3. Changes are immediately reflected in Sanity Studio

## Translation Namespaces

| Namespace | Description | Example Keys |
|-----------|-------------|--------------|
| `navigation` | Menu items | `home`, `browse`, `vendors`, `about` |
| `browse` | Browse page UI | `title`, `searchPlaceholder`, `filters.category` |
| `product` | Product detail UI | `price`, `vendor`, `contactVendor` |
| `common` | Shared UI strings | `loading`, `error`, `clearFilters` |
| `home` | Home page content | `hero.title`, `features.fresh.title` |
| `content` | Product/vendor data | `products.organicTomatoes.title` |
| `vendors` | Vendors page | `title`, `productsAvailable` |
| `about` | About page | `mission.title`, `howItWorks.step1.title` |

## Key Features

1. **Bidirectional Sync**: Changes can flow both ways (local ↔ Sanity)
2. **Dot Notation**: Nested JSON objects are flattened for easy editing
3. **Batch Operations**: Efficient syncing with Sanity's transaction API
4. **Type Safety**: Full TypeScript support for translation keys
5. **30+ Translation Keys**: Comprehensive coverage for testing sync workflows

## Development

Start the Next.js dev server:
```bash
npm run dev
```

Access Sanity Studio:
```
http://localhost:3000/studio
```

View the app:
```
http://localhost:3000
```

## Troubleshooting

### Error: "Missing environment variable: SANITY_API_TOKEN"
- Make sure you've added the API token to `.env.local`
- Restart the terminal/script after adding the token

### Translations not updating
- After syncing FROM Sanity, restart the Next.js dev server
- Translations are loaded at build time, not runtime

### Permission errors in Sanity
- Ensure your API token has **Editor** or **Admin** permissions
- Check that you're logged in with the correct email (`kalpa.20231481@iit.ac.lk`)
