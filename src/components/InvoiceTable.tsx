"use client";

interface Invoice {
  id: string; serial: string; date: string; client: string;
  project: string; description: string; amount: number;
  currency: string; status: string; category: string;
}

interface Props {
  invoices: Invoice[];
  onEdit: (inv: Invoice) => void;
  onDelete: (inv: Invoice) => void;
  onPrint: (inv: Invoice) => void;
}

export default function InvoiceTable({ invoices, onEdit, onDelete, onPrint }: Props) {
  if (invoices.length === 0) {
    return (
      <div className="mt-6 glass rounded-2xl p-12 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-slate-400 text-sm">لا توجد فواتير حالياً</p>
        <p className="text-slate-500 text-xs mt-1">اضغط &quot;فاتورة جديدة&quot; للبدء</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {invoices.map(inv => (
          <div key={inv.id} className="glass rounded-xl p-4 fade-in">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-inter text-blue-400 font-bold text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">#{inv.serial}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  inv.status === "Not Paid"
                    ? "bg-red-500/15 text-red-400 border border-red-500/20"
                    : "bg-green-500/15 text-green-400 border border-green-500/20"
                }`}>
                  {inv.status === "Not Paid" ? "🚩 معلق" : "✅ مدفوع"}
                </span>
              </div>
              <span className="font-inter font-bold text-white text-sm">{Number(inv.amount).toLocaleString()} <span className="text-[10px] text-slate-400">د.ك</span></span>
            </div>
            <div className="mb-2">
              <div className="font-bold text-white text-sm">{inv.client}</div>
              <div className="text-slate-400 text-xs truncate">{inv.project}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-inter text-slate-500 text-[11px]">{inv.date}</span>
              <div className="flex gap-1.5">
                <button onClick={() => onPrint(inv)} className="bg-slate-700/50 hover:bg-slate-600/50 p-2 rounded-lg text-sm transition-all active:scale-95">📄</button>
                <button onClick={() => onEdit(inv)} className="bg-blue-500/10 hover:bg-blue-500/20 p-2 rounded-lg text-sm transition-all active:scale-95">✏️</button>
                <button onClick={() => onDelete(inv)} className="bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg text-sm transition-all active:scale-95">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="p-4 text-xs font-bold text-slate-400">رقم الفاتورة</th>
              <th className="p-4 text-xs font-bold text-slate-400">التاريخ</th>
              <th className="p-4 text-xs font-bold text-slate-400">العميل</th>
              <th className="p-4 text-xs font-bold text-slate-400">المشروع</th>
              <th className="p-4 text-xs font-bold text-slate-400">المبلغ</th>
              <th className="p-4 text-xs font-bold text-slate-400">الحالة</th>
              <th className="p-4 text-xs font-bold text-slate-400">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-slate-800/50 hover:bg-blue-500/5 transition-colors group">
                <td className="p-4">
                  <span className="font-inter text-blue-400 font-bold text-xs bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">#{inv.serial}</span>
                </td>
                <td className="p-4 font-inter text-slate-400 text-sm">{inv.date}</td>
                <td className="p-4 font-bold text-white text-sm">{inv.client}</td>
                <td className="p-4 text-slate-300 text-xs max-w-[200px] truncate">{inv.project}</td>
                <td className="p-4 font-inter font-bold text-white text-sm">{Number(inv.amount).toLocaleString()} د.ك</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    inv.status === "Not Paid"
                      ? "bg-red-500/15 text-red-400 border border-red-500/20"
                      : "bg-green-500/15 text-green-400 border border-green-500/20"
                  }`}>
                    {inv.status === "Not Paid" ? "🚩 معلق" : "✅ مدفوع"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onPrint(inv)} className="bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 p-2 rounded-lg transition-all" title="طباعة">📄</button>
                    <button onClick={() => onEdit(inv)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2 rounded-lg transition-all" title="تعديل">✏️</button>
                    <button onClick={() => onDelete(inv)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-all" title="حذف">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
