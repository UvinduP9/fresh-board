'use client';

import { I18nProvider, useI18n } from '@/lib/I18nContext';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { mockProducts } from '@/lib/mockData';
import Link from 'next/link';

function HomeContent() {
  const { t } = useI18n();
  const featuredProducts = mockProducts.filter(p => p.featured && p.inStock).slice(0, 6);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
          <Link
            href="/browse"
            className="inline-block mt-8 px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            {t('home.hero.browseButton')}
          </Link>
        </div>

        {/* Today's Highlights */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('home.highlights.title')}</h2>
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
            <h3 className="text-xl font-semibold mb-2">{t('home.features.fresh.title')}</h3>
            <p className="text-gray-600">
              {t('home.features.fresh.description')}
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.pricing.title')}</h3>
            <p className="text-gray-600">
              {t('home.features.pricing.description')}
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.contact.title')}</h3>
            <p className="text-gray-600">
              {t('home.features.contact.description')}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function Home() {
  return (
    <I18nProvider>
      <HomeContent />
    </I18nProvider>
  );
}
