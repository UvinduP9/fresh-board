'use client';

import { I18nProvider, useI18n } from '@/lib/I18nContext';
import Layout from '@/components/Layout';

function AboutContent() {
  const { t } = useI18n();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('about.title')}</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('about.mission.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('about.mission.description')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('about.howItWorks.title')}</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('about.howItWorks.step1.title')}</h3>
                  <p className="text-gray-700">
                    {t('about.howItWorks.step1.description')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('about.howItWorks.step2.title')}</h3>
                  <p className="text-gray-700">
                    {t('about.howItWorks.step2.description')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('about.howItWorks.step3.title')}</h3>
                  <p className="text-gray-700">
                    {t('about.howItWorks.step3.description')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('about.whyChoose.title')}</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>{t('about.whyChoose.freshLocal.title')}</strong> {t('about.whyChoose.freshLocal.description')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>{t('about.whyChoose.transparentPricing.title')}</strong> {t('about.whyChoose.transparentPricing.description')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>{t('about.whyChoose.supportLocal.title')}</strong> {t('about.whyChoose.supportLocal.description')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>{t('about.whyChoose.easyCommunication.title')}</strong> {t('about.whyChoose.easyCommunication.description')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>{t('about.whyChoose.noMiddleman.title')}</strong> {t('about.whyChoose.noMiddleman.description')}</span>
              </li>
            </ul>
          </section>

          <section className="bg-primary-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('about.community.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('about.community.description')}
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default function AboutPage() {
  return (
    <I18nProvider>
      <AboutContent />
    </I18nProvider>
  );
}
