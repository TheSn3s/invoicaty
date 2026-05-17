"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { getCurrencyLabel } from "@/lib/currency";
import type { Currency, Expense, ExpenseStatus, PaymentMethod } from "@/lib/types";
import AppHeader from "@/components/AppHeader";
import CreateMenu from "@/components/CreateMenu";
import AppFooter from "@/components/AppFooter";
import Link from "next/link";

export const dynamic = "force-dynamic";

type ExpenseFormData = Partial<Expense>;

interface Profile {
  full_name: string;
  business_name: string;
  default_currency?: string;
  tax_rate?: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currencyData, setCurrencyData] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { t, lang } = useI18n();
  const effectiveSymbol = getCurrencyLabel(currencyData, lang);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      setEditExpense(null);
      setShowModal(true);
      router.replace("/expenses", { scroll: false });
    }
  }, [router]);

  const loadData = useCallback(async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      router.push("/login");
      return;
    }

    const [{ data: exp }, { data: prof }] = await Promise.all([
      supabase.from("expenses").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single()
    ]);

    setProfile(prof || null);
    if (prof?.default_currency) {
      const { data: curr } = await supabase.from("currencies").select("*").eq("code", prof.default_currency).single();
      if (curr) setCurrencyData(curr);
    }

    setExpenses((exp || []).filter((row: Expense) => row.status !== "Deleted"));
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const summary = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + Number(exp.total || exp.amount || 0), 0);
    const paid = expenses.filter(exp => exp.status === "Paid").reduce((sum, exp) => sum + Number(exp.total || exp.amount || 0), 0);
    const pending = expenses.filter(exp => exp.status === "Pending").reduce((sum, exp) => sum + Number(exp.total || exp.amount || 0), 0);
    const cancelled = expenses.filter(exp => exp.status === "Cancelled").length;
    return { total, paid, pending, cancelled, count: expenses.length };
  }, [expenses]);

  const filtered = useMemo(() => expenses.filter(exp => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || exp.vendor.toLowerCase().includes(q)
      || exp.category.toLowerCase().includes(q)
      || exp.description.toLowerCase().includes(q)
      || exp.serial.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || exp.status === statusFilter;
    return matchSearch && matchStatus;
  }), [expenses, search, statusFilter]);

  const handleSave = async (data: ExpenseFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const amount = Number(data.amount) || 0;
    const taxRate = Number(data.tax_rate) || 0;
    const taxAmount = +(amount * (taxRate / 100)).toFixed(3);
    const total = +(amount + taxAmount).toFixed(3);

    const payload = {
      date: data.date,
      vendor: data.vendor,
      category: data.category || "",
      description: data.description || "",
      amount,
      currency: profile?.default_currency || "USD",
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      status: (data.status || "Paid") as ExpenseStatus,
      payment_method: (data.payment_method || "Bank") as PaymentMethod,
      notes: data.notes || "",
    };

    if (editExpense) {
      await supabase.from("expenses").update(payload).eq("id", editExpense.id);
    } else {
      const maxSerial = expenses.reduce((max, exp) => {
        const n = parseInt(String(exp.serial || "").replace(/^E-/i, ""));
        return !isNaN(n) && n > max ? n : max;
      }, 0);
      await supabase.from("expenses").insert({
        user_id: user.id,
        serial: `E-${String(maxSerial + 1).padStart(3, "0")}`,
        ...payload,
      });
    }

    setShowModal(false);
    setEditExpense(null);
    loadData();
  };

  const handleDelete = async (expense: Expense) => {
    await supabase.from("expenses")
      .update({ status: "Deleted", deleted_at: new Date().toISOString() })
      .eq("id", expense.id);
    loadData();
  };

  const paymentLabel = (method: string) => {
    if (method === "Cash") return t("expense.cash") || "Cash";
    return t("expense.bank") || "Bank";
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: string; label: string }> = {
      Paid: {
        cls: "bg-green-500/15 border-green-500/20 text-green-400",
        icon: "✅",
        label: t("expense.paid") || (lang === "ar" ? "مدفوع" : "Paid"),
      },
      Pending: {
        cls: "bg-amber-500/15 border-amber-500/20 text-amber-400",
        icon: "⏳",
        label: t("expense.pending") || (lang === "ar" ? "معلق" : "Pending"),
      },
      Cancelled: {
        cls: "bg-slate-500/15 border-slate-500/20 text-slate-400",
        icon: "❌",
        label: t("expense.cancelled") || (lang === "ar" ? "ملغي" : "Cancelled"),
      },
    };
    const item = map[status] || map.Paid;
    return <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${item.cls}`}>{item.icon} {item.label}</span>;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <AppHeader
        showBack
        backHref="/dashboard"
        icon="💸"
        title={t("expense.title") || (lang === "ar" ? "المصروفات" : "Expenses")}
        showNav
        rightSlot={(
          <CreateMenu
            onNewInvoice={() => router.push("/dashboard?new=1")}
            onNewExpense={() => { setEditExpense(null); setShowModal(true); }}
            onNewQuotation={() => router.push("/quotations?new=1")}
            onNewDraft={() => router.push("/drafts?new=1")}
            align={lang === 'ar' ? 'left' : 'right'}
          />
        )}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-5">
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 mb-4">
          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 mb-1">{lang === "ar" ? "إجمالي المصروفات" : "Total Expenses"}</div>
            <div className="font-inter text-lg font-bold text-white">{summary.total.toLocaleString()} <span className="text-[11px] text-slate-400">{effectiveSymbol}</span></div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 mb-1">{lang === "ar" ? "المدفوع" : "Paid"}</div>
            <div className="font-inter text-lg font-bold text-green-400">{summary.paid.toLocaleString()} <span className="text-[11px] text-slate-400">{effectiveSymbol}</span></div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 mb-1">{lang === "ar" ? "المعلّق" : "Pending"}</div>
            <div className="font-inter text-lg font-bold text-amber-400">{summary.pending.toLocaleString()} <span className="text-[11px] text-slate-400">{effectiveSymbol}</span></div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 mb-1">{lang === "ar" ? "الملغي" : "Cancelled"}</div>
            <div className="font-inter text-lg font-bold text-slate-300">{summary.cancelled}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 mb-1">{lang === "ar" ? "عدد السجلات" : "Records"}</div>
            <div className="font-inter text-lg font-bold text-blue-400">{summary.count}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("expense.search") || (lang === "ar" ? "بحث في المصروفات..." : "Search expenses...")}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pr-9 pl-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 min-w-[140px]"
          >
            <option value="all">{t("expense.allStatuses") || (lang === "ar" ? "كل الحالات" : "All Statuses")}</option>
            <option value="Paid">{t("expense.paid") || "Paid"}</option>
            <option value="Pending">{t("expense.pending") || "Pending"}</option>
            <option value="Cancelled">{t("expense.cancelled") || "Cancelled"}</option>
          </select>
          <div className="flex items-center justify-center gap-1.5 bg-slate-800/30 rounded-xl px-4 py-3 border border-slate-700/30 min-w-[80px]">
            <span className="font-inter font-bold text-blue-400">{filtered.length}</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">💸</div>
            <p className="text-slate-400 text-sm">{t("expense.noExpenses") || (lang === "ar" ? "لا توجد مصروفات بعد" : "No expenses yet")}</p>
            <p className="text-slate-500 text-xs mt-1">{t("expense.noExpensesDesc") || (lang === "ar" ? "سجّل أول مصروف للبدء" : "Record your first expense to get started")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(exp => (
              <div key={exp.id} className="glass rounded-xl p-4 fade-in">
                <div className="flex items-start justify-between mb-2 gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-inter text-amber-400 font-bold text-xs bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">{exp.serial}</span>
                    {statusBadge(exp.status)}
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full border bg-sky-500/10 border-sky-500/20 text-sky-300">{paymentLabel(exp.payment_method)}</span>
                  </div>
                  <span className="font-inter font-bold text-white text-sm">{Number(exp.total || exp.amount).toLocaleString()} <span className="text-[10px] text-slate-400">{effectiveSymbol}</span></span>
                </div>
                <div className="mb-2">
                  <div className="font-bold text-white text-sm">{exp.vendor}</div>
                  <div className="text-slate-400 text-xs truncate">{exp.category || (lang === "ar" ? "بدون تصنيف" : "Uncategorized")}</div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                    <span className="font-inter">{exp.date}</span>
                    {exp.description && <span className="truncate max-w-[240px]">• {exp.description}</span>}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => { setEditExpense(exp); setShowModal(true); }}
                      className="bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 p-2 rounded-lg transition-all active:scale-95"
                      title={t("invoice.edit") || "Edit"}
                    >✏️</button>
                    <button
                      onClick={() => handleDelete(exp)}
                      className="bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 p-2 rounded-lg transition-all active:scale-95"
                      title={t("invoice.delete") || "Delete"}
                    >🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateMenu
        variant="fab"
        onNewInvoice={() => router.push("/dashboard?new=1")}
        onNewExpense={() => { setEditExpense(null); setShowModal(true); }}
        onNewQuotation={() => router.push("/quotations?new=1")}
        onNewDraft={() => router.push("/drafts?new=1")}
        align={lang === 'ar' ? 'right' : 'left'}
      />

      {showModal && (
        <ExpenseModal
          expense={editExpense}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditExpense(null); }}
          currencySymbol={effectiveSymbol}
          defaultTaxRate={profile?.tax_rate || 0}
        />
      )}

      <AppFooter compact />
    </div>
  );
}

function ExpenseModal({ expense, onSave, onClose, currencySymbol, defaultTaxRate = 0 }: {
  expense: Expense | null;
  onSave: (data: ExpenseFormData) => void;
  onClose: () => void;
  currencySymbol: string;
  defaultTaxRate?: number;
}) {
  const { t, lang } = useI18n();
  const symbol = currencySymbol || "USD";
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [taxRate, setTaxRate] = useState(defaultTaxRate > 0 ? String(defaultTaxRate) : "0");
  const [status, setStatus] = useState<ExpenseStatus>("Paid");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Bank");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setDate(expense.date);
      setVendor(expense.vendor || "");
      setCategory(expense.category || "");
      setDescription(expense.description || "");
      setAmount(String(expense.amount || 0));
      setTaxRate(String(expense.tax_rate ?? defaultTaxRate ?? 0));
      setStatus(expense.status || "Paid");
      setPaymentMethod(expense.payment_method || "Bank");
      setNotes(expense.notes || "");
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setVendor("");
      setCategory("");
      setDescription("");
      setAmount("");
      setTaxRate(defaultTaxRate > 0 ? String(defaultTaxRate) : "0");
      setStatus("Paid");
      setPaymentMethod("Bank");
      setNotes("");
    }
  }, [expense, defaultTaxRate]);

  const showTax = defaultTaxRate > 0;
  const amountNum = Number(amount) || 0;
  const taxRateNum = showTax ? (Number(taxRate) || 0) : 0;
  const taxAmount = +(amountNum * (taxRateNum / 100)).toFixed(3);
  const total = +(amountNum + taxAmount).toFixed(3);
  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim()) return;
    setSaving(true);
    await onSave({
      date,
      vendor: vendor.trim(),
      category: category.trim(),
      description: description.trim(),
      amount: amountNum,
      tax_rate: taxRateNum,
      status,
      payment_method: paymentMethod,
      notes: notes.trim(),
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto slide-up" onClick={e => e.stopPropagation()}>
        <div className="md:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-slate-600 rounded-full" /></div>
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">{expense ? `✏️ ${t("expense.edit") || (lang === "ar" ? "تعديل المصروف" : "Edit Expense")} ${expense.serial}` : `💸 ${t("expense.add") || (lang === "ar" ? "مصروف جديد" : "New Expense")}`}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl w-9 h-9 rounded-xl hover:bg-slate-700/50 flex items-center justify-center transition-all">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("expense.date") || t("invoice.date")}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("expense.vendor") || (lang === "ar" ? "الجهة" : "Vendor")}</label>
            <input type="text" value={vendor} onChange={e => setVendor(e.target.value)} required placeholder={t("expense.vendor") || (lang === "ar" ? "اسم الجهة أو المورد" : "Vendor or payee name")} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("expense.category") || t("invoice.category")}</label>
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder={lang === "ar" ? "سفر، معدات، اشتراك..." : "Travel, equipment, subscription..."} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("expense.description") || t("invoice.description")}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder={lang === "ar" ? "وصف مختصر للمصروف" : "Short expense description"} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none resize-none" />
          </div>

          <div className={`grid gap-3 ${showTax ? "grid-cols-2" : "grid-cols-1"}`}>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("expense.amount") || t("invoice.amount")} ({symbol})</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.001" min="0" className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
            </div>
            {showTax && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("expense.taxRate") || t("invoice.taxRate")}</label>
                <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} step="0.01" min="0" max="100" dir="ltr" className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
              </div>
            )}
          </div>

          {amountNum > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-xs"><span className="text-slate-400">{t("invoice.subtotal")}</span><span className="font-inter text-white">{fmt(amountNum)} {symbol}</span></div>
              {showTax && taxRateNum > 0 && <div className="flex justify-between text-xs"><span className="text-slate-400">+ {t("invoice.tax")} ({taxRateNum}%)</span><span className="font-inter text-amber-400">{fmt(taxAmount)} {symbol}</span></div>}
              <div className="flex justify-between text-sm pt-1.5 border-t border-slate-700/40 font-bold"><span className="text-white">{t("invoice.total")}</span><span className="font-inter text-amber-400">{fmt(total)} {symbol}</span></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("expense.status") || t("invoice.status")}</label>
              <select value={status} onChange={e => setStatus(e.target.value as ExpenseStatus)} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
                <option value="Paid">{t("expense.paid") || "Paid"}</option>
                <option value="Pending">{t("expense.pending") || "Pending"}</option>
                <option value="Cancelled">{t("expense.cancelled") || "Cancelled"}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("expense.paymentMethod") || (lang === "ar" ? "طريقة الدفع" : "Payment Method")}</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
                <option value="Cash">{t("expense.cash") || "Cash"}</option>
                <option value="Bank">{t("expense.bank") || "Bank"}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("invoice.notes")}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder={t("invoice.notes")} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none resize-none" />
          </div>

          <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 text-base mt-2">
            {saving ? t("settings.saving") : `💾 ${t("invoice.save")}`}
          </button>
        </form>
      </div>
    </div>
  );
}
