"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

function PdfIcon() {
  return (
    <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px]" aria-hidden="true">
      <path
        fill="#eb5757"
        d="M573.07,394.56c-8.71,2.57-21.5,2.86-35.21.87-14.71-2.13-29.72-6.63-44.47-13.26,26.31-3.83,46.71-2.65,64.17,3.54,4.14,1.47,10.93,5.38,15.51,8.85ZM426.29,370.43c-1.07.29-2.12.57-3.17.86-7.08,1.93-13.97,3.81-20.6,5.48l-8.95,2.27c-18,4.55-36.41,9.21-54.59,14.75,6.91-16.66,13.33-33.5,19.61-49.97,4.65-12.19,9.4-24.64,14.32-36.94,2.49,4.12,5.09,8.24,7.8,12.37,12.33,18.78,27.84,36.15,45.58,51.19ZM380.5,182.56c1.17,20.56-3.27,40.33-9.77,59.31-8.01-23.46-11.75-49.37-1.73-70.28,2.57-5.36,4.67-8.23,6.04-9.72,2.11,3.26,4.88,10.54,5.46,20.7ZM286.52,442.97c-4.5,8.06-9.1,15.6-13.81,22.72-11.37,17.13-29.96,35.48-39.51,35.48-.94,0-2.08-.15-3.74-1.91-1.07-1.12-1.24-1.93-1.19-3.02.32-6.3,8.67-17.52,20.76-27.92,10.97-9.44,23.38-17.83,37.49-25.35ZM603.48,395.45c-1.46-20.98-36.78-34.44-37.13-34.57-13.65-4.84-28.49-7.19-45.35-7.19-18.05,0-37.5,2.61-62.49,8.45-22.23-15.76-41.44-35.49-55.79-57.34-6.34-9.65-12.03-19.28-17-28.7,12.12-28.99,23.04-60.15,21.06-95.06-1.6-27.99-14.22-46.79-31.38-46.79-11.77,0-21.91,8.72-30.16,25.94-14.7,30.69-10.84,69.96,11.48,116.82-8.04,18.88-15.51,38.46-22.74,57.41-9,23.56-18.26,47.88-28.71,71-29.3,11.59-53.36,25.65-73.42,42.91-13.14,11.29-28.98,28.54-29.89,46.55-.44,8.48,2.47,16.26,8.38,22.49,6.28,6.62,14.17,10.1,22.84,10.11,28.65,0,56.22-39.36,61.45-47.26,10.53-15.87,20.38-33.57,30.04-53.98,24.32-8.79,50.23-15.35,75.35-21.69l9-2.29c6.76-1.72,13.79-3.62,21-5.59,7.63-2.06,15.48-4.2,23.45-6.23,25.79,16.4,53.53,27.1,80.58,31.03,22.78,3.31,43.02,1.39,56.71-5.75,12.32-6.42,13-16.32,12.72-20.28ZM689.51,724.86c0,43.01-37.91,45.66-45.55,45.75H154.9c-42.85,0-45.43-38.17-45.51-45.75V75.13c0-43.05,37.97-45.66,45.51-45.75h330.37l.18.17v128.92c0,25.87,15.64,74.86,74.88,74.86h128.09l1.1,1.1v490.42ZM659.14,203.95h-98.81c-42.84,0-45.43-37.96-45.49-45.47V59.06l144.3,144.89ZM718.89,724.86V222.31L514.85,17.42v-.95h-.98L497.48,0H154.9c-25.91,0-74.9,15.71-74.9,75.14v649.73c0,25.98,15.66,75.13,74.9,75.13h489.1c25.9,0,74.89-15.71,74.89-75.14Z"
      />
      <text
        x="400"
        y="650"
        textAnchor="middle"
        fill="#eb5757"
        fontSize="220"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        PDF
      </text>
    </svg>
  );
}

interface Invoice {
  id: string; serial: string; date: string; client: string;
  project: string; description: string; amount: number;
  currency: string; status: string; category: string;
  discount?: number; tax_rate?: number; tax_amount?: number; total?: number;
  notes?: string;
  items?: Array<{ description: string; quantity: number; unit_price: number }> | null;
}

interface Props {
  invoices: Invoice[];
  onEdit: (inv: Invoice) => void;
  onDelete: (inv: Invoice) => void;
  onPrint: (inv: Invoice) => void;
  onMarkPaid: (inv: Invoice) => void;
  currencySymbol?: string;
}

const PAGE_SIZE = 20;

