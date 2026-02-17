# FreshBoard

A local produce price board and mini catalog web app where customers can browse fresh produce and prices by area and vendor.

## Features

- **Browse Fresh Produce**: Grid view of products with filters for category, location, price range, and stock status
- **Product Details**: Detailed product pages with images, descriptions, vendor information, and contact options
- **Vendor Profiles**: Browse vendors and view all their available products
- **Multi-language Support**: Full internationalization support (English and Norwegian)
- **Direct Contact**: Easy WhatsApp integration to contact vendors directly
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Custom i18n system** with JSON translation files

## Translation System

The app uses a custom i18n system with the following structure:

### Translation Files

Located in `locales/[locale]/` directory:
- `navigation.json` - Navigation menu items
- `browse.json` - Browse page strings (filters, sort, empty states)
- `product.json` - Product detail page strings
- `common.json` - Common UI strings used across the app

### Supported Languages

- English (`en`)
- Norwegian (`no`)

### Usage

The app provides a `useI18n()` hook to access translations:

```tsx
const { t, locale, setLocale } = useI18n();

// Use translations
<h1>{t('browse.title')}</h1>
```

### Adding New Translation Keys

1. Add the key to all language files in `locales/*/[namespace].json`
2. Update the TypeScript types in `types/i18n.ts`
3. Use the key in your component with `t('namespace.key')`

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
freshboard/
├── app/                      # Next.js app directory
│   ├── browse/              # Browse products page
│   ├── product/[id]/        # Product detail page
│   ├── vendors/             # Vendors list and detail pages
│   ├── about/               # About page
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── Layout.tsx
│   ├── Navigation.tsx
│   ├── LanguageSwitcher.tsx
│   └── ProductCard.tsx
├── lib/                     # Utilities and data
│   ├── i18n.ts             # i18n utilities
│   ├── I18nContext.tsx     # i18n React context
│   └── mockData.ts         # Mock product/vendor data
├── locales/                 # Translation files
│   ├── en/                 # English translations
│   └── no/                 # Norwegian translations
└── types/                   # TypeScript type definitions
    ├── i18n.ts
    └── product.ts
```

## Data Model

### Product
- title, description
- price, unit (kg, g, bunch, item)
- category, vendor, location
- inStock status
- images
- updatedAt timestamp

### Vendor
- name
- phone, whatsapp
- location
- description

### Location
- name

### Category
- name

## Future Enhancements

- [ ] Sanity CMS integration for content management
- [ ] i18n sync scripts (`i18n:push`, `i18n:pull`)
- [ ] Webhook integration for automatic translation updates
- [ ] User favorites and shopping lists
- [ ] Price drop notifications
- [ ] Seasonal product badges

## License

MIT
