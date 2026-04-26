"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

interface Invoice {
  id: string; serial: string; date: string; client: string;
  project: string; amount: number; currency: string; status: string;
  total?: number; deleted_at?: string;
}

export default function TrashPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { t, lang } = useI18n();

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: inv } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "Deleted")
      .order("deleted_at", { ascending: false });

    setInvoices(inv || []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRestore = async (inv: Invoice) => {
    await supabase.from("invoices")
      .update({ status: "Not Paid", deleted_at: null })
      .eq("id", inv.id);
    loadData();
  };

  const handlePermanentDelete = async (inv: Invoice) => {
    if (!confirm(lang === 'ar'
      ? `⚠️ هل أنت متأكد من الحذف النهائي للفاتورة #${inv.serial}؟ لا يمكن التراجع!`
      : `⚠️ Permanently delete invoice #${inv.serial}? This cannot be undone!`
    )) return;
    await supabase.from("invoices").delete().eq("id", inv.id);
    loadData();
  };

  const handleEmptyTrash = async () => {
    if (!confirm(lang === 'ar'
      ? '⚠️ هل أنت متأكد من حذف جميع الفواتير نهائياً؟ لا يمكن التراجع!'
      : '⚠️ Permanently delete ALL trashed invoices? This cannot be undone!'
    )) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("invoices").delete().eq("user_id", user.id).eq("status", "Deleted");
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-30 glass border-b border-slate-700/50 px-4 py-3 md:px-8 md:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm">←</Link>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight flex items-center gap-2">
                🗑️ {lang === 'ar' ? 'سلة المحذوفات' : 'Trash'}
              </h1>
              <p className="text-[10px] text-slate-400">
                {lang === 'ar' ? `${invoices.length} فاتورة محذوفة` : `${invoices.length} deleted invoice${invoices.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          {invoices.length > 0 && (
            <button onClick={handleEmptyTrash}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition-all">
              {lang === 'ar' ? '🗑️ إفراغ السلة' : '🗑️ Empty Trash'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-5">
        {invoices.length === 0 ? (
          <div className="mt-12 text-center fade-in">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-xl font-bold text-white mb-2">
              {lang === 'ar' ? 'سلة المحذوفات فارغة' : 'Trash is empty'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {lang === 'ar' ? 'لا توجد فواتير محذوفة' : 'No deleted invoices'}
            </p>
            <Link href="/dashboard" className="text-purple-400 font-bold hover:underline text-sm">
              ← {lang === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
            </Link>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {invoices.map(inv => (
              <div key={inv.id} className="glass rounded-xl p-4 fade-in flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-inter text-blue-400 font-bold text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">#{inv.serial}</span>
                    <span className="text-white text-sm font-bold">{inv.client}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{inv.date}</span>
                    <span>{inv.project}</span>
                    <span className="font-inter font-bold text-slate-400">
                      {Number(inv.total || inv.amount).toLocaleString()} {inv.currency}
                    </span>
                    {inv.deleted_at && (
                      <span className="text-red-400/60">
                        {lang === 'ar' ? 'حُذفت' : 'Deleted'} {new Date(inv.deleted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleRestore(inv)}
                    className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-2 rounded-xl text-xs font-bold transition-all">
                    {lang === 'ar' ? '♻️ استرجاع' : '♻️ Restore'}
                  </button>
                  <button onClick={() => handlePermanentDelete(inv)}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-xs font-bold transition-all">
                    {lang === 'ar' ? '❌ حذف نهائي' : '❌ Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
