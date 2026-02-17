export type Locale = 'en' | 'no';

export interface NavigationTranslations {
  home: string;
  browse: string;
  vendors: string;
  about: string;
}

export interface BrowseTranslations {
  title: string;
  searchPlaceholder: string;
  filters: {
    title: string;
    category: string;
    location: string;
    price: string;
    inStock: string;
  };
  sort: {
    latest: string;
    priceLow: string;
    priceHigh: string;
  };
  empty: {
    title: string;
    subtitle: string;
  };
}

export interface ProductTranslations {
  price: string;
  unit: string;
  updated: string;
  vendor: string;
  location: string;
  inStock: string;
  outOfStock: string;
  contactVendor: string;
}

export interface CommonTranslations {
  loading: string;
  error: string;
  retry: string;
  clearFilters: string;
  lastUpdated: string;
}

export interface Translations {
  navigation: NavigationTranslations;
  browse: BrowseTranslations;
  product: ProductTranslations;
  common: CommonTranslations;
}

export interface LocaleData {
  locale: Locale;
  translations: Translations;
}
