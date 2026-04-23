"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Country, Currency, Language, BusinessType } from "@/lib/types";

const COLORS = [
  { value: "#f04444", nameKey: "red" },
  { value: "#3b82f6", nameKey: "blue" },
  { value: "#8b5cf6", nameKey: "purple" },
  { value: "#10b981", nameKey: "green" },
  { value: "#f59e0b", nameKey: "gold" },
  { value: "#ec4899", nameKey: "pink" },
  { value: "#1e293b", nameKey: "dark" },
  { value: "#0ea5e9", nameKey: "sky" },
];

interface Profile {
  id: string;
  full_name: string;
  business_name: string;
  phone: string;
  email: string;
  bank_name: string;
  bank_account: string;
  bank_iban: string;
  bank_holder: string;
  brand_color: string;
  logo_url: string;
  country_code: string | null;
  default_currency: string | null;
  preferred_language: Language;
  tax_rate: number;
  business_type: BusinessType | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"profile" | "region" | "invoice">("profile");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [brandColor, setBrandColor] = useState("#f04444");
  const [countryCode, setCountryCode] = useState<string>("");
  const [defaultCurrency, setDefaultCurrency] = useState<string>("");
  const [taxRate, setTaxRate] = useState<string>("0");
  const [businessType, setBusinessType] = useState<BusinessType | "">("");

  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useI18n();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [{ data: prof }, { data: countriesData }, { data: currenciesData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("countries").select("*").order("name_en"),
        supabase.from("currencies").select("*").order("code"),
      ]);

      setCountries(countriesData || []);
      setCurrencies(currenciesData || []);

      if (prof) {
        setProfile(prof);
        setFullName(prof.full_name || "");
        setBusinessName(prof.business_name || "");
        setPhone(prof.phone || "");
        setEmail(prof.email || user.email || "");
        setBankName(prof.bank_name || "");
        setBankAccount(prof.bank_account || "");
        setBankIban(prof.bank_iban || "");
        setBankHolder(prof.bank_holder || "");
        setBrandColor(prof.brand_color || "#f04444");
        setCountryCode(prof.country_code || "");
        setDefaultCurrency(prof.default_currency || "");
        setTaxRate(String(prof.tax_rate ?? 0));
        setBusinessType((prof.business_type as BusinessType) || "");
      }
      setLoading(false);
    })();
  }, [supabase, router]);

  // When country changes, auto-suggest currency + tax (if not manually set)
  const onCountryChange = (code: string) => {
    setCountryCode(code);
    const country = countries.find(c => c.code === code);
    if (country) {
      if (country.default_currency) setDefaultCurrency(country.default_currency);
      setTaxRate(String(country.default_tax_rate));
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true); setSaved(false);

    await supabase.from("profiles").update({
      full_name: fullName,
      business_name: businessName,
      phone, email,
      bank_name: bankName,
      bank_account: bankAccount,
      bank_iban: bankIban,
      bank_holder: bankHolder,
      brand_color: brandColor,
      country_code: countryCode || null,
      default_currency: defaultCurrency || null,
      tax_rate: Number(taxRate) || 0,
      business_type: businessType || null,
      preferred_language: lang,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);

    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 glass border-b border-slate-700/50 px-4 py-3 md:px-8 md:py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all">
              {lang === 'ar' ? '→' : '←'}
            </Link>
            <h1 className="text-sm font-bold text-white">⚙️ {t("settings.title")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button onClick={handleSave} disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
              {saving ? t("settings.saving") : saved ? t("settings.saved") : `💾 ${t("settings.save")}`}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 pt-5">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button onClick={() => setTab("profile")}
            className={`flex-1 min-w-max py-3 px-4 rounded-xl text-sm font-bold transition-all ${tab === "profile" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "glass text-slate-400 hover:text-white"}`}>
            👤 {t("settings.profileTab")}
          </button>
          <button onClick={() => setTab("region")}
            className={`flex-1 min-w-max py-3 px-4 rounded-xl text-sm font-bold transition-all ${tab === "region" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "glass text-slate-400 hover:text-white"}`}>
            🌍 {t("settings.regionTab")}
          </button>
          <button onClick={() => setTab("invoice")}
            className={`flex-1 min-w-max py-3 px-4 rounded-xl text-sm font-bold transition-all ${tab === "invoice" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "glass text-slate-400 hover:text-white"}`}>
            🎨 {t("settings.invoiceTab")}
          </button>
        </div>

        {tab === "profile" && (
          <div className="space-y-6 fade-in">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">👤</span>
                {t("settings.personalInfo")}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.fullName")}</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.businessName")}</label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    placeholder={t("settings.businessNamePlaceholder")}
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.phone")}</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} dir="ltr"
                      className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.emailLabel")}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr"
                      className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-sm">🏦</span>
                {t("settings.bankInfo")} <span className="text-[10px] text-slate-500 font-normal">{t("settings.bankInfoNote")}</span>
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.bankName")}</label>
                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.bankHolder")}</label>
                    <input type="text" value={bankHolder} onChange={e => setBankHolder(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.bankAccount")}</label>
                  <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} dir="ltr"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.bankIban")}</label>
                  <input type="text" value={bankIban} onChange={e => setBankIban(e.target.value)} placeholder="KW..." dir="ltr"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "region" && (
          <div className="space-y-6 fade-in">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">🌍</span>
                {t("settings.regionTab")}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.country")}</label>
                  <select value={countryCode} onChange={e => onCountryChange(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
                    <option value="">{t("settings.selectCountry")}</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag_emoji ? c.flag_emoji + ' ' : ''}{lang === 'ar' ? c.name_ar : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.defaultCurrency")}</label>
                  <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
                    <option value="">{t("settings.selectCurrency")}</option>
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {lang === 'ar' ? c.name_ar : c.name_en} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.taxRate")}</label>
                  <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)}
                    min="0" max="100" step="0.01" dir="ltr"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.businessType")}</label>
                  <select value={businessType} onChange={e => setBusinessType(e.target.value as BusinessType | "")}
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
                    <option value="">{t("settings.selectBusinessType")}</option>
                    <option value="freelancer">{t("settings.freelancer")}</option>
                    <option value="small_business">{t("settings.smallBusiness")}</option>
                    <option value="agency">{t("settings.agency")}</option>
                    <option value="enterprise">{t("settings.enterprise")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.language")}</label>
                  <div className="flex gap-2">
                    <button onClick={() => setLang('ar')}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${lang === 'ar' ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}>
                      🇰🇼 العربية
                    </button>
                    <button onClick={() => setLang('en')}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}>
                      🇬🇧 English
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "invoice" && (
          <div className="space-y-6 fade-in">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">🎨</span>
                {t("settings.invoiceColor")}
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {COLORS.map(c => (
                  <button key={c.value} onClick={() => setBrandColor(c.value)}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${brandColor === c.value ? 'ring-2 ring-white bg-slate-700/50 scale-105' : 'hover:bg-slate-800/50'}`}>
                    <div className="w-10 h-10 rounded-xl shadow-lg" style={{ backgroundColor: c.value }} />
                    {brandColor === c.value && <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px]">✓</div>}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <label className="text-[11px] font-bold text-slate-400">{t("settings.customColor")}</label>
                <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent" />
                <span className="font-inter text-xs text-slate-500">{brandColor}</span>
              </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 text-center" style={{ backgroundColor: brandColor }}>
                <p className="text-white font-black text-lg">{fullName || t("settings.yourName")}</p>
                <p className="text-white/70 text-xs">{businessName || t("settings.yourBusiness")}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-slate-400 text-xs">{t("settings.previewHeader")}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
