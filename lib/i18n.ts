import { Locale, Translations } from '@/types/i18n';

// In-memory cache for translations
const translationCache = new Map<Locale, { data: Translations; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const unflattenTranslations = (flatData: Record<string, string>): any => {
  // If no data, return empty object
  if (!flatData || Object.keys(flatData).length === 0) {
    return {};
  }
  
  const result: any = {};
  
  for (const [key, value] of Object.entries(flatData)) {
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  return result;
};

const loadTranslations = async (locale: Locale): Promise<Translations> => {
  // Check cache first
  const cached = translationCache.get(locale);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[i18n] Using cached translations for ${locale}`);
    return cached.data;
  }

  // Fetch from API route (which uses server-side token for full access)
  console.log(`[i18n] Fetching translations from API for ${locale}...`);
  try {
    const response = await fetch(`/api/translations?locale=${locale}`);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[i18n] API returned ${data.count} translation documents`);
    console.log(`[i18n] Namespaces from API:`, Object.keys(data.namespaces));

    const namespaces = data.namespaces;

    // Unflatten nested structures
    const translations: Translations = {
      navigation: unflattenTranslations(namespaces.navigation || {}),
      browse: unflattenTranslations(namespaces.browse || {}),
      product: unflattenTranslations(namespaces.product || {}),
      common: unflattenTranslations(namespaces.common || {}),
      home: unflattenTranslations(namespaces.home || {}),
      content: unflattenTranslations(namespaces.content || {}),
      vendors: unflattenTranslations(namespaces.vendors || {}),
      about: unflattenTranslations(namespaces.about || {}),
    };

    // Log home structure for debugging
    console.log('[i18n] Home structure after unflatten:', translations.home);

    // Cache the result
    translationCache.set(locale, { data: translations, timestamp: Date.now() });

    console.log(`[i18n] Successfully loaded and cached translations from API for ${locale}`);
    return translations;
  } catch (error) {
    console.error('[i18n] Failed to load translations from API:', error);
    // Fall through to local files
  }
  
  // Fallback to local files if API fails
  console.log(`[i18n] Loading translations from local files for ${locale}`);
  const [navigation, browse, product, common, home, content, vendors, about] = await Promise.all([
    import(`@/locales/${locale}/navigation.json`),
    import(`@/locales/${locale}/browse.json`),
    import(`@/locales/${locale}/product.json`),
    import(`@/locales/${locale}/common.json`),
    import(`@/locales/${locale}/home.json`),
    import(`@/locales/${locale}/content.json`),
    import(`@/locales/${locale}/vendors.json`),
    import(`@/locales/${locale}/about.json`),
  ]);

  const localTranslations = {
    navigation: navigation.default,
    browse: browse.default,
    product: product.default,
    common: common.default,
    home: home.default,
    content: content.default,
    vendors: vendors.default,
    about: about.default,
  };

  console.log(`[i18n] Loaded translations from local files for ${locale}`);
  return localTranslations;
};

export { loadTranslations };

export const SUPPORTED_LOCALES: Locale[] = ['en', 'no'];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  no: 'Norsk',
};
