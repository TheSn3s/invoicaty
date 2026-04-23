"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Country, Currency, BusinessType } from "@/lib/types";

export const dynamic = "force-dynamic";

interface BizOption {
  value: BusinessType;
  icon: string;
  titleKey: string;
  descKey: string;
  gradient: string;
}

const BIZ_OPTIONS: BizOption[] = [
  { value: "influencer",     icon: "📱", titleKey: "onboarding.influencer",   descKey: "onboarding.influencerDesc",   gradient: "from-pink-500/20 to-purple-500/20" },
  { value: "freelancer",     icon: "🎨", titleKey: "onboarding.freelancer",   descKey: "onboarding.freelancerDesc",   gradient: "from-blue-500/20 to-cyan-500/20" },
  { value: "professional",   icon: "💼", titleKey: "onboarding.professional", descKey: "onboarding.professionalDesc", gradient: "from-emerald-500/20 to-teal-500/20" },
  { value: "commerce",       icon: "🛍️", titleKey: "onboarding.commerce",     descKey: "onboarding.commerceDesc",     gradient: "from-orange-500/20 to-amber-500/20" },
  { value: "small_business", icon: "🏢", titleKey: "onboarding.smallBiz",     descKey: "onboarding.smallBizDesc",     gradient: "from-indigo-500/20 to-blue-500/20" },
  { value: "other",          icon: "✨", titleKey: "onboarding.other",        descKey: "onboarding.otherDesc",        gradient: "from-slate-500/20 to-slate-600/20" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, lang } = useI18n();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>("");

  // Step 1
  const [businessType, setBusinessType] = useState<BusinessType | "">("");

  // Step 2
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("");
  const [taxRate, setTaxRate] = useState("0");

  // Step 3
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      // If already onboarded, skip straight to dashboard
      const { data: prof } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single();
      if (prof?.onboarding_completed) { router.push("/dashboard"); return; }

      const [{ data: c }, { data: cur }] = await Promise.all([
        supabase.from("countries").select("*").order("name_en"),
        supabase.from("currencies").select("*").order("code"),
      ]);
      setCountries(c || []);
      setCurrencies(cur || []);
      setLoading(false);
    })();
  }, [supabase, router]);

  const onCountryChange = (code: string) => {
    setCountryCode(code);
    const country = countries.find(c => c.code === code);
    if (country) {
      if (country.default_currency) setDefaultCurrency(country.default_currency);
      setTaxRate(String(country.default_tax_rate));
    }
  };

  const onLogoSelect = (file: File | null) => {
    if (!file) { setLogoFile(null); setLogoPreview(""); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Max 2MB"); return; }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string || "");
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !userId) return null;
    setUploading(true);
    try {
      const ext = logoFile.name.split('.').pop();
      const path = `${userId}/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("logos").upload(path, logoFile, { upsert: true });
      if (error) {
        console.error("Logo upload failed:", error);
        return null;
      }
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    let logo_url: string | null = null;
    if (logoFile) logo_url = await uploadLogo();

    const updates: Record<string, unknown> = {
      business_type: businessType || null,
      country_code: countryCode || null,
      default_currency: defaultCurrency || null,
      tax_rate: Number(taxRate) || 0,
      preferred_language: lang,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };
    if (logo_url) updates.logo_url = logo_url;

    await supabase.from("profiles").update(updates).eq("id", userId);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canNext1 = !!businessType;
  const canNext2 = !!countryCode && !!defaultCurrency;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 md:px-8 flex items-center justify-between border-b border-slate-700/30">
        <div className="flex items-center gap-2.5">
          <img src="/logo-dark.png" alt="Invoicaty" className="h-8 w-auto" />
          <h1 className="text-sm font-bold text-white">Invoicaty</h1>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Progress */}
      <div className="px-4 md:px-8 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-bold">{t("onboarding.step", { current: String(step), total: "3" })}</span>
          <span className="text-xs text-blue-400 font-bold">{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 md:px-8 py-6 max-w-2xl mx-auto w-full">
        {/* STEP 1 — Business Type */}
        {step === 1 && (
          <div className="fade-in">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{t("onboarding.step1Title")}</h2>
            <p className="text-slate-400 text-sm mb-6">{t("onboarding.step1Subtitle")}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BIZ_OPTIONS.map(opt => {
                const selected = businessType === opt.value;
                return (
                  <button key={opt.value} onClick={() => setBusinessType(opt.value)}
                    className={`relative text-${lang === 'ar' ? 'right' : 'left'} p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      selected
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                        : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
                    }`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center text-2xl mb-3`}>
                      {opt.icon}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{t(opt.titleKey)}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{t(opt.descKey)}</p>
                    {selected && (
                      <div className={`absolute top-3 ${lang === 'ar' ? 'left-3' : 'right-3'} w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs`}>✓</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 — Country & Currency */}
        {step === 2 && (
          <div className="fade-in">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{t("onboarding.step2Title")}</h2>
            <p className="text-slate-400 text-sm mb-6">{t("onboarding.step2Subtitle")}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">{t("settings.country")}</label>
                <select value={countryCode} onChange={e => onCountryChange(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
                  <option value="">{t("settings.selectCountry")}</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag_emoji ? c.flag_emoji + ' ' : ''}{lang === 'ar' ? c.name_ar : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">{t("settings.defaultCurrency")}</label>
                <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
                  <option value="">{t("settings.selectCurrency")}</option>
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {lang === 'ar' ? c.name_ar : c.name_en} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">{t("settings.taxRate")}</label>
                <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)}
                  min="0" max="100" step="0.01" dir="ltr"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Logo Upload */}
        {step === 3 && (
          <div className="fade-in">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{t("onboarding.step3Title")}</h2>
            <p className="text-slate-400 text-sm mb-6">{t("onboarding.step3Subtitle")}</p>

            <label className={`relative block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              logoPreview ? "border-green-500/50 bg-green-500/5" : "border-slate-700/50 hover:border-blue-500/50 hover:bg-blue-500/5"
            }`}>
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml" onChange={e => onLogoSelect(e.target.files?.[0] || null)} className="hidden" />
              {logoPreview ? (
                <div className="space-y-3">
                  <img src={logoPreview} alt="Logo preview" className="mx-auto max-h-32 rounded-lg" />
                  <p className="text-green-400 text-sm font-bold">{t("onboarding.logoUploaded")}</p>
                  <button type="button" onClick={(e) => { e.preventDefault(); setLogoFile(null); setLogoPreview(""); }}
                    className="text-red-400 text-xs hover:text-red-300">{t("onboarding.removeLogo")}</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-5xl mb-2">📤</div>
                  <p className="text-white text-sm font-bold">{t("onboarding.uploadLogo")}</p>
                  <p className="text-slate-500 text-xs">{t("onboarding.uploadHint")}</p>
                </div>
              )}
            </label>
          </div>
        )}
      </main>

      {/* Footer Actions */}
      <footer className="border-t border-slate-700/30 px-4 md:px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-5 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            ← {t("onboarding.back")}
          </button>

          <div className="flex items-center gap-2">
            {step === 3 && (
              <button onClick={finish} disabled={saving || uploading}
                className="px-5 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-all disabled:opacity-50">
                {t("onboarding.skip")}
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20">
                {t("onboarding.next")} →
              </button>
            ) : (
              <button onClick={finish} disabled={saving || uploading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-green-500/20">
                {saving || uploading ? t("common.loading") : t("onboarding.finish")}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
