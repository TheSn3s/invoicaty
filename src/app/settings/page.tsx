"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AppFooter from "@/components/AppFooter";
import ImportModal from "@/components/ImportModal";
import { SUPPORT_LINKS } from "@/lib/developer-info";
import { buildInvoiceHtml } from "@/lib/print-invoice";
import type { TemplateId } from "@/lib/print-templates/types";
import TemplateThumb from "@/components/TemplateThumb";
import LogoCropper from "@/components/LogoCropper";
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
  invoice_template?: TemplateId | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"profile" | "security" | "region" | "invoice" | "data">("profile");
  const [showImport, setShowImport] = useState(false);
  const [exportBusy, setExportBusy] = useState<null | "csv" | "backup">(null);
  const [exportDone, setExportDone] = useState(false);

  // Password change
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);

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
  const [companyName, setCompanyName] = useState("");
  const [invoiceDisplay, setInvoiceDisplay] = useState<"name" | "company" | "both">("name");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState<string>("");
  const [cropSrc, setCropSrc] = useState<string>("");
  const [invoiceTemplate, setInvoiceTemplate] = useState<TemplateId>("modern");
  const [templateSaving, setTemplateSaving] = useState<TemplateId | null>(null);

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
        setCompanyName(prof.company_name || "");
        setInvoiceDisplay(prof.invoice_display || "name");
        setLogoUrl(prof.logo_url || "");
        setInvoiceTemplate(((prof as { invoice_template?: string }).invoice_template as TemplateId) || "modern");
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
      company_name: companyName || null,
      invoice_display: invoiceDisplay,
      preferred_language: lang,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);

    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ============ Data Management ============
  const handleImport = async (rows: { date: string; client: string; project: string; description: string; amount: number; status: string; category: string }[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: existing } = await supabase.from("invoices").select("serial").eq("user_id", user.id);
    let maxSerial = (existing || []).reduce((max, inv) => { const n = parseInt(inv.serial); return !isNaN(n) && n > max ? n : max; }, 0);
    const toInsert = rows.map(row => { maxSerial++; return { user_id: user.id, serial: String(maxSerial).padStart(3, "0"), ...row, currency: defaultCurrency || "KWD" }; });
    for (let i = 0; i < toInsert.length; i += 50) { await supabase.from("invoices").insert(toInsert.slice(i, i + 50)); }
    setShowImport(false);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const escapeCsv = (v: unknown) => {
    const s = String(v ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const handleExportCsv = async () => {
    setExportBusy("csv");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: invs } = await supabase.from("invoices").select("*").eq("user_id", user.id).order("date", { ascending: false });
      const headers = ["Serial", "Date", "Client", "Project", "Description", "Amount", "Discount", "TaxRate", "TaxAmount", "Total", "Currency", "Status", "Category", "Notes"];
      const lines = [headers.join(",")];
      for (const r of (invs || [])) {
        lines.push([r.serial, r.date, r.client, r.project, r.description, r.amount, r.discount || 0, r.tax_rate || 0, r.tax_amount || 0, r.total || r.amount, r.currency, r.status, r.category || "", r.notes || ""].map(escapeCsv).join(","));
      }
      // Prepend UTF-8 BOM so Excel opens Arabic correctly
      const csv = "\ufeff" + lines.join("\n");
      const ts = new Date().toISOString().split("T")[0];
      downloadFile(`invoicaty-invoices-${ts}.csv`, csv, "text/csv;charset=utf-8");
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } finally {
      setExportBusy(null);
    }
  };

  const handleBackup = async () => {
    setExportBusy("backup");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [inv, quo, prof] = await Promise.all([
        supabase.from("invoices").select("*").eq("user_id", user.id),
        supabase.from("quotations").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);
      const backup = {
        app: "Invoicaty",
        version: 1,
        exported_at: new Date().toISOString(),
        user_id: user.id,
        profile: prof.data || null,
        invoices: inv.data || [],
        quotations: quo.data || [],
      };
      const ts = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
      downloadFile(`invoicaty-backup-${ts}.json`, JSON.stringify(backup, null, 2), "application/json");
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } finally {
      setExportBusy(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);

    if (newPwd.length < 6) {
      setPwdError(t("settings.passwordTooShort"));
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError(t("settings.passwordMismatch"));
      return;
    }

    setPwdBusy(true);
    try {
      // Verify current password via re-authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setPwdError(t("settings.wrongCurrent"));
        return;
      }
      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPwd,
      });
      if (verifyErr) {
        setPwdError(t("settings.wrongCurrent"));
        return;
      }

      // Update password
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPwd });
      if (updateErr) {
        setPwdError(updateErr.message);
        return;
      }

      setPwdSuccess(true);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setTimeout(() => setPwdSuccess(false), 4000);
    } finally {
      setPwdBusy(false);
    }
  };

  // ============ Logo Management ============
  // Step 1: user picks a file → we open the cropper modal (no upload yet).
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setLogoError("");

    if (!file.type.startsWith("image/")) {
      setLogoError(lang === "ar" ? "يجب أن يكون الملف صورة (PNG, JPG, SVG)" : "File must be an image (PNG, JPG, SVG)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError(lang === "ar" ? "حجم الملف أكبر من 5 ميجابايت" : "File size exceeds 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setCropSrc(result);
    };
    reader.onerror = () => {
      setLogoError(lang === "ar" ? "تعذر قراءة الملف" : "Could not read file");
    };
    reader.readAsDataURL(file);
  };

  // Step 2: cropper returns a PNG blob → upload it.
  const handleCroppedUpload = async (blob: Blob) => {
    if (!profile) return;
    setLogoBusy(true);
    setLogoError("");
    try {
      const path = `${profile.id}/logo-${Date.now()}.png`;

      const uploadPromise = supabase.storage.from("logos").upload(path, blob, { upsert: true, contentType: "image/png" });
      const timeoutPromise = new Promise<{ error: Error }>((resolve) => {
        setTimeout(() => resolve({ error: new Error(lang === "ar" ? "انتهت مهلة الرفع (15 ثانية)" : "Upload timed out (15s)") }), 15000);
      });
      const result = await Promise.race([uploadPromise, timeoutPromise]) as { error: Error | null };

      if (result.error) {
        setLogoError(lang === "ar" ? `فشل الرفع: ${result.error.message}` : `Upload failed: ${result.error.message}`);
        return;
      }

      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
      const newUrl = urlData.publicUrl;

      const { error: updateErr } = await supabase.from("profiles").update({ logo_url: newUrl, updated_at: new Date().toISOString() }).eq("id", profile.id);
      if (updateErr) {
        setLogoError(lang === "ar" ? `فشل حفظ الشعار: ${updateErr.message}` : `Save failed: ${updateErr.message}`);
        return;
      }

      // Best-effort cleanup of previous logo
      if (logoUrl) {
        try {
          const oldPath = logoUrl.split("/logos/")[1];
          if (oldPath) await supabase.storage.from("logos").remove([oldPath]);
        } catch { /* ignore cleanup errors */ }
      }

      setLogoUrl(newUrl);
      setCropSrc("");
    } catch (err) {
      setLogoError(lang === "ar" ? `خطأ: ${err instanceof Error ? err.message : String(err)}` : `Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLogoBusy(false);
    }
  };

  const handleLogoRemove = async () => {
    if (!profile || !logoUrl) return;
    if (!confirm(lang === "ar" ? "هل أنت متأكد من حذف الشعار؟" : "Are you sure you want to remove the logo?")) return;

    setLogoBusy(true);
    setLogoError("");
    try {
      // Delete file from storage (best-effort)
      try {
        const oldPath = logoUrl.split("/logos/")[1];
        if (oldPath) await supabase.storage.from("logos").remove([oldPath]);
      } catch { /* ignore */ }

      // Clear logo_url in profile
      const { error: updateErr } = await supabase.from("profiles").update({ logo_url: null, updated_at: new Date().toISOString() }).eq("id", profile.id);
      if (updateErr) {
        setLogoError(lang === "ar" ? `فشل الحذف: ${updateErr.message}` : `Remove failed: ${updateErr.message}`);
        return;
      }
      setLogoUrl("");
    } finally {
      setLogoBusy(false);
    }
  };

  // ============ Invoice Template ============
  const handleSelectTemplate = async (id: TemplateId) => {
    if (!profile || id === invoiceTemplate) return;
    setTemplateSaving(id);
    try {
      const { error: updateErr } = await supabase.from("profiles")
        .update({ invoice_template: id, updated_at: new Date().toISOString() })
        .eq("id", profile.id);
      if (updateErr) {
        // Likely the column doesn't exist yet — fall back to local state so UI still works
        console.warn("Could not persist invoice_template:", updateErr.message);
      }
      setInvoiceTemplate(id);
    } finally {
      setTemplateSaving(null);
    }
  };

  const buildSampleProfile = (templateOverride: TemplateId) => ({
    full_name: fullName || (lang === "ar" ? "اسمك الكامل" : "Your Name"),
    business_name: businessName || (lang === "ar" ? "اسم العلامة التجارية" : "Your Business"),
    company_name: companyName || "",
    invoice_display: invoiceDisplay,
    phone: phone || "+965 9000 0000",
    email: email || "hello@example.com",
    bank_name: bankName || "National Bank",
    bank_account: bankAccount || "01234567890",
    bank_iban: bankIban || "KW00 NBOK 0000 0000 0000 0000 0000 00",
    bank_holder: bankHolder || fullName || "Your Name",
    brand_color: brandColor || "#3b82f6",
    logo_url: logoUrl || "",
    invoice_template: templateOverride,
  });

  const buildSampleDoc = () => ({
    serial: "001",
    date: new Date().toISOString().split("T")[0],
    client: lang === "ar" ? "شركة عميل تجريبي" : "Sample Client Co.",
    project: lang === "ar" ? "مشروع تجريبي" : "Sample Project",
    description: "",
    amount: 0,
    currency: defaultCurrency || "KWD",
    discount: 0,
    tax_rate: Number(taxRate) || 0,
    notes: lang === "ar" ? "شكراً لثقتكم بنا. يرجى السداد بعد الاستلام." : "Thank you for your business. Payment is due within 14 days of receipt.",
    items: [
      { description: lang === "ar" ? "تصميم هوية بصرية كاملة" : "Brand identity design — full package", quantity: 1, unit_price: 750 },
      { description: lang === "ar" ? "تطوير صفحة هبوط" : "Landing page development", quantity: 1, unit_price: 1200 },
      { description: lang === "ar" ? "دعم وصيانة (شهريّ)" : "Monthly support & maintenance", quantity: 3, unit_price: 150 },
    ],
  });

  const handlePreviewTemplate = (id: TemplateId) => {
    const sampleProfile = buildSampleProfile(id);
    const sampleDoc = buildSampleDoc();
    const html = buildInvoiceHtml(sampleDoc, sampleProfile, "invoice", id);
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
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
        <div className="flex gap-1 sm:gap-1.5 mb-6">
          <button onClick={() => setTab("profile")}
            className={`flex-1 min-w-0 py-2.5 px-2 sm:px-3 rounded-xl text-[12px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${tab === "profile" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "glass text-slate-400 hover:text-white"}`}>
            <span>👤</span>
            <span className={`${tab === "profile" ? "inline" : "hidden"} sm:inline truncate`}>{t("settings.profileTab")}</span>
          </button>
          <button onClick={() => setTab("security")}
            className={`flex-1 min-w-0 py-2.5 px-2 sm:px-3 rounded-xl text-[12px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${tab === "security" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "glass text-slate-400 hover:text-white"}`}>
            <span>🔐</span>
            <span className={`${tab === "security" ? "inline" : "hidden"} sm:inline truncate`}>{t("settings.security")}</span>
          </button>
          <button onClick={() => setTab("region")}
            className={`flex-1 min-w-0 py-2.5 px-2 sm:px-3 rounded-xl text-[12px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${tab === "region" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "glass text-slate-400 hover:text-white"}`}>
            <span>🌍</span>
            <span className={`${tab === "region" ? "inline" : "hidden"} sm:inline truncate`}>{t("settings.regionTab")}</span>
          </button>
          <button onClick={() => setTab("invoice")}
            className={`flex-1 min-w-0 py-2.5 px-2 sm:px-3 rounded-xl text-[12px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${tab === "invoice" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "glass text-slate-400 hover:text-white"}`}>
            <span>🎨</span>
            <span className={`${tab === "invoice" ? "inline" : "hidden"} sm:inline truncate`}>{t("settings.invoiceTab")}</span>
          </button>
          <button onClick={() => setTab("data")}
            className={`flex-1 min-w-0 py-2.5 px-2 sm:px-3 rounded-xl text-[12px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${tab === "data" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "glass text-slate-400 hover:text-white"}`}>
            <span>💾</span>
            <span className={`${tab === "data" ? "inline" : "hidden"} sm:inline truncate`}>{t("settings.dataTab")}</span>
          </button>
        </div>

        {tab === "profile" && (
          <div className="space-y-6 fade-in">
            {/* Brand Logo */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">🖼️</span>
                {lang === "ar" ? "شعار العلامة التجارية" : "Brand Logo"}
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-slate-800/60 border-2 border-dashed border-slate-600/40 flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-3xl opacity-30">🖼️</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-[11px] text-slate-400">{lang === "ar" ? "يظهر في الفواتير وعروض الأسعار المطبوعة. PNG / JPG / SVG — حتى 5 ميجابايت. بعد الرفع تقدر تصوير وتقص وتدوّر الشعار." : "Shown on printed invoices and quotations. PNG / JPG / SVG — max 5MB. After upload you can zoom, crop and rotate."}</p>
                  <div className="flex flex-wrap gap-2">
                    <label className={`flex-1 min-w-[120px] text-center bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all shadow-lg shadow-blue-500/20 ${logoBusy ? "opacity-50 pointer-events-none" : ""}`}>
                      {logoBusy ? `⏳ ${lang === "ar" ? "جارٍ الرفع…" : "Uploading…"}` : (logoUrl ? (lang === "ar" ? "🔄 تغيير الشعار" : "🔄 Change Logo") : (lang === "ar" ? "📤 رفع شعار" : "📤 Upload Logo"))}
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" disabled={logoBusy} />
                    </label>
                    {logoUrl && (
                      <button type="button" onClick={handleLogoRemove} disabled={logoBusy}
                        className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-xs font-bold py-2.5 px-3 rounded-xl transition-all disabled:opacity-50">
                        {lang === "ar" ? "🗑️ حذف" : "🗑️ Remove"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {logoError && (
                <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-300 text-[12px] font-bold px-3 py-2.5 rounded-xl">
                  ⚠️ {logoError}
                </div>
              )}
            </div>

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
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.companyName")}</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                    placeholder={t("settings.companyNamePlaceholder")}
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>
                {companyName && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2">{t("settings.invoiceDisplay")}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["name", "company", "both"] as const).map(opt => (
                        <button key={opt} onClick={() => setInvoiceDisplay(opt)}
                          className={`p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                            invoiceDisplay === opt
                              ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                              : "bg-slate-800/50 border-slate-600/30 text-slate-400 hover:border-slate-500/50"
                          }`}>
                          {t(`settings.display_${opt}`)}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                      {invoiceDisplay === "name" && t("settings.displayPreviewName", { name: fullName || "—" })}
                      {invoiceDisplay === "company" && t("settings.displayPreviewCompany", { company: companyName })}
                      {invoiceDisplay === "both" && t("settings.displayPreviewBoth", { company: companyName, name: fullName || "—" })}
                    </p>
                  </div>
                )}
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

        {tab === "security" && (
          <div className="space-y-6 fade-in">
            {/* Change Password Card */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm">🔐</span>
                {t("settings.changePassword")}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 ms-10 mb-4">{t("settings.changePasswordDesc")}</p>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.currentPassword")}</label>
                  <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} required autoComplete="current-password"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.newPasswordLabel")}</label>
                  <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={6} autoComplete="new-password"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("settings.confirmPassword")}</label>
                  <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required minLength={6} autoComplete="new-password"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>

                {pwdError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-[12px] font-bold px-3 py-2.5 rounded-xl">
                    ⚠️ {pwdError}
                  </div>
                )}
                {pwdSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[12px] font-bold px-3 py-2.5 rounded-xl">
                    {t("settings.passwordUpdated")}
                  </div>
                )}

                <button type="submit" disabled={pwdBusy || !currentPwd || !newPwd || !confirmPwd}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[.99] disabled:opacity-50">
                  {pwdBusy ? `⏳ ${t("settings.updatingPassword")}` : `🔐 ${t("settings.updatePasswordBtn")}`}
                </button>
              </form>
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
                    <option value="influencer">{t("onboarding.influencer")}</option>
                    <option value="freelancer">{t("onboarding.freelancer")}</option>
                    <option value="professional">{t("onboarding.professional")}</option>
                    <option value="commerce">{t("onboarding.commerce")}</option>
                    <option value="small_business">{t("onboarding.smallBiz")}</option>
                    <option value="other">{t("onboarding.other")}</option>
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
            {/* Template picker */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">📄</span>
                {t("settings.templateTitle")}
              </h3>
              <p className="text-[11px] text-slate-400 mb-4 ms-10">{t("settings.templateDesc")}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { id: "modern" as TemplateId, label: t("settings.modern"), desc: t("settings.modernDesc") },
                  { id: "classic" as TemplateId, label: t("settings.classic"), desc: t("settings.classicDesc") },
                  { id: "minimal" as TemplateId, label: t("settings.minimal"), desc: t("settings.minimalDesc") },
                ]).map(tpl => {
                  const active = invoiceTemplate === tpl.id;
                  return (
                    <div key={tpl.id} className={`rounded-xl border-2 transition-all overflow-hidden ${active ? "border-blue-500 bg-blue-500/5" : "border-slate-700/50 bg-slate-900/30 hover:border-slate-600"}`}>
                      <button type="button" onClick={() => handleSelectTemplate(tpl.id)} className="w-full text-start">
                        {/* Mini preview thumbnail (pure CSS) */}
                        <TemplateThumb id={tpl.id} brandColor={brandColor} />
                      </button>
                      <div className="px-3 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white">{tpl.label}</span>
                          {active && <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full">✓ {t("settings.active")}</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">{tpl.desc}</p>
                        <div className="flex gap-2">
                          {!active && (
                            <button onClick={() => handleSelectTemplate(tpl.id)} disabled={templateSaving === tpl.id}
                              className="flex-1 bg-blue-600/90 hover:bg-blue-500 text-white text-[11px] font-bold py-2 rounded-lg transition-all disabled:opacity-50">
                              {templateSaving === tpl.id ? "⏳…" : t("settings.save")}
                            </button>
                          )}
                          <button onClick={() => handlePreviewTemplate(tpl.id)}
                            className={`${active ? "flex-1" : ""} bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 text-[11px] font-bold py-2 px-3 rounded-lg transition-all`}
                            title={t("settings.previewHint")}>
                            🔍 {t("settings.livePreview")}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brand Color */}
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
              <button onClick={() => handlePreviewTemplate(invoiceTemplate)}
                className="mt-4 w-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all">
                🔍 {t("settings.livePreview")} — {t(`settings.${invoiceTemplate}`)}
              </button>
            </div>
          </div>
        )}

        {tab === "data" && (
          <div className="space-y-5 fade-in">
            {/* Header */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">💾</span>
                {t("data.title")}
              </h3>
              <p className="text-xs text-slate-400 mt-1 ms-10">{t("data.subtitle")}</p>
            </div>

            {/* Import */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/25 to-blue-600/15 border border-blue-500/30 flex items-center justify-center text-lg shrink-0">📥</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{t("data.importTitle")}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t("data.importDesc")}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowImport(true)} className="w-full bg-blue-600/90 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[.99]">
                📥 {t("data.importBtn")}
              </button>
            </div>

            {/* Export CSV */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">📊</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{t("data.exportTitle")}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t("data.exportDesc")}</p>
                  </div>
                </div>
              </div>
              <button onClick={handleExportCsv} disabled={exportBusy !== null} className="w-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[.99] disabled:opacity-50">
                {exportBusy === "csv" ? `⏳ ${t("data.exporting")}` : `📊 ${t("data.exportBtn")}`}
              </button>
            </div>

            {/* Full Backup */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/25 to-purple-600/15 border border-purple-500/30 flex items-center justify-center text-lg shrink-0">💾</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{t("data.backupTitle")}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t("data.backupDesc")}</p>
                  </div>
                </div>
              </div>
              <button onClick={handleBackup} disabled={exportBusy !== null} className="w-full bg-purple-600/90 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20 active:scale-[.99] disabled:opacity-50">
                {exportBusy === "backup" ? `⏳ ${t("data.exporting")}` : `💾 ${t("data.backupBtn")}`}
              </button>
              {exportDone && <p className="text-center text-emerald-400 text-[11px] font-bold mt-2">{t("data.exported")}</p>}
            </div>

            {/* Support block */}
            <div className="glass rounded-2xl p-5 border border-blue-500/20">
              <div className="flex items-start gap-3 mb-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/25 to-cyan-600/15 border border-blue-500/30 flex items-center justify-center text-lg shrink-0">🛟</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{t("support.supportTitle")}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t("support.supportDesc")}</p>
                </div>
              </div>
              <a href={SUPPORT_LINKS.email} className="w-full bg-slate-800/60 hover:bg-blue-600/20 text-white hover:text-blue-300 border border-slate-700/50 hover:border-blue-500/40 font-bold py-3 rounded-xl text-sm transition-all active:scale-[.99] inline-flex items-center justify-center gap-2">
                📧 {t("support.emailUs")} — <span className="font-mono text-[11px] opacity-80">support@invoicaty.com</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {showImport && <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} />}
      {cropSrc && (
        <LogoCropper
          imageSrc={cropSrc}
          busy={logoBusy}
          onCancel={() => setCropSrc("")}
          onConfirm={handleCroppedUpload}
        />
      )}
      <AppFooter compact />
    </div>
  );
}
