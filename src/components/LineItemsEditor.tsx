"use client";
import { useI18n } from "@/lib/i18n";

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface Props {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currencySymbol: string;
}

export function makeEmptyItem(): LineItem {
  return { description: "", quantity: 1, unit_price: "" as unknown as number };
}

export function calcSubtotal(items: LineItem[]): number {
  return items.reduce((sum, it) => {
    const q = Number(it.quantity) || 0;
    const p = Number(it.unit_price) || 0;
    return sum + q * p;
  }, 0);
}

export default function LineItemsEditor({ items, onChange, currencySymbol }: Props) {
  const { t, lang } = useI18n();

  const updateItem = (idx: number, patch: Partial<LineItem>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return; // always keep at least one
    onChange(items.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    onChange([...items, makeEmptyItem()]);
  };

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 });

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-400">{t("items.title") || (lang === "ar" ? "بنود الفاتورة" : "Line Items")}</label>
        <span className="text-[10px] text-slate-500 font-inter">{items.length} {items.length === 1 ? (t("items.item") || "item") : (t("items.items") || "items")}</span>
      </div>

      <div className="space-y-2">
        {items.map((it, idx) => {
          const lineTotal = (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
          return (
            <div key={idx} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {t("items.itemNum") || (lang === "ar" ? "بند" : "Item")} #{idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-red-400 hover:bg-red-500/15 border border-red-500/30 w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95"
                    title={t("items.remove") || "Remove"}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>

              <input
                type="text"
                value={it.description}
                onChange={(e) => updateItem(idx, { description: e.target.value })}
                placeholder={t("items.description") || (lang === "ar" ? "وصف البند / الخدمة" : "Item / Service description")}
                required
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{t("items.quantity") || (lang === "ar" ? "الكمية" : "Qty")}</label>
                  <input
                    type="number"
                    value={it.quantity}
                    onChange={(e) => updateItem(idx, { quantity: Math.max(0, parseFloat(e.target.value) || 0) })}
                    min="0"
                    step="1"
                    dir="ltr"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{t("items.unitPrice") || (lang === "ar" ? "السعر" : "Price")} ({currencySymbol})</label>
                  <input
                    type="number"
                    value={it.unit_price === 0 && !it.description ? "" : it.unit_price || ""}
                    onChange={(e) => updateItem(idx, { unit_price: Math.max(0, parseFloat(e.target.value) || 0) })}
                    min="0"
                    step="0.5"
                    dir="ltr"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter text-end"
                  />
                </div>
              </div>

              {lineTotal > 0 && (
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/40">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t("items.lineTotal") || (lang === "ar" ? "إجمالي البند" : "Line total")}</span>
                  <span className="font-inter text-sm font-bold text-blue-400">{fmt(lineTotal)} {currencySymbol}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-dashed border-blue-500/40 text-blue-400 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {t("items.addItem") || (lang === "ar" ? "إضافة بند آخر" : "Add another item")}
      </button>
    </div>
  );
}
