"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AppFooter from "@/components/AppFooter";

export default function Home() {
  const { t } = useI18n();
  const features = [
    { icon: "⚡", titleKey: "home.features.0.title", descKey: "home.features.0.desc" },
    { icon: "📄", titleKey: "home.features.1.title", descKey: "home.features.1.desc" },
    { icon: "💼", titleKey: "home.features.2.title", descKey: "home.features.2.desc" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-5 py-4 md:px-12 md:py-6">
        <div className="flex items-center gap-2">
          <img src="/logo-dark.png" alt="Invoicaty" className="h-9 w-auto" />
          <span className="text-lg font-bold text-white">Invoicaty</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/login" className="bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/10">
            {t("nav.login")}
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 text-center pb-20">
        <div className="fade-in max-w-lg">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            {t("home.title")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {t("home.subtitle")}
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-md mx-auto">
            {t("home.desc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-blue-500/20 transition-all">
              {t("home.cta")}
            </Link>
            <Link href="/login" className="glass hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all">
              {t("home.hasAccount")}
            </Link>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-2xl fade-in">
          {features.map((f, i) => (
            <article key={i} className="glass rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h2 className="font-bold text-white text-sm mb-1">{t(f.titleKey)}</h2>
              <p className="text-slate-400 text-xs">{t(f.descKey)}</p>
            </article>
          ))}
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
