"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface UserProfile {
  id: string;
  full_name: string;
  business_name: string;
  phone: string;
  email: string;
  role: string;
  created_at: string;
  invoice_count?: number;
  total_amount?: number;
}

interface AdminStats {
  totalUsers: number;
  totalInvoices: number;
  totalPaidAmount: number;
  totalUnpaidAmount: number;
  newUsers30d: number;
  newInvoices30d: number;
}

interface UserModalData {
  full_name: string;
  business_name: string;
  phone: string;
  email: string;
  role: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0, totalInvoices: 0, totalPaidAmount: 0,
    totalUnpaidAmount: 0, newUsers30d: 0, newInvoices30d: 0,
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"overview" | "users">("overview");
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserModalData>({
    full_name: "", business_name: "", phone: "", email: "", role: "user",
  });

  const router = useRouter();
  const supabase = createClient();

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();

    if (!profile || profile.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Load all profiles
    const { data: profiles } = await supabase
      .from("profiles").select("*").order("created_at", { ascending: false });

    // Load all invoices for stats
    const { data: invoices } = await supabase
      .from("invoices").select("user_id, amount, status, created_at");

    const allProfiles = profiles || [];
    const allInvoices = invoices || [];

    // Calculate per-user stats
    const userInvoiceMap: Record<string, { count: number; total: number }> = {};
    allInvoices.forEach((inv) => {
      if (!userInvoiceMap[inv.user_id]) {
        userInvoiceMap[inv.user_id] = { count: 0, total: 0 };
      }
      userInvoiceMap[inv.user_id].count++;
      userInvoiceMap[inv.user_id].total += Number(inv.amount) || 0;
    });

    const enrichedUsers: UserProfile[] = allProfiles.map((p) => ({
      ...p,
      invoice_count: userInvoiceMap[p.id]?.count || 0,
      total_amount: userInvoiceMap[p.id]?.total || 0,
    }));

    // Global stats
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    setStats({
      totalUsers: allProfiles.length,
      totalInvoices: allInvoices.length,
      totalPaidAmount: allInvoices
        .filter((i) => i.status === "Paid")
        .reduce((s, i) => s + (Number(i.amount) || 0), 0),
      totalUnpaidAmount: allInvoices
        .filter((i) => i.status === "Not Paid")
        .reduce((s, i) => s + (Number(i.amount) || 0), 0),
      newUsers30d: allProfiles.filter(
        (p) => new Date(p.created_at) > thirtyDaysAgo
      ).length,
      newInvoices30d: allInvoices.filter(
        (i) => new Date(i.created_at) > thirtyDaysAgo
      ).length,
    });

    setUsers(enrichedUsers);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEditUser = (user: UserProfile) => {
    setEditUser(user);
    setFormData({
      full_name: user.full_name || "",
      business_name: user.business_name || "",
      phone: user.phone || "",
      email: user.email || "",
      role: user.role || "user",
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    setSaving(true);

    await supabase.from("profiles").update({
      full_name: formData.full_name,
      business_name: formData.business_name,
      phone: formData.phone,
      email: formData.email,
      role: formData.role,
      updated_at: new Date().toISOString(),
    }).eq("id", editUser.id);

    setSaving(false);
    setShowEditModal(false);
    setEditUser(null);
    loadData();
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setSaving(true);

    try {
      // Deep delete: يحذف من Supabase Auth + Database + Resend دفعة واحدة
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: deleteUser.id,
          email: deleteUser.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`فشل الحذف: ${data.error || "خطأ غير معروف"}`);
      } else {
        console.log("Delete results:", data.results);
      }
    } catch (err: any) {
      alert(`خطأ في الاتصال: ${err.message}`);
    }

    setSaving(false);
    setDeleteUser(null);
    loadData();
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.business_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q)
    );
  });

  // Top 5 most active users
  const topUsers = [...users]
    .sort((a, b) => (b.invoice_count || 0) - (a.invoice_count || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">جاري تحميل لوحة الإدارة...</p>
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
            <img src="/logo-dark.png" alt="Invoicaty" className="h-8 w-auto" />
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">لوحة الإدارة</h1>
              <p className="text-[10px] text-red-400">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/dashboard"
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title="لوحة التحكم">
              📊
            </Link>
            <Link href="/settings"
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title="الإعدادات">
              ⚙️
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-5">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("overview")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${tab === "overview" ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "glass text-slate-400 hover:text-white"}`}>
            📈 نظرة عامة
          </button>
          <button onClick={() => setTab("users")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${tab === "users" ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "glass text-slate-400 hover:text-white"}`}>
            👥 المستخدمين
          </button>
        </div>

        {tab === "overview" ? (
          <div className="space-y-6 fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <StatCard icon="👥" label="إجمالي المستخدمين" value={stats.totalUsers} color="blue" />
              <StatCard icon="📄" label="إجمالي الفواتير" value={stats.totalInvoices} color="purple" />
              <StatCard icon="💰" label="إجمالي المدفوع" value={stats.totalPaidAmount} color="green" suffix=" د.ك" />
              <StatCard icon="🚩" label="مبالغ معلقة" value={stats.totalUnpaidAmount} color="red" suffix=" د.ك" />
              <StatCard icon="🆕" label="مستخدمين جدد (30 يوم)" value={stats.newUsers30d} color="cyan" />
              <StatCard icon="📝" label="فواتير جديدة (30 يوم)" value={stats.newInvoices30d} color="amber" />
            </div>

            {/* Top Active Users */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">🏆</span>
                أكثر المستخدمين نشاطاً
              </h3>
              {topUsers.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">لا يوجد مستخدمين بعد</p>
              ) : (
                <div className="space-y-2">
                  {topUsers.map((u, i) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-all">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-black text-white">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{u.full_name || u.email || "بدون اسم"}</p>
                        <p className="text-[10px] text-slate-400">{u.business_name || u.email}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-purple-400 font-inter">{u.invoice_count}</p>
                        <p className="text-[10px] text-slate-500">فاتورة</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-green-400 font-inter">{(u.total_amount || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">د.ك</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-sm">📊</span>
                ملخص سريع
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/30 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400">متوسط الفواتير لكل مستخدم</p>
                  <p className="text-lg font-black text-white font-inter">
                    {stats.totalUsers > 0 ? (stats.totalInvoices / stats.totalUsers).toFixed(1) : "0"}
                  </p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400">متوسط قيمة الفاتورة</p>
                  <p className="text-lg font-black text-white font-inter">
                    {stats.totalInvoices > 0
                      ? ((stats.totalPaidAmount + stats.totalUnpaidAmount) / stats.totalInvoices).toFixed(0)
                      : "0"}{" "}
                    <span className="text-xs text-slate-400">د.ك</span>
                  </p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400">نسبة التحصيل</p>
                  <p className="text-lg font-black text-green-400 font-inter">
                    {(stats.totalPaidAmount + stats.totalUnpaidAmount) > 0
                      ? ((stats.totalPaidAmount / (stats.totalPaidAmount + stats.totalUnpaidAmount)) * 100).toFixed(0)
                      : "0"}%
                  </p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400">إجمالي حجم المنصة</p>
                  <p className="text-lg font-black text-blue-400 font-inter">
                    {(stats.totalPaidAmount + stats.totalUnpaidAmount).toLocaleString()}{" "}
                    <span className="text-xs text-slate-400">د.ك</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="fade-in">
            {/* Search */}
            <div className="relative mb-4">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الإيميل أو رقم الهاتف..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pr-9 pl-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40" />
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs">
                عرض <span className="text-white font-bold font-inter">{filtered.length}</span> من{" "}
                <span className="text-white font-inter">{users.length}</span> مستخدم
              </p>
            </div>

            {/* Users List */}
            <div className="space-y-2">
              {filtered.map((user) => (
                <div key={user.id} className="glass rounded-2xl p-4 hover:bg-slate-800/50 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shrink-0">
                      {(user.full_name || user.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white truncate">{user.full_name || "بدون اسم"}</p>
                        {user.role === "admin" && (
                          <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">مدير</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {user.business_name && (
                        <p className="text-[10px] text-slate-500 truncate">🏢 {user.business_name}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-slate-500">
                          📄 <span className="font-inter text-slate-300">{user.invoice_count || 0}</span> فاتورة
                        </span>
                        <span className="text-[10px] text-slate-500">
                          💰 <span className="font-inter text-green-400">{(user.total_amount || 0).toLocaleString()}</span> د.ك
                        </span>
                        <span className="text-[10px] text-slate-500">
                          📅 {new Date(user.created_at).toLocaleDateString("ar-KW")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleEditUser(user)}
                        className="text-slate-400 hover:text-blue-400 p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title="تعديل">
                        ✏️
                      </button>
                      <button onClick={() => setDeleteUser(user)}
                        className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title="حذف">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">لا يوجد نتائج</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditUser(null); }} />
          <div className="relative w-full max-w-lg mx-4 mb-0 md:mb-0 glass rounded-t-3xl md:rounded-3xl p-6 slide-up max-h-[85vh] overflow-y-auto safe-bottom">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">✏️ تعديل المستخدم</h3>
              <button onClick={() => { setShowEditModal(false); setEditUser(null); }}
                className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">الاسم الكامل</label>
                <input type="text" value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">اسم العمل</label>
                <input type="text" value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">الهاتف</label>
                  <input type="tel" value={formData.phone} dir="ltr"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">الإيميل</label>
                  <input type="email" value={formData.email} dir="ltr"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">الصلاحية</label>
                <select value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
                  <option value="user">مستخدم عادي</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveUser} disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                {saving ? "جاري الحفظ..." : "💾 حفظ التعديلات"}
              </button>
              <button onClick={() => { setShowEditModal(false); setEditUser(null); }}
                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white glass transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteUser(null)} />
          <div className="relative w-full max-w-sm mx-4 glass rounded-3xl p-6 slide-up text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
            <h3 className="text-base font-bold text-white mb-2">حذف المستخدم</h3>
            <p className="text-sm text-slate-400 mb-1">
              هل أنت متأكد من حذف <span className="text-white font-bold">{deleteUser.full_name || deleteUser.email}</span>؟
            </p>
            <p className="text-xs text-red-400 mb-5">
              سيتم حذف جميع فواتيره ({deleteUser.invoice_count || 0} فاتورة) نهائياً
            </p>
            <div className="flex gap-3">
              <button onClick={handleDeleteUser} disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                {saving ? "جاري الحذف..." : "🗑️ حذف نهائي"}
              </button>
              <button onClick={() => setDeleteUser(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white glass transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable stat card component
function StatCard({ icon, label, value, color, suffix = "" }: {
  icon: string; label: string; value: number; color: string; suffix?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    green: "bg-green-500/20 text-green-400",
    red: "bg-red-500/20 text-red-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
    amber: "bg-amber-500/20 text-amber-400",
  };
  const badgeMap: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    green: "text-green-400 bg-green-500/10",
    red: "text-red-400 bg-red-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    amber: "text-amber-400 bg-amber-500/10",
  };

  return (
    <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.02]">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${colorMap[color]}`}>{icon}</div>
      </div>
      <div className="text-xl md:text-2xl font-black text-white font-inter">
        {value.toLocaleString()}{suffix && <span className="text-xs text-slate-400 mr-1">{suffix}</span>}
      </div>
      <div className="text-slate-400 text-[10px] mt-0.5">{label}</div>
    </div>
  );
}
