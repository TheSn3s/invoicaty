"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Language = "ar" | "en";

interface UserProfile {
  id: string;
  full_name: string;
  business_name: string;
  phone: string;
  email: string;
  role: string;
  created_at: string;
  country_code?: string | null;
  default_currency?: string | null;
  preferred_language?: Language | null;
  invoice_count?: number;
  totals_by_currency?: Record<string, number>;
  paid_by_currency?: Record<string, number>;
}

interface CountryRow {
  code: string;
  name_ar: string;
  name_en: string;
  flag_emoji?: string | null;
}

interface CurrencyRow {
  code: string;
  name_ar: string;
  name_en: string;
  symbol?: string | null;
}

interface AdminStats {
  totalUsers: number;
  totalInvoices: number;
  representedCountries: number;
  usedCurrencies: number;
  newUsers7d: number;
  newUsers30d: number;
  newUsers90d: number;
  newInvoices30d: number;
  avgInvoicesPerUser: number;
}

interface UserModalData {
  full_name: string;
  business_name: string;
  phone: string;
  email: string;
  role: string;
}

interface DistributionRow {
  key: string;
  label: string;
  count: number;
}

interface CurrencyAggregate {
  currency: string;
  total: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalInvoices: 0,
    representedCountries: 0,
    usedCurrencies: 0,
    newUsers7d: 0,
    newUsers30d: 0,
    newUsers90d: 0,
    newInvoices30d: 0,
    avgInvoicesPerUser: 0,
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [countryMap, setCountryMap] = useState<Record<string, CountryRow>>({});
  const [currencyMap, setCurrencyMap] = useState<Record<string, CurrencyRow>>({});
  const [paidByCurrency, setPaidByCurrency] = useState<CurrencyAggregate[]>([]);
  const [unpaidByCurrency, setUnpaidByCurrency] = useState<CurrencyAggregate[]>([]);
  const [usersByCountry, setUsersByCountry] = useState<DistributionRow[]>([]);
  const [usersByCurrency, setUsersByCurrency] = useState<DistributionRow[]>([]);
  const [usersByLanguage, setUsersByLanguage] = useState<DistributionRow[]>([]);
  const [topCountries, setTopCountries] = useState<DistributionRow[]>([]);
  const [topUsersByActivity, setTopUsersByActivity] = useState<UserProfile[]>([]);
  const [topUsersByCurrency, setTopUsersByCurrency] = useState<Array<{ currency: string; users: Array<{ user: UserProfile; amount: number }> }>>([]);
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

  const labelForCountry = useCallback((code?: string | null) => {
    if (!code) return "غير محدد";
    const country = countryMap[code];
    return country ? `${country.flag_emoji ? country.flag_emoji + " " : ""}${country.name_ar || country.name_en}` : code;
  }, [countryMap]);

  const labelForCurrency = useCallback((code?: string | null) => {
    if (!code) return "غير محددة";
    const currency = currencyMap[code];
    return currency ? `${code}${currency.symbol ? ` (${currency.symbol})` : ""}` : code;
  }, [currencyMap]);

  const labelForLanguage = (lang?: string | null) => {
    if (lang === "en") return "English";
    if (lang === "ar") return "العربية";
    return "غير محددة";
  };

  const sumObjectValues = (obj?: Record<string, number>) => Object.values(obj || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);

