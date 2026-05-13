"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import AppHeader from "@/components/AppHeader";

type TrashItemType = "invoice" | "quotation" | "draft";

interface TrashItem {
  id: string;
  serial: string;
  date: string;
  deleted_at?: string | null;
  type: TrashItemType;
  title: string;
  subtitle?: string;
  amount?: number;
  currency?: string;
  restoreStatus?: string;
}

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { lang } = useI18n();

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const [{ data: inv }, { data: quo }, { data: drafts }] = await Promise.all([
      supabase.from("invoices").select("*").eq("user_id", user.id).eq("status", "Deleted"),
      supabase.from("quotations").select("*").eq("user_id", user.id).eq("status", "Deleted"),
      supabase.from("drafts").select("*").eq("user_id", user.id).eq("status", "Deleted"),
    ]);

    const merged: TrashItem[] = [
      ...(inv || []).map((row) => ({
        id: row.id,
        serial: row.serial,
        date: row.date,
        deleted_at: row.deleted_at,
        type: "invoice" as const,
        title: row.client,
        subtitle: row.project,
        amount: Number(row.total || row.amount),
        currency: row.currency,
        restoreStatus: "Not Paid",
      })),
      ...(quo || []).map((row) => ({
        id: row.id,
        serial: row.serial,
        date: row.date,
        deleted_at: row.deleted_at,
        type: "quotation" as const,
        title: row.client,
        subtitle: row.project,
        amount: Number(row.total || row.amount),
        currency: row.currency,
        restoreStatus: "Draft",
      })),
      ...(drafts || []).map((row) => ({
        id: row.id,
        serial: row.serial,
        date: row.date,
        deleted_at: row.deleted_at,
        type: "draft" as const,
        title: row.title,
        subtitle: `${row.client} — ${row.project}`,
        restoreStatus: "Draft",
      })),
    ].sort((a, b) => new Date(b.deleted_at || b.date).getTime() - new Date(a.deleted_at || a.date).getTime());

    setItems(merged);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const counts = useMemo(() => ({
    invoice: items.filter(i => i.type === "invoice").length,
    quotation: items.filter(i => i.type === "quotation").length,
    draft: items.filter(i => i.type === "draft").length,
  }), [items]);

  const typeLabel = (type: TrashItemType) => {
    if (type === "invoice") return lang === "ar" ? "فاتورة" : "Invoice";
    if (type === "quotation") return lang === "ar" ? "عرض سعر" : "Quotation";
    return lang === "ar" ? "مسودة" : "Draft";
  };

  const typeIcon = (type: TrashItemType) => {
    if (type === "invoice") return "🧾";
    if (type === "quotation") return "📋";
    return "📝";
  };

  const restoreTable = (type: TrashItemType) => type === "invoice" ? "invoices" : type === "quotation" ? "quotations" : "drafts";

  const handleRestore = async (item: TrashItem) => {
    await supabase.from(restoreTable(item.type)).update({ status: item.restoreStatus, deleted_at: null }).eq("id", item.id);
    loadData();
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    if (!confirm(lang === "ar"
      ? `⚠️ هل أنت متأكد من الحذف النهائي لـ ${typeLabel(item.type)} #${item.serial}؟ لا يمكن التراجع!`
      : `⚠️ Permanently delete ${typeLabel(item.type).toLowerCase()} #${item.serial}? This cannot be undone!`
    )) return;
    await supabase.from(restoreTable(item.type)).delete().eq("id", item.id);
    loadData();
  };

  const handleEmptyTrash = async () => {
    if (!confirm(lang === "ar"
      ? "⚠️ هل أنت متأكد من حذف جميع العناصر من السلة نهائياً؟ لا يمكن التراجع!"
      : "⚠️ Permanently delete ALL trash items? This cannot be undone!"
    )) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await Promise.all([
      supabase.from("invoices").delete().eq("user_id", user.id).eq("status", "Deleted"),
      supabase.from("quotations").delete().eq("user_id", user.id).eq("status", "Deleted"),
      supabase.from("drafts").delete().eq("user_id", user.id).eq("status", "Deleted"),
    ]);
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
      <AppHeader
        showBack
        backHref="/dashboard"
        icon="🗑️"
        title={lang === "ar" ? "سلة المحذوفات" : "Trash"}
        subtitle={lang === "ar"
          ? `${items.length} عنصر محذوف`
          : `${items.length} deleted item${items.length !== 1 ? "s" : ""}`}
        showNav
        rightSlot={items.length > 0 ? (
          <button onClick={handleEmptyTrash}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition-all">
            {lang === "ar" ? "🗑️ إفراغ السلة" : "🗑️ Empty Trash"}
          </button>
        ) : undefined}
      />

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-5">
        {items.length === 0 ? (
          <div className="mt-12 text-center fade-in">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-xl font-bold text-white mb-2">
              {lang === "ar" ? "سلة المحذوفات فارغة" : "Trash is empty"}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {lang === "ar" ? "لا توجد عناصر محذوفة" : "No deleted items"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="glass rounded-xl p-3 text-center"><div className="text-white font-bold">{counts.invoice}</div><div className="text-[11px] text-slate-400">{lang === "ar" ? "فواتير" : "Invoices"}</div></div>
              <div className="glass rounded-xl p-3 text-center"><div className="text-white font-bold">{counts.quotation}</div><div className="text-[11px] text-slate-400">{lang === "ar" ? "عروض أسعار" : "Quotations"}</div></div>
              <div className="glass rounded-xl p-3 text-center"><div className="text-white font-bold">{counts.draft}</div><div className="text-[11px] text-slate-400">{lang === "ar" ? "مسودات" : "Drafts"}</div></div>
            </div>

            <div className="space-y-2 mt-2">
              {items.map(item => (
                <div key={`${item.type}-${item.id}`} className="glass rounded-xl p-4 fade-in flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-inter text-blue-400 font-bold text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">{item.serial}</span>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full border bg-slate-500/15 border-slate-500/20 text-slate-300">{typeIcon(item.type)} {typeLabel(item.type)}</span>
                      <span className="text-white text-sm font-bold truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>{item.date}</span>
                      {item.subtitle && <span className="truncate">{item.subtitle}</span>}
                      {typeof item.amount === "number" && <span className="font-inter font-bold text-slate-400">{item.amount.toLocaleString()} {item.currency || ""}</span>}
                      {item.deleted_at && (
                        <span className="text-red-400/60">
                          {lang === "ar" ? "حُذف" : "Deleted"} {new Date(item.deleted_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleRestore(item)}
                      className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-2 rounded-xl text-xs font-bold transition-all">
                      {lang === "ar" ? "♻️ استرجاع" : "♻️ Restore"}
                    </button>
                    <button onClick={() => handlePermanentDelete(item)}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-xs font-bold transition-all">
                      {lang === "ar" ? "❌ حذف نهائي" : "❌ Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
