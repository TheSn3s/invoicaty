"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import InvoiceModal from "../../components/InvoiceModal";
import DeleteModal from "../../components/DeleteModal";
import StatsCards from "../../components/StatsCards";
import InvoiceTable from "../../components/InvoiceTable";
import { printInvoice } from "../../lib/print-invoice";

export const dynamic = "force-dynamic";

interface Invoice {
  id: string;
  serial: string;
  date: string;
  client: string;
  project: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  category: string;
}

interface Profile {
  full_name: string;
  business_name: string;
  phone: string;
  email: string;
  bank_name: string;
  bank_account: string;
  bank_iban: string;
  bank_holder: string;
  brand_color: string;
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const [{ data: inv }, { data: prof }] = await Promise.all([
      supabase.from("invoices").select("*").order("date", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single()
    ]);

    setInvoices(inv || []);
    setProfile(prof || null);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (data: Partial<Invoice>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editInvoice) {
      await supabase.from("invoices").update({
        date: data.date,
        client: data.client,
        project: data.project,
        description: data.description,
        amount: data.amount,
        status: data.status,
        category: data.category,
      }).eq("id", editInvoice.id);
    } else {
      const maxSerial = invoices.reduce((max, inv) => {
        const n = parseInt(inv.serial);
        return !isNaN(n) && n > max ? n : max;
      }, 0);

      await supabase.from("invoices").insert({
        user_id: user.id,
        serial: String(maxSerial + 1).padStart(3, "0"),
        ...data,
      });
    }

    setShowModal(false);
    setEditInvoice(null);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteInvoice) return;
    await supabase.from("invoices").delete().eq("id", deleteInvoice.id);
    setDeleteInvoice(null);
    loadData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = !search ||
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.project.toLowerCase().includes(search.toLowerCase()) ||
      inv.serial.includes(search);
    const matchStatus = statusFilter === "all" ||
      (statusFilter === "Paid" && inv.status === "Paid") ||
      (statusFilter === "Not Paid" && inv.status === "Not Paid");
    return matchSearch && matchStatus;
  });

  // Stats
  const now = new Date();
  const totalIncome = invoices.reduce((s, i) => s + (i.status !== "Canceled" ? Number(i.amount) || 0 : 0), 0);
  const monthIncome = invoices.filter(i => {
    const d = new Date(i.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && i.status !== "Canceled";
  }).reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const yearIncome = invoices.filter(i => {
    return new Date(i.date).getFullYear() === now.getFullYear() && i.status !== "Canceled";
  }).reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const outstanding = invoices.filter(i => i.status === "Not Paid");
  const outstandingTotal = outstanding.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-slate-700/50 px-4 py-3 md:px-8 md:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-black text-white">i</div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Invoicaty</h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">{profile?.full_name || profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setEditInvoice(null); setShowModal(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
              <span>+</span> فاتورة جديدة
            </button>
            <button onClick={handleLogout}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm">
              ⬅️
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-5">
        {/* Stats */}
        <StatsCards
          total={totalIncome}
          month={monthIncome}
          year={yearIncome}
          outstanding={outstandingTotal}
          outstandingCount={outstanding.length}
        />

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالعميل أو المشروع أو الرقم..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pr-9 pl-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 min-w-[140px]">
            <option value="all">كل الحالات</option>
            <option value="Paid">مدفوع ✅</option>
            <option value="Not Paid">معلق 🚩</option>
          </select>
          <div className="flex items-center justify-center gap-1.5 bg-slate-800/30 rounded-xl px-4 py-3 border border-slate-700/30 min-w-[100px]">
            <span className="text-slate-500 text-xs">النتائج:</span>
            <span className="font-inter font-bold text-blue-400">{filtered.length}</span>
          </div>
        </div>

        {/* Table */}
        <InvoiceTable
          invoices={filtered}
          onEdit={(inv) => { setEditInvoice(inv); setShowModal(true); }}
          onDelete={(inv) => setDeleteInvoice(inv)}
          onPrint={(inv) => printInvoice(inv, profile)}
        />
      </main>

      {/* Mobile FAB */}
      <button onClick={() => { setEditInvoice(null); setShowModal(true); }}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center justify-center text-white text-2xl z-20 active:scale-95 transition-transform safe-bottom">
        +
      </button>

      {/* Modals */}
      {showModal && (
        <InvoiceModal
          invoice={editInvoice}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditInvoice(null); }}
        />
      )}
      {deleteInvoice && (
        <DeleteModal
          serial={deleteInvoice.serial}
          onConfirm={handleDelete}
          onClose={() => setDeleteInvoice(null)}
        />
      )}
    </div>
  );
}
