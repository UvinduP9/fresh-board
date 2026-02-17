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
  productsFound: string;
  clearFiltersButton: string;
  allCategories: string;
  allLocations: string;
  sortBy: string;
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

export interface ContentTranslations {
  products: Record<string, { title: string; description: string }>;
  vendors: Record<string, { name: string; description: string }>;
  categories: Record<string, string>;
  locations: Record<string, string>;
}

export interface VendorsTranslations {
  title: string;
  productsAvailable: string;
}

export interface AboutTranslations {
  title: string;
  mission: {
    title: string;
    description: string;
  };
  howItWorks: {
    title: string;
    step1: {
      title: string;
      description: string;
    };
    step2: {
      title: string;
      description: string;
    };
    step3: {
      title: string;
      description: string;
    };
  };
  whyChoose: {
    title: string;
    freshLocal: {
      title: string;
      description: string;
    };
    transparentPricing: {
      title: string;
      description: string;
    };
    supportLocal: {
      title: string;
      description: string;
    };
    easyCommunication: {
      title: string;
      description: string;
    };
    noMiddleman: {
      title: string;
      description: string;
    };
  };
  community: {
    title: string;
    description: string;
  };
}

export interface Translations {
  navigation: NavigationTranslations;
  browse: BrowseTranslations;
  product: ProductTranslations;
  common: CommonTranslations;
  home: HomeTranslations;
  content: ContentTranslations;
  vendors: VendorsTranslations;
  about: AboutTranslations;
}

export interface LocaleData {
  locale: Locale;
  translations: Translations;
}
