'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { I18nProvider } from '@/lib/I18nContext';
import { useI18n } from '@/lib/I18nContext';
import Layout from '@/components/Layout';
import { mockProducts } from '@/lib/mockData';

function ProductDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n();
  const { id } = use(params);
  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/browse" className="text-primary-600 hover:text-primary-700">
            Back to Browse
          </Link>
        </div>
      </Layout>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleContactVendor = () => {
    if (product.vendor.whatsapp) {
      const message = encodeURIComponent(
        `Hi, I'm interested in ${product.title} (${product.price} kr/${product.unit})`
      );
      window.open(`https://wa.me/${product.vendor.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/browse" className="text-primary-600 hover:text-primary-700 mb-6 inline-block">
          ← Back to Browse
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <div className="mb-4">
              {product.inStock ? (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                  {t('product.inStock')}
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                  {t('product.outOfStock')}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-primary-600">{product.price} kr</span>
              <span className="text-xl text-gray-600">/ {product.unit}</span>
            </div>

            <p className="text-lg text-gray-700 mb-8">{product.description}</p>

            <div className="border-t border-b border-gray-200 py-6 mb-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('product.category')}:</span>
                <span className="font-medium">{product.category.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('product.location')}:</span>
                <span className="font-medium">{product.location.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('product.updated')}:</span>
                <span className="font-medium text-sm">{formatDate(product.updatedAt)}</span>
              </div>
            </div>

            {/* Vendor Card */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">{t('product.vendor')}</h3>
              <Link href={`/vendors/${product.vendor.id}`} className="block mb-4 hover:text-primary-600">
                <p className="text-xl font-medium">{product.vendor.name}</p>
                {product.vendor.description && (
                  <p className="text-gray-600 text-sm mt-1">{product.vendor.description}</p>
                )}
              </Link>
              <div className="text-sm text-gray-600">
                <p>{product.vendor.phone}</p>
                <p>{product.location.name}</p>
              </div>
            </div>

            {/* Contact Button */}
            {product.vendor.whatsapp && product.inStock && (
              <button
                onClick={handleContactVendor}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t('product.contactVendor')}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <I18nProvider>
      <ProductDetailContent params={params} />
    </I18nProvider>
  );
}