export default function InvoiceTable({ invoices, onEdit, onDelete, onPrint, onMarkPaid, currencySymbol }: Props) {
  const [page, setPage] = useState(0);
  const { t, lang } = useI18n();
  const symbol = currencySymbol || 'USD';
  const totalPages = Math.ceil(invoices.length / PAGE_SIZE);
  const paged = invoices.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const statusLabel = (s: string) => {
    if (s === "Not Paid") return `🚩 ${t("invoice.notPaid")}`;
    if (s === "Cancelled") return `❌ ${lang === 'ar' ? 'ملغاة' : 'Cancelled'}`;
    return `✅ ${t("invoice.paid")}`;
  };

  const statusStyle = (s: string) => {
    if (s === "Not Paid") return "bg-red-500/15 text-red-400 border border-red-500/20";
    if (s === "Cancelled") return "bg-slate-500/15 text-slate-400 border border-slate-500/20 line-through";
    return "bg-green-500/15 text-green-400 border border-green-500/20";
  };

  if (invoices.length === 0) {
    return (
      <div className="mt-6 glass rounded-2xl p-12 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-slate-400 text-sm">{t("invoice.noInvoices")}</p>
        <p className="text-slate-500 text-xs mt-1">{t("invoice.noInvoicesDesc")}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {paged.map(inv => (
          <div key={inv.id} className="glass rounded-xl p-4 fade-in">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-inter text-blue-400 font-bold text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">#{inv.serial}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyle(inv.status)}`}>
                  {statusLabel(inv.status)}
                </span>
              </div>
              <span className="font-inter font-bold text-white text-sm">{Number(inv.total || inv.amount).toLocaleString()} <span className="text-[10px] text-slate-400">{symbol}</span></span>
            </div>
            <div className="mb-2">
              <div className="font-bold text-white text-sm">{inv.client}</div>
              <div className="text-slate-400 text-xs truncate">{inv.project}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-inter text-slate-500 text-[11px]">{inv.date}</span>
              <div className="flex gap-1.5">
                {inv.status === "Not Paid" && (
                  <button onClick={() => onMarkPaid(inv)} className="bg-green-500/10 hover:bg-green-500/20 p-2 rounded-lg text-sm transition-all active:scale-95" title={t("invoice.markPaid")}>💰</button>
                )}
                <button onClick={() => onPrint(inv)} className="bg-red-500/10 hover:bg-red-500/20 text-red-300 p-2 rounded-lg transition-all active:scale-95" title="PDF" aria-label="PDF">
                  <PdfIcon />
                </button>
                {inv.status !== "Cancelled" && (
                  <button onClick={() => onEdit(inv)} className="bg-blue-500/10 hover:bg-blue-500/20 p-2 rounded-lg text-sm transition-all active:scale-95">✏️</button>
                )}
                <button onClick={() => onDelete(inv)} className="bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg text-sm transition-all active:scale-95">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden">
        <table className={`w-full border-collapse ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="p-4 text-xs font-bold text-slate-400">{t("invoice.serial")}</th>
              <th className="p-4 text-xs font-bold text-slate-400">{t("invoice.date")}</th>
              <th className="p-4 text-xs font-bold text-slate-400">{t("invoice.client")}</th>
              <th className="p-4 text-xs font-bold text-slate-400">{t("invoice.project")}</th>
              <th className="p-4 text-xs font-bold text-slate-400">{t("invoice.amount")}</th>
              <th className="p-4 text-xs font-bold text-slate-400">{t("invoice.status")}</th>
              <th className="p-4 text-xs font-bold text-slate-400">{t("invoice.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(inv => (
              <tr key={inv.id} className="border-b border-slate-800/50 hover:bg-blue-500/5 transition-colors group">
                <td className="p-4">
                  <span className="font-inter text-blue-400 font-bold text-xs bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">#{inv.serial}</span>
                </td>
                <td className="p-4 font-inter text-slate-400 text-sm">{inv.date}</td>
                <td className="p-4 font-bold text-white text-sm">{inv.client}</td>
                <td className="p-4 text-slate-300 text-xs max-w-[200px] truncate">{inv.project}</td>
                <td className="p-4 font-inter font-bold text-white text-sm">{Number(inv.total || inv.amount).toLocaleString()} {symbol}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusStyle(inv.status)}`}>
                    {statusLabel(inv.status)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 md:opacity-60 group-hover:opacity-100 transition-opacity">
                    {inv.status === "Not Paid" && (
                      <button onClick={() => onMarkPaid(inv)} className="bg-green-500/10 hover:bg-green-500/20 text-green-400 p-2 rounded-lg transition-all" title={t("invoice.markPaid")}>💰</button>
                    )}
                    <button onClick={() => onPrint(inv)} className="bg-red-500/10 hover:bg-red-500/20 text-red-300 p-2 rounded-lg transition-all" title={t("invoice.print")} aria-label={t("invoice.print")}>
                      <PdfIcon />
                    </button>
                    {inv.status !== "Cancelled" && (
                      <button onClick={() => onEdit(inv)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2 rounded-lg transition-all" title={t("invoice.edit")}>✏️</button>
                    )}
                    <button onClick={() => onDelete(inv)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-all" title={t("invoice.delete")}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 pb-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="bg-slate-800/50 border border-slate-700/50 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {lang === 'ar' ? '← السابق' : '← Prev'}
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  i === page
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="bg-slate-800/50 border border-slate-700/50 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {lang === 'ar' ? 'التالي →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}
