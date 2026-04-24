"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { getCurrencyLabel } from "@/lib/currency";
import type { Currency } from "@/lib/types";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LineItemsEditor, { LineItem, makeEmptyItem, calcSubtotal } from "@/components/LineItemsEditor";
import { printQuotation } from "@/lib/print-invoice";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Quotation {
  id: string; serial: string; date: string; valid_until: string | null;
  client: string; project: string; description: string; amount: number;
  discount: number; tax_rate: number; tax_amount: number; total: number;
  notes: string; status: string; converted_invoice_id: string | null;
  items?: LineItem[] | null;
}

interface Profile {
  full_name: string; business_name: string; phone: string; email: string;
  bank_name: string; bank_account: string; bank_iban: string; bank_holder: string;
  brand_color: string; role?: string; default_currency?: string; tax_rate?: number;
  logo_url?: string;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currencyData, setCurrencyData] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editQuotation, setEditQuotation] = useState<Quotation | null>(null);
  const [convertQuotation, setConvertQuotation] = useState<Quotation | null>(null);
  const [converting, setConverting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t, lang } = useI18n();
  const effectiveSymbol = getCurrencyLabel(currencyData, lang);

  const loadData = useCallback(async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) { router.push("/login"); return; }
    const [{ data: q }, { data: prof }] = await Promise.all([
      supabase.from("quotations").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single()
    ]);
    setProfile(prof || null);
    if (prof?.default_currency) {
      const { data: curr } = await supabase.from("currencies").select("*").eq("code", prof.default_currency).single();
      if (curr) setCurrencyData(curr);
    }
    setQuotations(q || []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => quotations.filter(q => {
    const matchSearch = !search || q.client.toLowerCase().includes(search.toLowerCase()) || q.project.toLowerCase().includes(search.toLowerCase()) || q.serial.includes(search);
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  }), [quotations, search, statusFilter]);

  const handleSave = async (data: Partial<Quotation>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const amt = Number(data.amount) || 0;
    const disc = Number(data.discount) || 0;
    const rate = Number(data.tax_rate) || 0;
    const taxableBase = Math.max(amt - disc, 0);
    const taxAmount = +(taxableBase * (rate / 100)).toFixed(3);
    const total = +(taxableBase + taxAmount).toFixed(3);
    const payload = { date: data.date, valid_until: data.valid_until || null, client: data.client, project: data.project, description: data.description, amount: amt, discount: disc, tax_rate: rate, tax_amount: taxAmount, total, notes: data.notes || "", status: data.status || "Draft", items: (data as { items?: unknown[] }).items || null };
    if (editQuotation) {
      await supabase.from("quotations").update(payload).eq("id", editQuotation.id);
    } else {
      const maxSerial = quotations.reduce((max, q) => { const n = parseInt(q.serial.replace(/^Q/i, '')); return !isNaN(n) && n > max ? n : max; }, 0);
      await supabase.from("quotations").insert({ user_id: user.id, serial: `Q${String(maxSerial + 1).padStart(3, "0")}`, ...payload });
    }
    setShowModal(false); setEditQuotation(null); loadData();
  };

  const handleConvert = async () => {
    if (!convertQuotation) return;
    setConverting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setConverting(false); return; }
    // Get max invoice serial
    const { data: invs } = await supabase.from("invoices").select("serial").eq("user_id", user.id);
    const maxSerial = (invs || []).reduce((max, inv) => { const n = parseInt(inv.serial); return !isNaN(n) && n > max ? n : max; }, 0);
    const q = convertQuotation;
    const { data: newInv } = await supabase.from("invoices").insert({
      user_id: user.id, serial: String(maxSerial + 1).padStart(3, "0"),
      date: new Date().toISOString().split("T")[0], client: q.client, project: q.project,
      description: q.description, amount: q.amount, discount: q.discount,
      tax_rate: q.tax_rate, tax_amount: q.tax_amount, total: q.total,
      notes: q.notes, status: "Not Paid", category: ""
    }).select("id").single();
    if (newInv) {
      await supabase.from("quotations").update({ status: "Accepted", converted_invoice_id: newInv.id }).eq("id", q.id);
    }
    setConvertQuotation(null); setConverting(false); loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("quotations").delete().eq("id", id);
    loadData();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string; icon: string }> = {
      Draft: { bg: "bg-slate-500/15 border-slate-500/20", text: "text-slate-400", icon: "📝" },
      Sent: { bg: "bg-blue-500/15 border-blue-500/20", text: "text-blue-400", icon: "📤" },
      Accepted: { bg: "bg-green-500/15 border-green-500/20", text: "text-green-400", icon: "✅" },
      Rejected: { bg: "bg-red-500/15 border-red-500/20", text: "text-red-400", icon: "❌" },
      Expired: { bg: "bg-amber-500/15 border-amber-500/20", text: "text-amber-400", icon: "⏰" },
    };
    const b = map[s] || map.Draft;
    const label = t(`quotation.${s.toLowerCase()}` as `quotation.${string}`);
    return <span className={`${b.bg} ${b.text} text-[10px] font-bold px-2 py-1 rounded-full border`}>{b.icon} {label}</span>;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-30 glass border-b border-slate-700/50 px-4 py-3 md:px-8 md:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all">{lang === 'ar' ? '→' : '←'}</Link>
            <h1 className="text-sm font-bold text-white">📋 {t("quotation.title")}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <Link href="/dashboard" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title={t("nav.dashboard")}>🏠</Link>
            <button onClick={() => { setEditQuotation(null); setShowModal(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
              <span>+</span> <span className="hidden sm:inline">{t("quotation.new")}</span><span className="sm:hidden">{t("nav.new")}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("quotation.search")}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pr-9 pl-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 min-w-[140px]">
            <option value="all">{t("quotation.allStatuses")}</option>
            <option value="Draft">{t("quotation.draft")}</option>
            <option value="Sent">{t("quotation.sent")}</option>
            <option value="Accepted">{t("quotation.accepted")}</option>
            <option value="Rejected">{t("quotation.rejected")}</option>
            <option value="Expired">{t("quotation.expired")}</option>
          </select>
          <div className="flex items-center justify-center gap-1.5 bg-slate-800/30 rounded-xl px-4 py-3 border border-slate-700/30 min-w-[80px]">
            <span className="font-inter font-bold text-blue-400">{filtered.length}</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-400 text-sm">{t("quotation.noQuotations")}</p>
            <p className="text-slate-500 text-xs mt-1">{t("quotation.noQuotationsDesc")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(q => (
              <div key={q.id} className="glass rounded-xl p-4 fade-in">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-inter text-blue-400 font-bold text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">{q.serial}</span>
                    {statusBadge(q.status)}
                    {q.converted_invoice_id && <span className="text-green-400 text-[10px] font-bold">{t("quotation.converted")}</span>}
                  </div>
                  <span className="font-inter font-bold text-white text-sm">{Number(q.total || q.amount).toLocaleString()} <span className="text-[10px] text-slate-400">{effectiveSymbol}</span></span>
                </div>
                <div className="mb-2">
                  <div className="font-bold text-white text-sm">{q.client}</div>
                  <div className="text-slate-400 text-xs truncate">{q.project}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-inter text-slate-500 text-[11px]">{q.date}</span>
                    {q.valid_until && <span className="text-slate-600 text-[10px]">→ {q.valid_until}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => printQuotation({ ...q, currency: currencyData?.code || profile?.default_currency || 'KWD' }, profile)}
                      className="bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1.5"
                      title={t("quotation.print")}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      <span>{t("quotation.print")}</span>
                    </button>
                    {q.status !== "Accepted" && !q.converted_invoice_id && (
                      <button
                        onClick={() => setConvertQuotation(q)}
                        className="bg-green-500/15 hover:bg-green-500/25 text-green-300 border border-green-500/30 px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1.5"
                        title={t("quotation.convertToInvoice")}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                        <span className="hidden sm:inline">{t("quotation.convertToInvoice")}</span>
                        <span className="sm:hidden">{t("quotation.convertShort") || "Invoice"}</span>
                      </button>
                    )}
                    <button
                      onClick={() => { setEditQuotation(q); setShowModal(true); }}
                      className="bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 p-2 rounded-lg transition-all active:scale-95"
                      title={t("invoice.edit") || "Edit"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 p-2 rounded-lg transition-all active:scale-95"
                      title={t("invoice.delete") || "Delete"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <button onClick={() => { setEditQuotation(null); setShowModal(true); }}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center justify-center text-white text-2xl z-20 active:scale-95 transition-transform safe-bottom">+</button>

      {/* Quotation Modal */}
      {showModal && <QuotationModal quotation={editQuotation} onSave={handleSave} onClose={() => { setShowModal(false); setEditQuotation(null); }} currencySymbol={effectiveSymbol} defaultTaxRate={profile?.tax_rate || 0} />}

      {/* Convert Confirmation Modal */}
      {convertQuotation && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setConvertQuotation(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-3">🧾</div>
            <h3 className="text-base font-bold text-white mb-2">{t("quotation.convertConfirm", { serial: convertQuotation.serial })}</h3>
            <p className="text-slate-400 text-xs mb-4">{t("quotation.convertNote")}</p>
            <div className="flex gap-2">
              <button onClick={() => setConvertQuotation(null)} className="flex-1 bg-slate-800/50 text-slate-300 py-3 rounded-xl text-sm font-bold transition-all hover:bg-slate-700/50">{t("invoice.cancel")}</button>
              <button onClick={handleConvert} disabled={converting} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-green-500/20">
                {converting ? t("common.loading") : t("quotation.convertToInvoice")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== Quotation Modal ========== */
function QuotationModal({ quotation, onSave, onClose, currencySymbol, defaultTaxRate = 0 }: {
  quotation: Quotation | null; onSave: (d: Partial<Quotation> & { items: LineItem[] }) => void; onClose: () => void; currencySymbol: string; defaultTaxRate?: number;
}) {
  const { t, lang } = useI18n();
  const symbol = currencySymbol || (lang === 'ar' ? 'د.ك' : 'KWD');
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState("");
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<LineItem[]>([makeEmptyItem()]);
  const [discount, setDiscount] = useState("");
  const [taxRate, setTaxRate] = useState(defaultTaxRate > 0 ? String(defaultTaxRate) : "0");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Draft");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (quotation) {
      setDate(quotation.date);
      setValidUntil(quotation.valid_until || "");
      setClient(quotation.client);
      setProject(quotation.project);
      setDescription(quotation.description || "");
      // Populate items from quotation.items or fallback to legacy
      if (Array.isArray(quotation.items) && quotation.items.length > 0) {
        setItems(quotation.items.map(it => ({ description: it.description || "", quantity: Number(it.quantity) || 1, unit_price: Number(it.unit_price) || 0 })));
      } else {
        setItems([{ description: quotation.project + (quotation.description ? ` — ${quotation.description}` : ""), quantity: 1, unit_price: Number(quotation.amount) || 0 }]);
      }
      setDiscount(String(quotation.discount || 0));
      setTaxRate(String(quotation.tax_rate ?? defaultTaxRate ?? 0));
      setNotes(quotation.notes || "");
      setStatus(quotation.status);
    } else {
      setItems([makeEmptyItem()]);
    }
  }, [quotation, defaultTaxRate]);

  const totals = useMemo(() => {
    const sub = calcSubtotal(items);
    const disc = parseFloat(discount) || 0;
    const rate = parseFloat(taxRate) || 0;
    const taxableBase = Math.max(sub - disc, 0);
    const taxAmount = taxableBase * (rate / 100);
    const total = taxableBase + taxAmount;
    return { sub, disc, rate, taxAmount, total };
  }, [items, discount, taxRate]);

  const showTax = totals.rate > 0;
  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(it => it.description.trim() && (Number(it.quantity) * Number(it.unit_price)) >= 0);
    if (validItems.length === 0 || totals.sub < 0) return;
    setSaving(true);
    await onSave({ date, valid_until: validUntil || null, client, project, description, amount: totals.sub, items: validItems, discount: parseFloat(discount) || 0, tax_rate: parseFloat(taxRate) || 0, notes, status });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto slide-up" onClick={e => e.stopPropagation()}>
        <div className="md:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-slate-600 rounded-full" /></div>
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">{quotation ? `✏️ ${t("quotation.edit")} ${quotation.serial}` : `📋 ${t("quotation.add")}`}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl w-9 h-9 rounded-xl hover:bg-slate-700/50 flex items-center justify-center transition-all">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("quotation.date")}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("quotation.validUntil")}</label>
              <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("quotation.client")}</label>
            <input type="text" value={client} onChange={e => setClient(e.target.value)} required placeholder={t("quotation.client")} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("quotation.project")}</label>
            <input type="text" value={project} onChange={e => setProject(e.target.value)} required placeholder={t("quotation.project")} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("quotation.description")} <span className="text-slate-600 font-normal">({lang === "ar" ? "اختياري" : "optional"})</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder={lang === "ar" ? "نبذة عن المشروع" : "Brief about the project"} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none resize-none" />
          </div>

          {/* Line items editor */}
          <LineItemsEditor items={items} onChange={setItems} currencySymbol={symbol} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.discount")} ({symbol})</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} step="0.5" className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
            </div>
            {defaultTaxRate > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.taxRate")}</label>
                <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} step="0.01" min="0" max="100" dir="ltr" className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
              </div>
            )}
          </div>
          {totals.sub > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-xs"><span className="text-slate-400">{t("invoice.subtotal")}</span><span className="font-inter text-white">{fmt(totals.sub)} {symbol}</span></div>
              {totals.disc > 0 && <div className="flex justify-between text-xs"><span className="text-slate-400">- {t("invoice.discount")}</span><span className="font-inter text-red-400">{fmt(totals.disc)} {symbol}</span></div>}
              {showTax && <div className="flex justify-between text-xs"><span className="text-slate-400">+ {t("invoice.tax")} ({totals.rate}%)</span><span className="font-inter text-amber-400">{fmt(totals.taxAmount)} {symbol}</span></div>}
              <div className="flex justify-between text-sm pt-1.5 border-t border-slate-700/40 font-bold"><span className="text-white">{t("invoice.total")}</span><span className="font-inter text-blue-400">{fmt(totals.total)} {symbol}</span></div>
            </div>
          )}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.notes")}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder={t("invoice.notes")} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("quotation.status")}</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
              <option value="Draft">{t("quotation.draft")}</option>
              <option value="Sent">{t("quotation.sent")}</option>
              <option value="Accepted">{t("quotation.accepted")}</option>
              <option value="Rejected">{t("quotation.rejected")}</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 text-base mt-2">
            {saving ? t("settings.saving") : `💾 ${t("invoice.save")}`}
          </button>
        </form>
      </div>
    </div>
  );
}
