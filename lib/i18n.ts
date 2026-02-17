import { Locale, Translations } from '@/types/i18n';

const loadTranslations = async (locale: Locale): Promise<Translations> => {
  const [navigation, browse, product, common, home] = await Promise.all([
    import(`@/locales/${locale}/navigation.json`),
    import(`@/locales/${locale}/browse.json`),
    import(`@/locales/${locale}/product.json`),
    import(`@/locales/${locale}/common.json`),
    import(`@/locales/${locale}/home.json`),
  ]);

  return {
    navigation: navigation.default,
    browse: browse.default,
    product: product.default,
    common: common.default,
    home: home.default,
  };
};

export { loadTranslations };

export const SUPPORTED_LOCALES: Locale[] = ['en', 'no'];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  no: 'Norsk',
};
