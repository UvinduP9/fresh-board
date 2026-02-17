import { Product, Vendor, Category, Location } from '@/types/product';
import { Translations } from '@/types/i18n';

export const getTranslatedProduct = (product: Product, translations: Translations | null): Product => {
  if (!translations || !product.translationKey) return product;
  
  const translated = translations.content.products[product.translationKey];
  if (!translated) return product;
  
  return {
    ...product,
    title: translated.title,
    description: translated.description,
  };
};

export const getTranslatedVendor = (vendor: Vendor, translations: Translations | null): Vendor => {
  if (!translations || !vendor.translationKey) return vendor;
  
  const translated = translations.content.vendors[vendor.translationKey];
  if (!translated) return vendor;
  
  return {
    ...vendor,
    name: translated.name,
    description: translated.description,
  };
};

export const getTranslatedCategory = (category: Category, translations: Translations | null): string => {
  if (!translations || !category.translationKey) return category.name;
  
  return translations.content.categories[category.translationKey] || category.name;
};

export const getTranslatedLocation = (location: Location, translations: Translations | null): string => {
  if (!translations || !location.translationKey) return location.name;
  
  return translations.content.locations[location.translationKey] || location.name;
};
