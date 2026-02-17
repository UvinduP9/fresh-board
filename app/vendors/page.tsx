'use client';

import Link from 'next/link';
import { I18nProvider } from '@/lib/I18nContext';
import { useI18n } from '@/lib/I18nContext';
import Layout from '@/components/Layout';
import { vendors, mockProducts } from '@/lib/mockData';

function VendorsContent() {
  const { t, translations } = useI18n();

  const getVendorProductCount = (vendorId: string) => {
    return mockProducts.filter(p => p.vendor.id === vendorId && p.inStock).length;
  };

  const getTranslatedVendor = (vendor: any) => {
    if (vendor.translationKey && translations.content.vendors[vendor.translationKey]) {
      return translations.content.vendors[vendor.translationKey];
    }
    return { name: vendor.name, description: vendor.description };
  };

  const getTranslatedLocation = (location: any) => {
    if (location.translationKey && translations.content.locations[location.translationKey]) {
      return translations.content.locations[location.translationKey];
    }
    return location.name;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('vendors.title')}</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map(vendor => {
            const translatedVendor = getTranslatedVendor(vendor);
            const translatedLocation = getTranslatedLocation(vendor.location);
            
            return (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{translatedVendor.name}</h2>
                <p className="text-gray-600 mb-4">{translatedVendor.description}</p>
              
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {translatedLocation}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {vendor.phone}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-primary-600 font-medium">
                    {getVendorProductCount(vendor.id)} {t('vendors.productsAvailable')}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

export default function VendorsPage() {
  return (
    <I18nProvider>
      <VendorsContent />
    </I18nProvider>
  );
}
