"use client";
import { useState, useRef } from "react";

interface ImportedInvoice {
  date: string;
  client: string;
  project: string;
  description: string;
  amount: number;
  status: string;
  category: string;
}

interface Props {
  onImport: (invoices: ImportedInvoice[]) => Promise<void>;
  onClose: () => void;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

export default function ImportModal({ onImport, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportedInvoice[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setError("");
    setPreview([]);

    const text = await f.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { setError("الملف فارغ أو لا يحتوي بيانات"); return; }

    // Parse header
    const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Map columns
    const colMap: Record<string, number> = {};
    const aliases: Record<string, string[]> = {
      date: ['date', 'تاريخ', 'invoicedate'],
      client: ['client', 'عميل', 'customer', 'اسمالعميل', 'customername'],
      project: ['project', 'مشروع', 'notes', 'ملاحظات', 'projectname'],
      description: ['description', 'وصف', 'تفاصيل', 'details', 'desc'],
      amount: ['amount', 'مبلغ', 'total', 'المبلغ', 'price', 'سعر'],
      status: ['status', 'حالة', 'paymentstatus', 'حالةالدفع', 'paid'],
      category: ['category', 'تصنيف', 'type', 'نوع'],
    };

    for (const [key, names] of Object.entries(aliases)) {
      const idx = header.findIndex(h => names.some(n => h.includes(n)));
      if (idx !== -1) colMap[key] = idx;
    }

    if (!colMap.client && !colMap.amount) {
      setError("لم يتم التعرف على أعمدة الملف. تأكد أن الملف يحتوي أعمدة مثل: Date, Client, Amount, Status");
      return;
    }

    // Parse rows
    const rows: ImportedInvoice[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 2) continue;

      const get = (key: string) => colMap[key] !== undefined ? (cols[colMap[key]] || '') : '';
      const amtStr = get('amount').replace(/[^0-9.\-]/g, '');
      const statusRaw = get('status').toLowerCase();

      rows.push({
        date: get('date') || new Date().toISOString().split('T')[0],
        client: get('client') || 'غير محدد',
        project: get('project') || '',
        description: get('description') || '',
        amount: parseFloat(amtStr) || 0,
        status: (statusRaw.includes('paid') || statusRaw.includes('مدفوع')) && !statusRaw.includes('not') && !statusRaw.includes('غير') ? 'Paid' : 'Not Paid',
        category: get('category') || '',
      });
    }

    if (rows.length === 0) { setError("لم يتم إيجاد بيانات صالحة في الملف"); return; }
    setPreview(rows);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      await onImport(preview);
      setDone(true);
    } catch {
      setError("حدث خطأ أثناء الاستيراد");
    }
    setImporting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto slide-up" onClick={e => e.stopPropagation()}>
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">📥 استيراد فواتير</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl w-9 h-9 rounded-xl hover:bg-slate-700/50 flex items-center justify-center">✕</button>
        </div>

        <div className="p-6">
          {done ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-lg font-bold text-white mb-2">تم استيراد {preview.length} فاتورة بنجاح!</h3>
              <button onClick={onClose} className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">إغلاق</button>
            </div>
          ) : !preview.length ? (
            <>
              {/* Upload area */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-600/50 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
              >
                <div className="text-4xl mb-3">📄</div>
                <p className="text-white font-bold text-sm mb-1">اضغط لاختيار ملف CSV</p>
                <p className="text-slate-500 text-xs">أو اسحب الملف هنا</p>
                {file && <p className="text-blue-400 text-xs mt-3 font-bold">{file.name}</p>}
              </div>
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

              {error && <p className="text-red-400 text-xs mt-4 text-center">{error}</p>}

              <div className="mt-6 glass rounded-xl p-4">
                <p className="text-xs font-bold text-slate-400 mb-2">📋 تنسيق الملف المتوقع:</p>
                <code className="text-[10px] text-slate-500 block leading-relaxed font-inter" dir="ltr">
                  Date, Client, Project, Amount, Status<br/>
                  2024-01-15, شركة ABC, تصميم شعار, 500, Paid<br/>
                  2024-02-01, أحمد محمد, فيديو, 300, Not Paid
                </code>
              </div>
            </>
          ) : (
            <>
              {/* Preview */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-white">معاينة: {preview.length} فاتورة</span>
                <button onClick={() => { setPreview([]); setFile(null); }} className="text-xs text-slate-400 hover:text-white">← ملف آخر</button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {preview.slice(0, 20).map((inv, i) => (
                  <div key={i} className="glass rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-xs">{inv.client}</div>
                      <div className="text-slate-500 text-[10px]">{inv.project} • {inv.date}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-inter font-bold text-white text-xs">{inv.amount.toLocaleString()} د.ك</div>
                      <div className={`text-[10px] ${inv.status === 'Paid' ? 'text-green-400' : 'text-red-400'}`}>
                        {inv.status === 'Paid' ? '✅' : '🚩'} {inv.status === 'Paid' ? 'مدفوع' : 'معلق'}
                      </div>
                    </div>
                  </div>
                ))}
                {preview.length > 20 && <p className="text-slate-500 text-xs text-center">+{preview.length - 20} فاتورة أخرى...</p>}
              </div>

              {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}

              <button onClick={handleImport} disabled={importing}
                className="w-full mt-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50">
                {importing ? "جاري الاستيراد..." : `📥 استيراد ${preview.length} فاتورة`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
