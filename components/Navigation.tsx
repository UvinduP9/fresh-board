'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navigation() {
  const { t } = useI18n();
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: t('navigation.home') },
    { href: '/browse', label: t('navigation.browse') },
    { href: '/vendors', label: t('navigation.vendors') },
    { href: '/about', label: t('navigation.about') },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              FreshBoard
            </Link>
            <div className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                    pathname === item.href
                      ? 'text-primary-600'
                      : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
