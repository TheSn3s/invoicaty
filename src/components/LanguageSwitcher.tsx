'use client';

import { useI18n } from '@/lib/i18n';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-700/50 text-slate-400 hover:text-white ${className}`}
      title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
    >
      {lang === 'ar' ? '🌐 EN' : '🌐 عربي'}
    </button>
  );
}
