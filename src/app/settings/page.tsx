"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TEMPLATES = [
  { id: "classic", name: "كلاسيكي", desc: "قالب أنيق واحترافي", preview: "📄" },
  { id: "modern", name: "عصري", desc: "تصميم حديث وبسيط", preview: "🎨" },
  { id: "minimal", name: "بسيط", desc: "الأقل عناصر، الأكثر وضوحاً", preview: "✨" },
];

const COLORS = [
  { value: "#f04444", name: "أحمر" },
  { value: "#3b82f6", name: "أزرق" },
  { value: "#8b5cf6", name: "بنفسجي" },
  { value: "#10b981", name: "أخضر" },
  { value: "#f59e0b", name: "ذهبي" },
  { value: "#ec4899", name: "وردي" },
  { value: "#1e293b", name: "داكن" },
  { value: "#0ea5e9", name: "سماوي" },
];

interface Profile {
  id: string;
  full_name: string;
  business_name: string;
  phone: string;
  email: string;
  bank_name: string;
  bank_account: string;
  bank_iban: string;
  bank_holder: string;
  brand_color: string;
  logo_url: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"profile" | "invoice">("profile");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [brandColor, setBrandColor] = useState("#f04444");
  const [template, setTemplate] = useState("classic");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setBusinessName(data.business_name || "");
        setPhone(data.phone || "");
        setEmail(data.email || user.email || "");
        setBankName(data.bank_name || "");
        setBankAccount(data.bank_account || "");
        setBankIban(data.bank_iban || "");
        setBankHolder(data.bank_holder || "");
        setBrandColor(data.brand_color || "#f04444");
      }
      setLoading(false);
    })();
  }, [supabase, router]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaved(false);

    await supabase.from("profiles").update({
      full_name: fullName,
      business_name: businessName,
      phone,
      email,
      bank_name: bankName,
      bank_account: bankAccount,
      bank_iban: bankIban,
      bank_holder: bankHolder,
      brand_color: brandColor,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-slate-700/50 px-4 py-3 md:px-8 md:py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all">→</Link>
            <h1 className="text-sm font-bold text-white">⚙️ الإعدادات</h1>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
            {saving ? "جاري الحفظ..." : saved ? "✅ تم الحفظ" : "💾 حفظ"}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 pt-5">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("profile")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${tab === "profile" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "glass text-slate-400 hover:text-white"}`}>
            👤 الملف الشخصي
          </button>
          <button onClick={() => setTab("invoice")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${tab === "invoice" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "glass text-slate-400 hover:text-white"}`}>
            🎨 قالب الفاتورة
          </button>
        </div>

        {tab === "profile" ? (
          <div className="space-y-6 fade-in">
            {/* Personal Info */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">👤</span>
                المعلومات الشخصية
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">الاسم الكامل</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="اسمك الكامل"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">اسم العمل / الشركة</label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    placeholder="مثال: منصة الأعمال للإنتاج"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5">رقم الهاتف</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+965 xxxxxxxx" dir="ltr"
                      className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5">البريد الإلكتروني</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="email@example.com" dir="ltr"
                      className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-sm">🏦</span>
                البيانات البنكية <span className="text-[10px] text-slate-500 font-normal">(تظهر في الفاتورة)</span>
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5">اسم البنك</label>
                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)}
                      placeholder="بنك الكويت الوطني"
                      className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5">اسم صاحب الحساب</label>
                    <input type="text" value={bankHolder} onChange={e => setBankHolder(e.target.value)}
                      placeholder="الاسم كما في البنك"
                      className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">رقم الحساب</label>
                  <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)}
                    placeholder="رقم الحساب البنكي" dir="ltr"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">IBAN</label>
                  <input type="text" value={bankIban} onChange={e => setBankIban(e.target.value)}
                    placeholder="KW..." dir="ltr"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none font-inter" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 fade-in">
            {/* Color Picker */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">🎨</span>
                لون الفاتورة
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {COLORS.map(c => (
                  <button key={c.value} onClick={() => setBrandColor(c.value)}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${brandColor === c.value ? 'ring-2 ring-white bg-slate-700/50 scale-105' : 'hover:bg-slate-800/50'}`}>
                    <div className="w-10 h-10 rounded-xl shadow-lg" style={{ backgroundColor: c.value }} />
                    <span className="text-[10px] text-slate-400 font-bold">{c.name}</span>
                    {brandColor === c.value && <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px]">✓</div>}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <label className="text-[11px] font-bold text-slate-400">لون مخصص:</label>
                <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent" />
                <span className="font-inter text-xs text-slate-500">{brandColor}</span>
              </div>
            </div>

            {/* Template Picker */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">📄</span>
                شكل القالب
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl text-right transition-all ${template === t.id ? 'ring-2 bg-slate-700/50' : 'bg-slate-800/30 hover:bg-slate-800/50'}`}
                    style={{ outlineColor: template === t.id ? brandColor : undefined }}>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: template === t.id ? brandColor + '20' : 'rgba(100,116,139,0.1)' }}>
                      {t.preview}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">{t.name}</div>
                      <div className="text-slate-400 text-xs">{t.desc}</div>
                    </div>
                    {template === t.id && <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: brandColor }}>✓</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 text-center" style={{ backgroundColor: brandColor }}>
                <p className="text-white font-black text-lg">{fullName || "اسمك هنا"}</p>
                <p className="text-white/70 text-xs">{businessName || "اسم العمل"}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-slate-400 text-xs">هكذا سيظهر هيدر الفاتورة</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
