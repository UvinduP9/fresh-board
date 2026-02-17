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

export interface HomeTranslations {
  hero: {
    title: string;
    subtitle: string;
    browseButton: string;
  };
  highlights: {
    title: string;
  };
  features: {
    fresh: {
      title: string;
      description: string;
    };
    pricing: {
      title: string;
      description: string;
    };
    contact: {
      title: string;
      description: string;
    };
  };
}

export interface Translations {
  navigation: NavigationTranslations;
  browse: BrowseTranslations;
  product: ProductTranslations;
  common: CommonTranslations;
  home: HomeTranslations;
}

export interface LocaleData {
  locale: Locale;
  translations: Translations;
}
