"use client";

import Link from "next/link";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AppFooter from "@/components/AppFooter";

const featureIcons = [
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7.5h16M4 12h16M4 16.5h10" strokeLinecap="round" />
      <path d="M16.5 16.5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4.5h7l5 5V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 19V6A1.5 1.5 0 0 1 7.5 4.5Z" strokeLinejoin="round" />
      <path d="M14 4.5V10h5" strokeLinejoin="round" />
      <path d="M9 14h6M9 17h4" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 8h8M8 12h5" strokeLinecap="round" />
      <path d="M7 4.5h10A2.5 2.5 0 0 1 19.5 7v10A2.5 2.5 0 0 1 17 19.5H7A2.5 2.5 0 0 1 4.5 17V7A2.5 2.5 0 0 1 7 4.5Z" strokeLinejoin="round" />
      <path d="M14.5 14.5l4 4" strokeLinecap="round" />
      <circle cx="11" cy="14" r="2.5" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3.75c4.56 0 8.25 3.69 8.25 8.25S16.56 20.25 12 20.25 3.75 16.56 3.75 12 7.44 3.75 12 3.75Z" />
      <path d="M3.75 12h16.5M12 3.75a13 13 0 0 1 0 16.5M12 3.75a13 13 0 0 0 0 16.5" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z" />
      <path d="M8 9.5h8M8 14.5h5" strokeLinecap="round" />
      <path d="M3.5 8.5v7M20.5 8.5v7" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 6.5h10M7 10.5h10M7 14.5h6" strokeLinecap="round" />
      <path d="M6.5 4.5h11A2.5 2.5 0 0 1 20 7v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17V7a2.5 2.5 0 0 1 2.5-2.5Z" strokeLinejoin="round" />
      <path d="M15 16.5h4" strokeLinecap="round" />
    </svg>
  ),
];

const trustIcons = ["✦", "◎", "◌", "▣"];

export default function Home() {
  const { t, lang } = useI18n();
  const isArabic = lang === "ar";
  const landing = isArabic ? ar.landing : en.landing;

  const features = landing.features.items as { title: string; desc: string; shortDesc?: string }[];
  const trustItems = landing.trust.items as string[];
  const steps = landing.workflow.steps as { title: string; desc: string; shortDesc?: string }[];
  const outputPoints = landing.output.points as string[];
  const faqs = landing.faq.items as { q: string; a: string }[];

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

      <main className="relative z-10 flex-1">
        <section className="px-5 pt-6 pb-12 text-center md:px-8 md:pt-10 md:pb-16">
          <div className="fade-in max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-[1.2]">
              {t("landing.hero.titlePrefix")}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {t("landing.hero.titleHighlight")}
              </span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-xl mx-auto">
              {t("landing.hero.desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-blue-500/20 transition-all">
                {t("landing.hero.mobileCta")}
              </Link>
              <Link href="/login" className="glass hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all">
                {t("home.hasAccount")}
              </Link>
            </div>
            <p className="mt-4 text-sm font-semibold text-cyan-200">{t("landing.hero.ctaNote")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-3xl mx-auto fade-in">
            {[
              { icon: "⚡", title: t("home.features.0.title"), desc: t("home.features.0.desc") },
              { icon: "📄", title: t("quotation.title"), desc: t("landing.features.items.2.shortDesc") },
              { icon: "🌍", title: t("landing.features.items.3.title"), desc: t("landing.features.items.3.shortDesc") },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-5 text-center">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-bold text-white text-sm mb-1">{f.title}</div>
                <div className="text-slate-400 text-xs">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 xl:grid-cols-4 xl:p-5">
            {trustItems.map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-3 rounded-2xl border border-white/6 bg-slate-950/50 px-4 py-4 text-sm text-slate-200">
                <span className="text-cyan-300">{trustIcons[index] || "✦"}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className={`text-xs font-semibold text-cyan-200/80 ${isArabic ? "tracking-normal" : "uppercase tracking-[0.24em]"}`}>{t("landing.features.eyebrow")}</div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">{t("landing.features.title")}</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">{t("landing.features.shortDesc")}</p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <article key={index} className="group rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.05]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  {featureIcons[index]}
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{feature.shortDesc || feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className={`text-xs font-semibold text-cyan-200/80 ${isArabic ? "tracking-normal" : "uppercase tracking-[0.24em]"}`}>{t("landing.workflow.eyebrow")}</div>
              <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">{t("landing.workflow.title")}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">{t("landing.workflow.shortDesc")}</p>
            </div>

            <div className="grid gap-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{step.shortDesc || step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className={`order-2 ${isArabic ? "lg:order-1" : "lg:order-2"}`}>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {["modern", "classic", "minimal"].map((template, index) => (
                    <div key={template} className={`${index === 2 ? "sm:col-span-2" : ""} rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-white">{t(`landing.output.templates.${template}.title`)}</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">PDF</div>
                      </div>
                      <div className="mt-4 rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                        <div className="h-2 rounded-full bg-white/10" />
                        <div className="mt-2 h-2 w-4/5 rounded-full bg-white/10" />
                        <div className="mt-3 rounded-xl border border-white/6 bg-slate-900/80 p-3">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>INVOICE</span>
                            <span>#1042</span>
                          </div>
                          <div className="mt-3 h-12 rounded-xl bg-white/[0.04]" />
                          <div className="mt-3 flex gap-2">
                            <div className="h-2 flex-1 rounded-full bg-white/10" />
                            <div className="h-2 w-1/4 rounded-full bg-cyan-300/40" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`order-1 ${isArabic ? "lg:order-2" : "lg:order-1"}`}>
              <div className={`text-xs font-semibold text-cyan-200/80 ${isArabic ? "tracking-normal" : "uppercase tracking-[0.24em]"}`}>{t("landing.output.eyebrow")}</div>
              <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">{t("landing.output.title")}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">{t("landing.output.shortDesc")}</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {outputPoints.map((point: string, index: number) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-white">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-8 md:px-8">
          <div className="text-center">
            <div className={`text-xs font-semibold text-cyan-200/80 ${isArabic ? "tracking-normal" : "uppercase tracking-[0.24em]"}`}>{t("landing.faq.eyebrow")}</div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">{t("landing.faq.title")}</h2>
          </div>

          <div className="mt-8 space-y-4">
            {faqs.slice(0, 4).map((item, index) => (
              <details key={index} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-start text-base font-bold text-white marker:content-none">
                  <span>{item.q}</span>
                  <span className="text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-10 md:px-8">
          <div className="overflow-hidden rounded-[2.25rem] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(8,145,178,0.16),rgba(59,130,246,0.18))] p-8 text-center md:p-12">
            <div className="mx-auto max-w-3xl">
              <div className={`text-xs font-semibold text-cyan-100/80 ${isArabic ? "tracking-normal" : "uppercase tracking-[0.24em]"}`}>{t("landing.finalCta.eyebrow")}</div>
              <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">{t("landing.finalCta.title")}</h2>
              <p className="mt-5 text-base leading-8 text-slate-100/85">{t("landing.finalCta.desc")}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/register" className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-[0_18px_40px_rgba(37,99,235,0.35)] transition hover:bg-blue-500">
                  {t("landing.finalCta.primary")}
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-base font-bold text-white transition hover:bg-white/10">
                  {t("nav.login")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
