'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, Translations } from '@/types/i18n';
import { loadTranslations, DEFAULT_LOCALE } from '@/lib/i18n';

interface I18nContextType {
  locale: Locale;
  translations: Translations | null;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode; initialLocale?: Locale }> = ({
  children,
  initialLocale = DEFAULT_LOCALE,
}) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [translations, setTranslations] = useState<Translations | null>(null);

  useEffect(() => {
    // Load from localStorage if available
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'no')) {
      setLocaleState(savedLocale);
    }
  }, []);

  useEffect(() => {
    console.log('[I18nContext] Loading translations for locale:', locale);
    loadTranslations(locale).then((loaded) => {
      console.log('[I18nContext] Translations loaded successfully:', {
        locale,
        hasHome: !!loaded.home,
        homeKeys: loaded.home ? Object.keys(loaded.home) : [],
        homeStructure: loaded.home,
        hasHomeHero: !!(loaded.home as any)?.hero,
        homeHeroTitle: (loaded.home as any)?.hero?.title,
      });
      setTranslations(loaded);
    }).catch((error) => {
      console.error('[I18nContext] Failed to load translations:', error);
    });
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    if (!translations) return key;
    
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ locale, translations, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