  const formatCurrencyLines = useCallback((totals?: Record<string, number>, emptyText = "لا يوجد") => {
    const entries = Object.entries(totals || {}).filter(([, value]) => Number(value) > 0);
    if (!entries.length) return [emptyText];
    return entries
      .sort((a, b) => b[1] - a[1])
      .map(([currency, amount]) => `${Number(amount).toLocaleString()} ${labelForCurrency(currency)}`);
  }, [labelForCurrency]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();

    if (!profile || profile.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const [{ data: profiles }, { data: invoices }, { data: countries }, { data: currencies }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("invoices").select("user_id, amount, total, currency, status, created_at"),
      supabase.from("countries").select("code, name_ar, name_en, flag_emoji"),
      supabase.from("currencies").select("code, name_ar, name_en, symbol"),
    ]);

    const allProfiles = profiles || [];
    const allInvoices = invoices || [];
    const countriesMap = Object.fromEntries((countries || []).map((c) => [c.code, c]));
    const currenciesMap = Object.fromEntries((currencies || []).map((c) => [c.code, c]));
    setCountryMap(countriesMap);
    setCurrencyMap(currenciesMap);

    const userInvoiceMap: Record<string, { count: number; totals: Record<string, number>; paidTotals: Record<string, number> }> = {};
    const paidTotalsMap: Record<string, number> = {};
    const unpaidTotalsMap: Record<string, number> = {};
    const invoiceCurrencyUsage = new Set<string>();

    allInvoices.forEach((inv) => {
      const userId = inv.user_id as string;
      const currency = (inv.currency as string) || "USD";
      const amount = Number(inv.total ?? inv.amount) || 0;
      invoiceCurrencyUsage.add(currency);

      if (!userInvoiceMap[userId]) {
        userInvoiceMap[userId] = { count: 0, totals: {}, paidTotals: {} };
      }
      userInvoiceMap[userId].count += 1;
      userInvoiceMap[userId].totals[currency] = (userInvoiceMap[userId].totals[currency] || 0) + amount;

      if (inv.status === "Paid") {
        userInvoiceMap[userId].paidTotals[currency] = (userInvoiceMap[userId].paidTotals[currency] || 0) + amount;
        paidTotalsMap[currency] = (paidTotalsMap[currency] || 0) + amount;
      } else if (inv.status === "Not Paid") {
        unpaidTotalsMap[currency] = (unpaidTotalsMap[currency] || 0) + amount;
      }
    });

    const enrichedUsers: UserProfile[] = allProfiles.map((p) => ({
      ...p,
      invoice_count: userInvoiceMap[p.id]?.count || 0,
      totals_by_currency: userInvoiceMap[p.id]?.totals || {},
      paid_by_currency: userInvoiceMap[p.id]?.paidTotals || {},
    }));

    const now = new Date();
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = daysAgo(7);
    const thirtyDaysAgo = daysAgo(30);
    const ninetyDaysAgo = daysAgo(90);

    const groupCount = <T,>(items: T[], keyFn: (item: T) => string) => {
      const map = new Map<string, number>();
      items.forEach((item) => {
        const key = keyFn(item);
        map.set(key, (map.get(key) || 0) + 1);
      });
      return Array.from(map.entries())
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);
    };

    const userCountryDistribution = groupCount(enrichedUsers, (u) => u.country_code || "unknown").map(({ key, count }) => ({
      key,
      count,
      label: key === "unknown" ? "غير محدد" : `${countriesMap[key]?.flag_emoji ? countriesMap[key].flag_emoji + " " : ""}${countriesMap[key]?.name_ar || countriesMap[key]?.name_en || key}`,
    }));

    const userCurrencyDistribution = groupCount(enrichedUsers, (u) => u.default_currency || "unknown").map(({ key, count }) => ({
      key,
      count,
      label: key === "unknown" ? "غير محددة" : `${key}${currenciesMap[key]?.symbol ? ` (${currenciesMap[key].symbol})` : ""}`,
    }));

    const userLanguageDistribution = groupCount(enrichedUsers, (u) => u.preferred_language || "unknown").map(({ key, count }) => ({
      key,
      count,
      label: labelForLanguage(key),
    }));

    const topByActivity = [...enrichedUsers]
      .sort((a, b) => (b.invoice_count || 0) - (a.invoice_count || 0))
      .slice(0, 5);

