'use client';

import { I18nProvider } from '@/lib/I18nContext';
import Layout from '@/components/Layout';

function AboutContent() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About FreshBoard</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              FreshBoard connects customers with local farmers and vendors across Norway, making 
              it easy to find fresh, locally-sourced produce at fair prices. We believe in 
              transparency, supporting local businesses, and bringing the freshest products to 
              your table.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Browse Products</h3>
                  <p className="text-gray-700">
                    Explore our catalog of fresh produce from local vendors. Filter by category, 
                    location, and price to find exactly what you need.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Check Prices & Availability</h3>
                  <p className="text-gray-700">
                    All prices are updated daily by our vendors, ensuring you always see the most 
                    current information and availability.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Contact Vendors Directly</h3>
                  <p className="text-gray-700">
                    Found something you like? Contact the vendor directly via WhatsApp to place 
                    your order or ask questions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose FreshBoard?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Fresh & Local:</strong> All products come directly from Norwegian farms and local vendors</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Transparent Pricing:</strong> See exactly what you're paying with daily updated prices</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Support Local:</strong> Every purchase supports local farmers and small businesses</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Easy Communication:</strong> Direct contact with vendors for personalized service</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>No Middleman:</strong> Connect directly with producers for the best prices</span>
              </li>
            </ul>
          </section>

          <section className="bg-primary-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-gray-700 mb-4">
              Whether you're a customer looking for fresh produce or a vendor wanting to reach 
              more customers, FreshBoard is here to help. Together, we're building a more 
              sustainable and connected food system in Norway.
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
