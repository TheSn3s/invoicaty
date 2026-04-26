"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { trackFirstInvoice } from "@/lib/gtag";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { getCurrencyLabel } from "@/lib/currency";
import type { Currency } from "@/lib/types";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import InvoiceModal from "@/components/InvoiceModal";
import DeleteModal from "@/components/DeleteModal";
import ImportModal from "@/components/ImportModal";
import StatsCards from "@/components/StatsCards";
import InvoiceTable from "@/components/InvoiceTable";
import CreateMenu from "@/components/CreateMenu";
import AppFooter from "@/components/AppFooter";
import { printInvoice } from "@/lib/print-invoice";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Invoice {
  id: string; serial: string; date: string; client: string;
  project: string; description: string; amount: number;
  discount?: number; currency: string; status: string; category: string;
  tax_rate?: number; tax_amount?: number; total?: number; notes?: string;
  items?: Array<{ description: string; quantity: number; unit_price: number }> | null;
  deleted_at?: string | null;
}

interface Profile {
  full_name: string; business_name: string; phone: string; email: string;
  bank_name: string; bank_account: string; bank_iban: string; bank_holder: string;
  brand_color: string; role?: string; default_currency?: string;
  tax_rate?: number; logo_url?: string; onboarding_completed?: boolean;
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currencyData, setCurrencyData] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null);
  const router = useRouter();

  // Auto-open invoice modal when arriving via ?new=1 (from CreateMenu)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      setEditInvoice(null);
      setShowModal(true);
      router.replace("/dashboard", { scroll: false });
    }
  }, [router]);
  const supabase = createClient();
  const { t, lang } = useI18n();

  // Currency label follows UI language: Arabic → symbol (د.ك), English → code (KWD)
  const effectiveSymbol = getCurrencyLabel(currencyData, lang);

  const loadData = useCallback(async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) { router.push("/login"); return; }

    const [{ data: inv }, { data: prof }] = await Promise.all([
      supabase.from("invoices").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single()
    ]);

    if (!prof) {
      const { data: newProf } = await supabase.from("profiles").upsert({
        id: user.id, full_name: user.user_metadata?.full_name || '', email: user.email || '',
      }).select().single();
      setProfile(newProf || null);
    } else {
      setProfile(prof);
      // Load currency data
      if (prof.default_currency) {
        const { data: curr } = await supabase.from("currencies").select("*").eq("code", prof.default_currency).single();
        if (curr) setCurrencyData(curr);
      }
    }

    setInvoices(inv || []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { loadData(); });
    return () => subscription.unsubscribe();
  }, [supabase, loadData]);

  const handleSave = async (data: Partial<Invoice>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Calculate derived financial fields server-side too
    const amt = Number(data.amount) || 0;
    const disc = Number(data.discount) || 0;
    const rate = Number(data.tax_rate) || 0;
    const taxableBase = Math.max(amt - disc, 0);
    const taxAmount = +(taxableBase * (rate / 100)).toFixed(3);
    const total = +(taxableBase + taxAmount).toFixed(3);

    const payload = {
      date: data.date, client: data.client, project: data.project,
      description: data.description, amount: data.amount, discount: data.discount,
      tax_rate: rate, tax_amount: taxAmount, total,
      notes: data.notes || "",
      status: data.status, category: data.category,
      items: (data as { items?: unknown[] }).items || null,
      currency: profile?.default_currency || 'KWD',
    };

    if (editInvoice) {
      await supabase.from("invoices").update(payload).eq("id", editInvoice.id);
    } else {
      const maxSerial = invoices.reduce((max, inv) => { const n = parseInt(inv.serial); return !isNaN(n) && n > max ? n : max; }, 0);
      const { error: insertErr } = await supabase.from("invoices").insert({ user_id: user.id, serial: String(maxSerial + 1).padStart(3, "0"), ...payload });
      // 📊 Google Ads: fire FIRST INVOICE conversion — only when this is the user's very first invoice
      if (!insertErr && invoices.length === 0) {
        trackFirstInvoice();
      }
    }
    setShowModal(false); setEditInvoice(null); loadData();
  };

  const handleDelete = async () => {
    if (!deleteInvoice) return;
    // Soft delete: mark as Deleted instead of removing from DB
    await supabase.from("invoices").update({ status: "Deleted", deleted_at: new Date().toISOString() }).eq("id", deleteInvoice.id);
    setDeleteInvoice(null); loadData();
  };

  const handleImport = async (rows: { date: string; client: string; project: string; description: string; amount: number; status: string; category: string }[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    let maxSerial = invoices.reduce((max, inv) => { const n = parseInt(inv.serial); return !isNaN(n) && n > max ? n : max; }, 0);
    const toInsert = rows.map(row => { maxSerial++; return { user_id: user.id, serial: String(maxSerial).padStart(3, "0"), ...row, currency: profile?.default_currency || 'KWD' }; });
    for (let i = 0; i < toInsert.length; i += 50) { await supabase.from("invoices").insert(toInsert.slice(i, i + 50)); }
    setShowImport(false); loadData();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const filtered = invoices.filter(inv => {
    // Hide soft-deleted invoices from main dashboard
    if (inv.status === "Deleted") return false;
    const matchSearch = !search || inv.client.toLowerCase().includes(search.toLowerCase()) || inv.project.toLowerCase().includes(search.toLowerCase()) || inv.serial.includes(search);
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchDateFrom = !dateFrom || inv.date >= dateFrom;
    const matchDateTo = !dateTo || inv.date <= dateTo;
    return matchSearch && matchStatus && matchDateFrom && matchDateTo;
  });

  const now = new Date();
  // Use invoice total (incl. tax) if available, else fallback to amount - discount
  const effectiveTotal = (i: Invoice) => Number(i.total) || (Number(i.amount) - (Number(i.discount) || 0));
  const totalIncome = invoices.reduce((s, i) => s + (i.status !== "Cancelled" && i.status !== "Deleted" ? effectiveTotal(i) : 0), 0);
  const monthIncome = invoices.filter(i => { const d = new Date(i.date); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && i.status !== "Cancelled" && i.status !== "Deleted"; }).reduce((s, i) => s + effectiveTotal(i), 0);
  const yearIncome = invoices.filter(i => new Date(i.date).getFullYear() === now.getFullYear() && i.status !== "Cancelled" && i.status !== "Deleted").reduce((s, i) => s + effectiveTotal(i), 0);
  const outstanding = invoices.filter(i => i.status === "Not Paid");
  const outstandingTotal = outstanding.reduce((s, i) => s + effectiveTotal(i), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-30 glass border-b border-slate-700/50 px-4 py-3 md:px-8 md:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-dark.png" alt="Invoicaty" className="h-8 w-auto" />
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Invoicaty</h1>
              <p className="text-[10px] text-slate-400">{profile?.full_name || profile?.business_name || t("dashboard.welcome")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            {profile?.role === 'admin' && (
              <Link href="/admin" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title={t("nav.admin")}>🛡</Link>
            )}
            <Link href="/quotations" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title={t("quotation.title")}>📋</Link>
            <Link href="/settings" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title={t("nav.settings")}>⚙️</Link>
            <CreateMenu
              onNewInvoice={() => { setEditInvoice(null); setShowModal(true); }}
              onNewQuotation={() => router.push("/quotations?new=1")}
              align={lang === 'ar' ? 'left' : 'right'}
            />
            <button onClick={handleLogout} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title={t("nav.logout")}>⬅️</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-5">
        {invoices.length === 0 ? (
          /* ===== EMPTY STATE — First-time user, no invoices yet ===== */
          <div className="fade-in mt-8">
            <div className="glass rounded-3xl p-8 md:p-12 text-center max-w-lg mx-auto border border-slate-700/30">
              <div className="text-7xl mb-6">🧾</div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                {lang === 'ar' ? 'أنشئ أول فاتورة خلال ٦٠ ثانية' : 'Create your first invoice in 60 seconds'}
              </h2>
              <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed">
                {lang === 'ar'
                  ? 'لا تحتاج أي إعداد مسبق. اضغط الزر وابدأ فوراً — أدخل اسم العميل والمبلغ وأرسل الفاتورة كـ PDF احترافي.'
                  : 'No setup needed. Click the button and start right away — enter client name, amount, and send a professional PDF invoice.'}
              </p>
              <button
                onClick={() => { setEditInvoice(null); setShowModal(true); }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                {lang === 'ar' ? '+ أنشئ فاتورة الآن' : '+ Create Invoice Now'}
              </button>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">⚡</div>
                  <p className="text-slate-500 text-[11px]">{lang === 'ar' ? 'سريع — أقل من دقيقة' : 'Fast — under 1 minute'}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📄</div>
                  <p className="text-slate-500 text-[11px]">{lang === 'ar' ? 'تصدير PDF احترافي' : 'Professional PDF export'}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">💰</div>
                  <p className="text-slate-500 text-[11px]">{lang === 'ar' ? 'تتبع المدفوعات تلقائياً' : 'Auto payment tracking'}</p>
                </div>
              </div>
            </div>
            {!profile?.onboarding_completed && (
              <div className="text-center mt-6">
                <Link href="/onboarding" className="text-slate-500 hover:text-slate-300 text-xs underline transition-all">
                  {lang === 'ar' ? '⚙️ إعداد العملة والشعار وبيانات العمل' : '⚙️ Set up currency, logo & business info'}
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* ===== NORMAL STATE — User has invoices ===== */
          <>
        <StatsCards total={totalIncome} month={monthIncome} year={yearIncome} outstanding={outstandingTotal} outstandingCount={outstanding.length} currencySymbol={effectiveSymbol} />

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("dashboard.search")}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pr-9 pl-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 min-w-[140px]">
            <option value="all">{t("dashboard.allStatuses")}</option>
            <option value="Paid">{t("dashboard.paid")}</option>
            <option value="Not Paid">{t("dashboard.notPaid")}</option>
            <option value="Cancelled">{lang === 'ar' ? 'ملغاة' : 'Cancelled'}</option>
          </select>
          <button onClick={() => setShowDateFilter(!showDateFilter)}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${dateFrom || dateTo ? "bg-blue-500/15 border-blue-500/30 text-blue-400" : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50"}`}>
            📅 {dateFrom || dateTo ? t("dashboard.dateFilterActive") : t("dashboard.date")}
          </button>
          <div className="flex items-center justify-center gap-1.5 bg-slate-800/30 rounded-xl px-4 py-3 border border-slate-700/30 min-w-[100px]">
            <span className="text-slate-500 text-xs">{t("dashboard.results")}</span>
            <span className="font-inter font-bold text-blue-400">{filtered.length}</span>
          </div>
        </div>

        {showDateFilter && (
          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 glass rounded-xl p-4 fade-in">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-slate-400 text-xs font-bold whitespace-nowrap">{t("dashboard.dateFrom")}</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-white font-inter focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-slate-400 text-xs font-bold whitespace-nowrap">{t("dashboard.dateTo")}</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-white font-inter focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all">
                ✕ {t("dashboard.clearFilter")}
              </button>
            )}
          </div>
        )}

        <InvoiceTable invoices={filtered} onEdit={(inv) => { setEditInvoice(inv); setShowModal(true); }} onDelete={(inv) => setDeleteInvoice(inv)} onPrint={(inv) => printInvoice(inv, profile)} onMarkPaid={async (inv) => {
          const { error } = await supabase.from("invoices").update({ status: "Paid" }).eq("id", inv.id);
          if (!error) {
            setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "Paid" } : i));
          }
        }} currencySymbol={effectiveSymbol} />
          </>
        )}
      </main>

      <CreateMenu
        variant="fab"
        onNewInvoice={() => { setEditInvoice(null); setShowModal(true); }}
        onNewQuotation={() => router.push("/quotations?new=1")}
        align={lang === 'ar' ? 'right' : 'left'}
      />

      {showModal && <InvoiceModal invoice={editInvoice} onSave={handleSave} onClose={() => { setShowModal(false); setEditInvoice(null); }} currencySymbol={effectiveSymbol} defaultTaxRate={profile?.tax_rate || 0} />}
      {deleteInvoice && <DeleteModal serial={deleteInvoice.serial} onConfirm={handleDelete} onClose={() => setDeleteInvoice(null)} />}
      {showImport && <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} />}

      <AppFooter compact />
    </div>
  );
}
