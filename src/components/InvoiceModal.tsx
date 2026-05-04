"use client";
import { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import LineItemsEditor, { LineItem, makeEmptyItem, calcSubtotal } from "./LineItemsEditor";

interface Invoice {
  id: string; serial: string; date: string; client: string;
  project: string; description: string; amount: number;
  currency: string; status: string; category: string;
  discount?: number;
  tax_rate?: number;
  notes?: string;
  items?: LineItem[] | null;
}

interface Props {
  invoice: Invoice | null;
  onSave: (data: Partial<Invoice> & { items: LineItem[] }) => void;
  onClose: () => void;
  currencySymbol?: string;
  defaultTaxRate?: number;
}

/** Build initial items: from existing invoice.items, or fallback to legacy single-line */
function initialItems(invoice: Invoice | null): LineItem[] {
  if (invoice?.items && Array.isArray(invoice.items) && invoice.items.length > 0) {
    return invoice.items.map((it) => ({
      description: it.description || "",
      quantity: Number(it.quantity) || 1,
      unit_price: Number(it.unit_price) || 0,
    }));
  }
  if (invoice) {
    // Legacy migration: project + description → first line item with full amount
    return [{
      description: invoice.project + (invoice.description ? ` — ${invoice.description}` : ""),
      quantity: 1,
      unit_price: Number(invoice.amount) || 0,
    }];
  }
  return [makeEmptyItem()];
}

export default function InvoiceModal({ invoice, onSave, onClose, currencySymbol, defaultTaxRate = 0 }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<LineItem[]>([makeEmptyItem()]);
  const [discount, setDiscount] = useState("");
  const [taxRate, setTaxRate] = useState<string>(defaultTaxRate > 0 ? String(defaultTaxRate) : "0");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Not Paid");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const { t, lang } = useI18n();
  const symbol = currencySymbol || (lang === 'ar' ? 'د.ك' : 'KWD');

  useEffect(() => {
    if (invoice) {
      setDate(invoice.date);
      setClient(invoice.client);
      setProject(invoice.project);
      setDescription(invoice.description || "");
      setItems(initialItems(invoice));
      setDiscount(String(invoice.discount || 0));
      setTaxRate(String(invoice.tax_rate ?? defaultTaxRate ?? 0));
      setNotes(invoice.notes || "");
      setStatus(invoice.status);
      setCategory(invoice.category || "");
    } else {
      setItems([makeEmptyItem()]);
      setTaxRate(defaultTaxRate > 0 ? String(defaultTaxRate) : "0");
    }
  }, [invoice, defaultTaxRate]);

  // Live calculations from line items
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate: at least one item with description and positive total
    const validItems = items.filter(it => it.description.trim() && (Number(it.quantity) * Number(it.unit_price)) >= 0);
    if (validItems.length === 0) return;
    if (totals.sub < 0) return;
    setSaving(true);
    await onSave({
      date, client, project, description,
      amount: totals.sub,                // subtotal (sum of line items)
      items: validItems,
      discount: parseFloat(discount) || 0,
      tax_rate: parseFloat(taxRate) || 0,
      notes: notes.trim() || "",
      status, category
    });
    setSaving(false);
  };

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 });

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[90vh] overflow-y-auto slide-up mx-auto" onClick={e => e.stopPropagation()}>
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">
            {invoice ? `✏️ ${t("invoice.editInvoice")} #${invoice.serial}` : `➕ ${t("invoice.addInvoice")}`}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl w-9 h-9 rounded-xl hover:bg-slate-700/50 flex items-center justify-center transition-all">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.date")}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full block bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" style={{ minWidth: 0, WebkitAppearance: 'none', appearance: 'none' }} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.category")} <span className="text-slate-600 font-normal">({lang === "ar" ? "لا يظهر للعميل" : "not visible to client"})</span></label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)}
                placeholder={lang === "ar" ? "تصوير، مونتاج، تصميم..." : "Photography, editing, design..."}
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.client")}</label>
            <input type="text" value={client} onChange={e => setClient(e.target.value)} required
              placeholder={t("invoice.client")}
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.project")}</label>
            <input type="text" value={project} onChange={e => setProject(e.target.value)} required
              placeholder={t("invoice.project")}
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.description")} <span className="text-slate-600 font-normal">({lang === "ar" ? "اختياري" : "optional"})</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder={lang === "ar" ? "نبذة عن المشروع" : "Brief about the project"}
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none resize-none" />
          </div>

          {/* Line items editor */}
          <LineItemsEditor items={items} onChange={setItems} currencySymbol={symbol} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.discount")} ({symbol})</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} step="0.5"
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
            </div>
            {defaultTaxRate > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.taxRate")}</label>
                <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} step="0.01" min="0" max="100" dir="ltr"
                  placeholder="0"
                  className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
              </div>
            )}
          </div>

          {/* Live totals summary */}
          {totals.sub > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t("invoice.subtotal")}</span>
                <span className="font-inter text-white">{fmt(totals.sub)} {symbol}</span>
              </div>
              {totals.disc > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">- {t("invoice.discount")}</span>
                  <span className="font-inter text-red-400">{fmt(totals.disc)} {symbol}</span>
                </div>
              )}
              {showTax && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">+ {t("invoice.tax")} ({totals.rate}%)</span>
                  <span className="font-inter text-amber-400">{fmt(totals.taxAmount)} {symbol}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-1.5 border-t border-slate-700/40 font-bold">
                <span className="text-white">{t("invoice.total")}</span>
                <span className="font-inter text-blue-400">{fmt(totals.total)} {symbol}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.notes")}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder={t("invoice.notes")}
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none resize-none" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.status")}</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
              <option value="Paid">{t("dashboard.paid")}</option>
              <option value="Not Paid">{t("dashboard.notPaid")}</option>
              <option value="Cancelled">{lang === 'ar' ? 'ملغاة' : 'Cancelled'}</option>
            </select>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 text-base mt-2">
            {saving ? t("settings.saving") : `💾 ${t("invoice.save")}`}
          </button>
        </form>
      </div>
    </div>
  );
}
