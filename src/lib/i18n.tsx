'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Language } from './types';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

const translations: Record<Language, Record<string, any>> = { ar, en };

interface I18nContextValue {
  lang: Language;
  dir: 'rtl' | 'ltr';
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'ar',
  dir: 'rtl',
  setLang: () => {},
  t: (k) => k,
});

export function useI18n() {
  return useContext(I18nContext);
}

/**
 * Resolve a dot-separated key like "auth.loginTitle" from a nested object.
 */
function resolve(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

export function I18nProvider({
  children,
  initialLang = 'ar',
}: {
  children: React.ReactNode;
  initialLang?: Language;
}) {
  const [lang, setLangState] = useState<Language>(initialLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    // Persist preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('invoicaty-lang', newLang);
    }
    // Update <html> attributes live
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    // Switch font family
    document.body.style.fontFamily =
      newLang === 'ar'
        ? 'var(--font-tajawal), sans-serif'
        : 'var(--font-inter), sans-serif';
  }, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('invoicaty-lang') as Language | null;
    if (stored && (stored === 'ar' || stored === 'en')) {
      setLang(stored);
    }
  }, [setLang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string>): string => {
      let value = resolve(translations[lang], key);
      if (value === undefined) {
        // Fallback to English, then return key
        value = resolve(translations['en'], key);
      }
      if (typeof value !== 'string') return key;
      // Replace {{var}} placeholders
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          value = (value as string).replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
        });
      }
      return value;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}
