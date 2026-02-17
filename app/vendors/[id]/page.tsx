'use client';

import { use } from 'react';
import Link from 'next/link';
import { I18nProvider } from '@/lib/I18nContext';
import { useI18n } from '@/lib/I18nContext';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { vendors, mockProducts } from '@/lib/mockData';

function VendorDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n();
  const { id } = use(params);
  const vendor = vendors.find(v => v.id === id);
  const vendorProducts = mockProducts.filter(p => p.vendor.id === id);

  if (!vendor) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor not found</h1>
          <Link href="/vendors" className="text-primary-600 hover:text-primary-700">
            Back to Vendors
          </Link>
        </div>
      </Layout>
    );
  }

  const handleContactVendor = () => {
    if (vendor.whatsapp) {
      const message = encodeURIComponent(`Hi ${vendor.name}, I'm interested in your products.`);
      window.open(`https://wa.me/${vendor.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/vendors" className="text-primary-600 hover:text-primary-700 mb-6 inline-block">
          ← Back to Vendors
        </Link>

        {/* Vendor Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{vendor.name}</h1>
          <p className="text-lg text-gray-700 mb-6">{vendor.description}</p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Contact Information</h3>
              <p className="text-gray-900">{vendor.phone}</p>
              {vendor.whatsapp && (
                <p className="text-sm text-gray-600">WhatsApp available</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Location</h3>
              <p className="text-gray-900">{vendor.location.name}</p>
            </div>
          </div>

          {vendor.whatsapp && (
            <button
              onClick={handleContactVendor}
              className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact on WhatsApp
            </button>
          )}
        </div>

        {/* Vendor Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Products from {vendor.name}
          </h2>
          {vendorProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendorProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No products available from this vendor.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <I18nProvider>
      <VendorDetailContent params={params} />
    </I18nProvider>
  );
}
