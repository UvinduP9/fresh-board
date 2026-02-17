import { Product, Vendor, Category, Location } from '@/types/product';
import { Translations } from '@/types/i18n';

export const getTranslatedProduct = (product: Product, translations: Translations | null): Product => {
  if (!translations || !product.translationKey) return product;
  if (!translations.content || !translations.content.products) return product;
  
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
  if (!translations.content || !translations.content.vendors) return vendor;
  
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
  if (!translations.content || !translations.content.categories) return category.name;
  
  return translations.content.categories[category.translationKey] || category.name;
};

export const getTranslatedLocation = (location: Location, translations: Translations | null): string => {
  if (!translations || !location.translationKey) return location.name;
  if (!translations.content || !translations.content.locations) return location.name;
  
  return translations.content.locations[location.translationKey] || location.name;
};
