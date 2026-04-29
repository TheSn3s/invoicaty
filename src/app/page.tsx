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
const audienceIcons = ["✦", "◌", "◈", "◎", "▣", "△"];

export default function Home() {
  const { t, lang } = useI18n();
  const isArabic = lang === "ar";

  const landing = isArabic ? ar.landing : en.landing;

  const features = landing.features.items as { title: string; desc: string }[];
  const trustItems = landing.trust.items as string[];
  const problemPoints = landing.problem.points as string[];
  const solutionTags = landing.solution.tags as string[];
  const steps = landing.workflow.steps as { title: string; desc: string }[];
  const globalItems = landing.global.items as string[];
  const outputPoints = landing.output.points as string[];
  const audiences = landing.audience.items as string[];
  const faqs = landing.faq.items as { q: string; a: string }[];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06111f] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(58,130,246,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.16),_transparent_28%),radial-gradient(circle_at_50%_100%,_rgba(168,85,247,0.14),_transparent_30%)]" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(59,130,246,0.12)]">
              <img src="/logo-dark.png" alt="Invoicaty" className="h-7 w-auto" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-[0.18em] text-white">INVOICATY</div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{t("landing.brandTagline")}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <LanguageSwitcher className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 hover:bg-white/10" />
            <Link
              href="/login"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:inline-flex"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-[0_16px_40px_rgba(59,130,246,0.28)] transition hover:scale-[1.02]"
            >
              {t("landing.hero.primaryCta")}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-12 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pb-28 md:pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              {t("landing.hero.eyebrow")}
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              {t("landing.hero.title")}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              {t("landing.hero.desc")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-base font-bold text-slate-950 transition hover:bg-slate-200"
              >
                {t("landing.hero.primaryCta")}
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-6 py-4 text-base font-bold text-white transition hover:bg-white/10"
              >
                {t("landing.hero.secondaryCta")}
              </a>
            </div>

            <p className="mt-5 text-sm text-slate-400">{t("landing.hero.supporting")}</p>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-purple-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(10,15,28,0.96))] p-4 shadow-[0_30px_80px_rgba(2,8,23,0.6)]">
              <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Invoicaty</div>
                    <div className="mt-1 text-lg font-bold text-white">{t("landing.mockup.dashboardTitle")}</div>
                  </div>
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {t("landing.mockup.paidBadge")}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{t("landing.mockup.invoiceLabel")}</div>
                        <div className="mt-1 text-base font-bold text-white">#1042</div>
                      </div>
                      <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
                        {t("landing.mockup.invoiceStatus")}
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>{t("landing.mockup.client")}</span>
                        <span className="font-semibold text-white">Sn3s Studio</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>{t("landing.mockup.project")}</span>
                        <span className="font-semibold text-white">Travel Campaign</span>
                      </div>
                      <div className="h-px bg-white/8" />
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>{t("landing.mockup.subtotal")}</span>
                        <span className="font-semibold text-white">2,400.000 KWD</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>{t("landing.mockup.tax")}</span>
                        <span className="font-semibold text-white">0%</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-3 text-sm text-slate-200">
                        <span>{t("landing.mockup.total")}</span>
                        <span className="text-lg font-black text-white">2,400.000 KWD</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{t("landing.mockup.quotationLabel")}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-base font-bold text-white">#Q-208</div>
                        <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                          {t("landing.mockup.quotationStatus")}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{t("landing.mockup.quotationDesc")}</p>
                      <div className="mt-4 rounded-xl border border-dashed border-cyan-400/20 bg-cyan-400/6 px-3 py-3 text-sm font-semibold text-cyan-200">
                        {t("landing.mockup.convertAction")}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{t("landing.mockup.settingsLabel")}</div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[t("landing.mockup.country"), t("landing.mockup.currency"), t("landing.mockup.language"), t("landing.mockup.taxRate")].map((item, index) => (
                          <div key={index} className="rounded-xl border border-white/6 bg-slate-900/80 px-3 py-3 text-sm text-slate-300">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 xl:grid-cols-4 xl:p-5">
            {Array.isArray(trustItems) && trustItems.map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-3 rounded-2xl border border-white/6 bg-slate-950/50 px-4 py-4 text-sm text-slate-200">
                <span className="text-cyan-300">{trustIcons[index] || "✦"}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-24 md:grid-cols-2 md:px-8">
          <div className="rounded-[2rem] border border-rose-300/10 bg-rose-300/5 p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-200/80">{t("landing.problem.eyebrow")}</div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">{t("landing.problem.title")}</h2>
            <ul className="mt-8 space-y-4 text-base leading-8 text-slate-300">
              {problemPoints.map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-1 text-rose-300">—</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-emerald-300/10 bg-emerald-300/5 p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/80">{t("landing.solution.eyebrow")}</div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">{t("landing.solution.title")}</h2>
            <p className="mt-6 text-base leading-8 text-slate-300">{t("landing.solution.desc")}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {solutionTags.map((tag: string, index: number) => (
                <div key={index} className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 text-sm font-semibold text-white">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-4 md:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">{t("landing.features.eyebrow")}</div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">{t("landing.features.title")}</h2>
            <p className="mt-5 text-base leading-8 text-slate-300">{t("landing.features.desc")}</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.isArray(features) && features.map((feature: any, index: number) => (
              <article key={index} className="group rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.05]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  {featureIcons[index]}
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">{t("landing.workflow.eyebrow")}</div>
              <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">{t("landing.workflow.title")}</h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">{t("landing.workflow.desc")}</p>
            </div>

            <div className="grid gap-4">
              {Array.isArray(steps) && steps.map((step: any, index: number) => (
                <div key={index} className="flex gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-4 md:px-8">
          <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,47,73,0.7),rgba(17,24,39,0.96),rgba(67,56,202,0.35))] p-8 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">{t("landing.global.eyebrow")}</div>
                <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">{t("landing.global.title")}</h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-slate-200/90">{t("landing.global.desc")}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {Array.isArray(globalItems) && globalItems.map((item: string, index: number) => (
                  <div key={index} className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-5 py-5 text-sm font-semibold text-white backdrop-blur-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 md:px-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className={`order-2 ${isArabic ? "lg:order-1" : "lg:order-2"}`}>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {["modern", "classic", "minimal"].map((template, index) => (
                  <div key={template} className={`${index === 2 ? "sm:col-span-2" : ""} rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white">{t(`landing.output.templates.${template}.title`)}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">PDF</div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 rounded-full bg-white/10" />
                      <div className="h-2 w-4/5 rounded-full bg-white/10" />
                      <div className="h-16 rounded-2xl border border-white/6 bg-white/[0.04]" />
                      <div className="flex gap-2">
                        <div className="h-2 flex-1 rounded-full bg-white/10" />
                        <div className="h-2 w-1/4 rounded-full bg-cyan-300/40" />
                      </div>
                    </div>
                    <p className="mt-4 text-xs leading-6 text-slate-400">{t(`landing.output.templates.${template}.desc`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`order-1 ${isArabic ? "lg:order-2" : "lg:order-1"}`}>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">{t("landing.output.eyebrow")}</div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">{t("landing.output.title")}</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">{t("landing.output.desc")}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {outputPoints.map((point: string, index: number) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-white">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-4 md:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">{t("landing.audience.eyebrow")}</div>
              <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">{t("landing.audience.title")}</h2>
              <p className="mt-5 text-base leading-8 text-slate-300">{t("landing.audience.desc")}</p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.isArray(audiences) && audiences.map((item: string, index: number) => (
                <div key={index} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-4 text-sm font-semibold text-white">
                  <span className="text-cyan-300">{audienceIcons[index] || "✦"}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-24 md:px-8">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">{t("landing.faq.eyebrow")}</div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">{t("landing.faq.title")}</h2>
          </div>

          <div className="mt-10 space-y-4">
            {Array.isArray(faqs) && faqs.map((item: any, index: number) => (
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
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">{t("landing.finalCta.eyebrow")}</div>
              <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">{t("landing.finalCta.title")}</h2>
              <p className="mt-5 text-base leading-8 text-slate-100/85">{t("landing.finalCta.desc")}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/register" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-base font-bold text-slate-950 transition hover:bg-slate-200">
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