    const totalsByCurrencyGroups = Array.from(invoiceCurrencyUsage)
      .sort()
      .map((currency) => ({
        currency,
        users: enrichedUsers
          .map((user) => ({ user, amount: Number(user.totals_by_currency?.[currency] || 0) }))
          .filter((row) => row.amount > 0)
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5),
      }))
      .filter((group) => group.users.length > 0)
      .sort((a, b) => {
        const totalA = groupTotal(a.users);
        const totalB = groupTotal(b.users);
        return totalB - totalA;
      });

    setStats({
      totalUsers: enrichedUsers.length,
      totalInvoices: allInvoices.length,
      representedCountries: new Set(enrichedUsers.map((u) => u.country_code).filter(Boolean)).size,
      usedCurrencies: new Set([
        ...enrichedUsers.map((u) => u.default_currency).filter(Boolean),
        ...Array.from(invoiceCurrencyUsage),
      ]).size,
      newUsers7d: enrichedUsers.filter((p) => new Date(p.created_at) > sevenDaysAgo).length,
      newUsers30d: enrichedUsers.filter((p) => new Date(p.created_at) > thirtyDaysAgo).length,
      newUsers90d: enrichedUsers.filter((p) => new Date(p.created_at) > ninetyDaysAgo).length,
      newInvoices30d: allInvoices.filter((i) => new Date(i.created_at as string) > thirtyDaysAgo).length,
      avgInvoicesPerUser: enrichedUsers.length > 0 ? allInvoices.length / enrichedUsers.length : 0,
    });

    setPaidByCurrency(toCurrencyAggregates(paidTotalsMap));
    setUnpaidByCurrency(toCurrencyAggregates(unpaidTotalsMap));
    setUsersByCountry(userCountryDistribution);
    setUsersByCurrency(userCurrencyDistribution);
    setUsersByLanguage(userLanguageDistribution);
    setTopCountries(userCountryDistribution.slice(0, 5));
    setTopUsersByActivity(topByActivity);
    setTopUsersByCurrency(totalsByCurrencyGroups);
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
      }
    } catch (err: any) {
      alert(`خطأ في الاتصال: ${err.message}`);
    }

    setSaving(false);
    setDeleteUser(null);
    loadData();
  };

  const filtered = useMemo(() => users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.business_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q) ||
      (u.country_code || "").toLowerCase().includes(q) ||
      (u.default_currency || "").toLowerCase().includes(q)
    );
  }), [users, search]);

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
      <header className="sticky top-0 z-30 glass border-b border-slate-700/50 px-4 py-3 md:px-8 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-dark.png" alt="Invoicaty" className="h-8 w-auto" />
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">لوحة الإدارة</h1>
              <p className="text-[10px] text-red-400">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/dashboard" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title="لوحة التحكم">📊</Link>
            <Link href="/settings" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title="الإعدادات">⚙️</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-5">
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
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              <StatCard icon="👥" label="إجمالي المستخدمين" value={stats.totalUsers} color="blue" />
              <StatCard icon="📄" label="إجمالي الفواتير" value={stats.totalInvoices} color="purple" />
              <StatCard icon="🌍" label="عدد الدول الممثلة" value={stats.representedCountries} color="cyan" />
              <StatCard icon="💱" label="عدد العملات المستخدمة" value={stats.usedCurrencies} color="amber" />
              <StatCard icon="🆕" label="مستخدمون جدد خلال 7 أيام" value={stats.newUsers7d} color="green" />
              <StatCard icon="📅" label="مستخدمون جدد خلال 30 يوم" value={stats.newUsers30d} color="red" />
              <StatCard icon="🗓️" label="مستخدمون جدد خلال 90 يوم" value={stats.newUsers90d} color="purple" />
              <StatCard icon="📝" label="فواتير جديدة خلال 30 يوم" value={stats.newInvoices30d} color="blue" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <MetricBox title="متوسط عدد الفواتير لكل مستخدم" value={stats.avgInvoicesPerUser.toFixed(1)} icon="📊" tone="blue" />
              <MetricBox title="أكثر الدول استخداماً" value={topCountries[0]?.label || "—"} subtitle={topCountries[0] ? `${topCountries[0].count} مستخدم` : "لا توجد بيانات"} icon="🏁" tone="purple" />
              <MetricBox title="أكثر عملة استخداماً" value={usersByCurrency[0]?.label || "—"} subtitle={usersByCurrency[0] ? `${usersByCurrency[0].count} مستخدم` : "لا توجد بيانات"} icon="💵" tone="green" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <DataPanel title="المدفوع حسب العملة" icon="💰" accent="green">
                <CurrencyTotalsList rows={paidByCurrency} labelForCurrency={labelForCurrency} emptyText="لا توجد مبالغ مدفوعة" />
              </DataPanel>
              <DataPanel title="غير المدفوع حسب العملة" icon="🚩" accent="red">
                <CurrencyTotalsList rows={unpaidByCurrency} labelForCurrency={labelForCurrency} emptyText="لا توجد مبالغ معلقة" />
              </DataPanel>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <DataPanel title="توزيع المستخدمين حسب الدولة" icon="🌍" accent="cyan">
                <DistributionList rows={usersByCountry} emptyText="لا توجد بيانات دول" />
              </DataPanel>
              <DataPanel title="توزيع المستخدمين حسب العملة" icon="💱" accent="amber">
                <DistributionList rows={usersByCurrency} emptyText="لا توجد بيانات عملات" />
              </DataPanel>
              <DataPanel title="توزيع المستخدمين حسب اللغة" icon="🗣️" accent="purple">
                <DistributionList rows={usersByLanguage} emptyText="لا توجد بيانات لغات" />
              </DataPanel>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <DataPanel title="أعلى 5 مستخدمين نشاطاً" icon="🏆" accent="blue">
                {topUsersByActivity.length === 0 ? (
                  <EmptyState text="لا يوجد مستخدمون بعد" />
                ) : (
                  <div className="space-y-2">
                    {topUsersByActivity.map((u, i) => (
                      <UserRankCard
                        key={u.id}
                        index={i}
                        user={u}
                        meta={`${u.invoice_count || 0} فاتورة`}
                        detailLines={formatCurrencyLines(u.totals_by_currency)}
                      />
                    ))}
                  </div>
                )}
              </DataPanel>

              <DataPanel title="أعلى 5 مستخدمين حسب القيمة — داخل كل عملة" icon="💎" accent="green">
                {topUsersByCurrency.length === 0 ? (
                  <EmptyState text="لا توجد بيانات قيم حتى الآن" />
                ) : (
                  <div className="space-y-4">
                    {topUsersByCurrency.map((group) => (
                      <div key={group.currency} className="rounded-2xl border border-slate-700/50 bg-slate-900/30 p-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-white">{labelForCurrency(group.currency)}</span>
                          <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-400 font-bold">Top 5</span>
                        </div>
                        <div className="space-y-2">
                          {group.users.map(({ user, amount }, idx) => (
                            <UserRankCard
                              key={`${group.currency}-${user.id}`}
                              index={idx}
                              user={user}
                              meta={`${Number(amount).toLocaleString()} ${labelForCurrency(group.currency)}`}
                              detailLines={[`${user.invoice_count || 0} فاتورة` ]}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DataPanel>
            </div>
          </div>
        ) : (
          <div className="fade-in">
            <div className="relative mb-4">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الإيميل أو رقم الهاتف أو الدولة أو العملة..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pr-9 pl-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40" />
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs">
                عرض <span className="text-white font-bold font-inter">{filtered.length}</span> من <span className="text-white font-inter">{users.length}</span> مستخدم
              </p>
            </div>

            <div className="space-y-2">
              {filtered.map((user) => (
                <div key={user.id} className="glass rounded-2xl p-4 hover:bg-slate-800/50 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shrink-0">
                      {(user.full_name || user.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white truncate">{user.full_name || "بدون اسم"}</p>
                        {user.role === "admin" && (
                          <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">مدير</span>
                        )}
                        {user.country_code && (
                          <span className="text-[9px] bg-cyan-500/15 text-cyan-300 px-1.5 py-0.5 rounded-full font-bold">{labelForCountry(user.country_code)}</span>
                        )}
                        {user.default_currency && (
                          <span className="text-[9px] bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">{labelForCurrency(user.default_currency)}</span>
                        )}
                        {user.preferred_language && (
                          <span className="text-[9px] bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded-full font-bold">{labelForLanguage(user.preferred_language)}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {user.business_name && <p className="text-[10px] text-slate-500 truncate">🏢 {user.business_name}</p>}

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-[10px] text-slate-500">📄 <span className="font-inter text-slate-300">{user.invoice_count || 0}</span> فاتورة</span>
                        <span className="text-[10px] text-slate-500">📅 {new Date(user.created_at).toLocaleDateString("ar-KW")}</span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
                        <div className="rounded-xl bg-slate-900/40 border border-slate-700/40 p-2.5">
                          <p className="text-[10px] text-slate-500 mb-1">إجمالي الفواتير حسب العملة</p>
                          <div className="space-y-1">
                            {formatCurrencyLines(user.totals_by_currency).map((line) => (
                              <p key={line} className="text-[11px] text-white font-medium">{line}</p>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-900/40 border border-slate-700/40 p-2.5">
                          <p className="text-[10px] text-slate-500 mb-1">المدفوع حسب العملة</p>
                          <div className="space-y-1">
                            {formatCurrencyLines(user.paid_by_currency, "لا يوجد مدفوع").map((line) => (
                              <p key={line} className="text-[11px] text-green-300 font-medium">{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleEditUser(user)} className="text-slate-400 hover:text-blue-400 p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title="تعديل">✏️</button>
                      <button onClick={() => setDeleteUser(user)} className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-700/50 transition-all text-sm" title="حذف">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12"><p className="text-slate-500 text-sm">لا يوجد نتائج</p></div>
              )}
            </div>
          </div>
        )}
      </main>

      {showEditModal && editUser && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditUser(null); }} />
          <div className="relative w-full max-w-lg mx-4 mb-0 md:mb-0 glass rounded-t-3xl md:rounded-3xl p-6 slide-up max-h-[85vh] overflow-y-auto safe-bottom">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">✏️ تعديل المستخدم</h3>
              <button onClick={() => { setShowEditModal(false); setEditUser(null); }} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">الاسم الكامل</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">اسم العمل</label>
                <input type="text" value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">الهاتف</label>
                  <input type="tel" value={formData.phone} dir="ltr" onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">الإيميل</label>
                  <input type="email" value={formData.email} dir="ltr" onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">الصلاحية</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
                  <option value="user">مستخدم عادي</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveUser} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                {saving ? "جاري الحفظ..." : "💾 حفظ التعديلات"}
              </button>
              <button onClick={() => { setShowEditModal(false); setEditUser(null); }} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white glass transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteUser(null)} />
          <div className="relative w-full max-w-md mx-4 glass rounded-t-3xl md:rounded-3xl p-6 slide-up safe-bottom">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/15 text-3xl flex items-center justify-center mx-auto mb-3">🗑️</div>
              <h3 className="text-base font-bold text-white mb-1">حذف المستخدم</h3>
              <p className="text-sm text-slate-400 leading-6">
                هل أنت متأكد من حذف <span className="text-white font-bold">{deleteUser.full_name || deleteUser.email}</span>؟
                <br />
                سيتم حذف الحساب والبيانات المرتبطة به نهائياً.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDeleteUser} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                {saving ? "جاري الحذف..." : "تأكيد الحذف"}
              </button>
              <button onClick={() => setDeleteUser(null)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white glass transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function toCurrencyAggregates(map: Record<string, number>): CurrencyAggregate[] {
  return Object.entries(map)
    .filter(([, total]) => Number(total) > 0)
    .map(([currency, total]) => ({ currency, total: Number(total) }))
    .sort((a, b) => b.total - a.total);
}

function groupTotal(users: Array<{ amount: number }>) {
  return users.reduce((sum, row) => sum + row.amount, 0);
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: "blue" | "purple" | "cyan" | "amber" | "green" | "red" }) {
  const styles = {
    blue: "from-blue-500/20 to-cyan-500/10 border-blue-500/20 text-blue-300",
    purple: "from-purple-500/20 to-fuchsia-500/10 border-purple-500/20 text-purple-300",
    cyan: "from-cyan-500/20 to-sky-500/10 border-cyan-500/20 text-cyan-300",
    amber: "from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-300",
    green: "from-green-500/20 to-emerald-500/10 border-green-500/20 text-green-300",
    red: "from-red-500/20 to-rose-500/10 border-red-500/20 text-red-300",
  } as const;

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${styles[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-2xl md:text-3xl font-black text-white font-inter mb-1">{value}</div>
      <p className="text-[11px] font-bold opacity-90">{label}</p>
    </div>
  );
}

function MetricBox({ title, value, subtitle, icon, tone }: { title: string; value: string; subtitle?: string; icon: string; tone: "blue" | "purple" | "green" }) {
  const tones = {
    blue: "border-blue-500/20 bg-blue-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
    green: "border-green-500/20 bg-green-500/5",
  } as const;
  return (
    <div className={`glass rounded-2xl p-4 border ${tones[tone]}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <p className="text-[11px] text-slate-400 font-bold">{title}</p>
      </div>
      <div className="text-lg md:text-xl font-black text-white leading-snug">{value}</div>
      {subtitle && <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function DataPanel({ title, icon, accent, children }: { title: string; icon: string; accent: "green" | "red" | "cyan" | "amber" | "purple" | "blue"; children: React.ReactNode }) {
  const accents = {
    green: "border-green-500/20",
    red: "border-red-500/20",
    cyan: "border-cyan-500/20",
    amber: "border-amber-500/20",
    purple: "border-purple-500/20",
    blue: "border-blue-500/20",
  } as const;
  return (
    <div className={`glass rounded-3xl p-4 border ${accents[accent]}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DistributionList({ rows, emptyText }: { rows: DistributionRow[]; emptyText: string }) {
  if (!rows.length) return <EmptyState text={emptyText} />;
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="space-y-2.5">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="flex items-center justify-between gap-3 mb-1">
            <p className="text-sm text-white truncate">{row.label}</p>
            <span className="text-[11px] text-slate-400 font-inter shrink-0">{row.count}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-fuchsia-500 to-cyan-500" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CurrencyTotalsList({ rows, labelForCurrency, emptyText }: { rows: CurrencyAggregate[]; labelForCurrency: (code?: string | null) => string; emptyText: string }) {
  if (!rows.length) return <EmptyState text={emptyText} />;
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.currency} className="flex items-center justify-between rounded-2xl bg-slate-900/35 border border-slate-700/40 p-3 gap-3">
          <span className="text-sm text-white truncate">{labelForCurrency(row.currency)}</span>
          <span className="text-sm font-black text-white font-inter shrink-0">{row.total.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function UserRankCard({ index, user, meta, detailLines, compact = false }: { index: number; user: UserProfile; meta: string; detailLines: string[]; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-slate-700/50 bg-slate-900/30 ${compact ? "p-3" : "p-3.5"}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-xs font-black text-white shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-white truncate">{user.full_name || user.business_name || user.email || "بدون اسم"}</p>
            <span className="text-[11px] text-slate-300 font-bold shrink-0">{meta}</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          <div className="mt-1.5 space-y-0.5">
            {detailLines.map((line) => (
              <p key={line} className="text-[11px] text-slate-400 truncate">{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-700/60 p-6 text-center text-sm text-slate-500">{text}</div>;
}
