'use client';

import { I18nProvider } from '@/lib/I18nContext';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { mockProducts } from '@/lib/mockData';
import Link from 'next/link';

export default function Home() {
  const featuredProducts = mockProducts.filter(p => p.featured && p.inStock).slice(0, 6);

  return (
    <I18nProvider>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to FreshBoard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse today's fresh produce and prices from local vendors across Norway
            </p>
            <Link
              href="/browse"
              className="inline-block mt-8 px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>

          {/* Today's Highlights */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Today's Highlights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-2">Fresh & Local</h3>
              <p className="text-gray-600">
                All products sourced from local Norwegian farms
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Fair Prices</h3>
              <p className="text-gray-600">
                Updated daily for transparency and fairness
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Easy Contact</h3>
              <p className="text-gray-600">
                Direct contact with vendors via WhatsApp
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </I18nProvider>
  );
}
