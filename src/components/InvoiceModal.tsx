"use client";
import { useState, useEffect } from "react";

interface Invoice {
  id: string; serial: string; date: string; client: string;
  project: string; description: string; amount: number;
  currency: string; status: string; category: string;
  discount?: number;
}

interface Props {
  invoice: Invoice | null;
  onSave: (data: Partial<Invoice>) => void;
  onClose: () => void;
}

export default function InvoiceModal({ invoice, onSave, onClose }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [status, setStatus] = useState("Not Paid");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (invoice) {
      setDate(invoice.date);
      setClient(invoice.client);
      setProject(invoice.project);
      setDescription(invoice.description || "");
      setAmount(String(invoice.amount));
      setDiscount(String(invoice.discount || 0));
      setStatus(invoice.status);
      setCategory(invoice.category || "");
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }
    setSaving(true);
    await onSave({ 
      date, 
      client, 
      project, 
      description, 
      amount: parsedAmount, 
      discount: parseFloat(discount) || 0,
      status, 
      category 
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto slide-up" onClick={e => e.stopPropagation()}>
        {/* Handle bar (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">
            {invoice ? `✏️ تعديل #${invoice.serial}` : "➕ فاتورة جديدة"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl w-9 h-9 rounded-xl hover:bg-slate-700/50 flex items-center justify-center transition-all">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">التاريخ</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">التصنيف</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)}
                placeholder="فيديو، تصميم..."
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">العميل</label>
            <input type="text" value={client} onChange={e => setClient(e.target.value)} required
              placeholder="اسم العميل أو الشركة..."
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">المشروع</label>
            <input type="text" value={project} onChange={e => setProject(e.target.value)} required
              placeholder="اسم المشروع..."
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">تفاصيل العمل <span className="text-slate-500">(تظهر في الفاتورة)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="وصف تفصيلي للعمل المنجز..."
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">المبلغ (د.ك)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required step="0.5"
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">الخصم (د.ك)</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} step="0.5"
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">حالة الدفع</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
              <option value="Paid">مدفوع ✅</option>
              <option value="Not Paid">معلق 🚩</option>
            </select>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 text-base mt-2">
            {saving ? "جاري الحفظ..." : "💾 حفظ"}
          </button>
        </form>
      </div>
    </div>
  );
}
