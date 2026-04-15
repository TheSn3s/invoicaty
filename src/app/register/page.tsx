"use client";
import { useState } from "react";
import { createClient } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) {
      setError(error.message === "User already registered" ? "هذا البريد مسجل مسبقاً" : error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="glass rounded-3xl p-10 text-center fade-in max-w-sm">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-xl font-bold text-white mb-2">تم التسجيل!</h2>
          <p className="text-slate-400 text-sm mb-4">أرسلنا رابط تأكيد على بريدك الإلكتروني</p>
          <p className="text-blue-400 font-bold text-sm mb-4" dir="ltr">{email}</p>
          <p className="text-slate-500 text-xs mb-6">افتح بريدك واضغط على رابط التأكيد عشان تقدر تسجل دخول</p>
          <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all">
            الذهاب لتسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl" />
      </div>
      <div className="glass rounded-3xl p-8 w-full max-w-sm relative z-10 fade-in">
        <div className="text-center mb-8">
          <img src="/logo-dark.png" alt="Invoicaty" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">حساب جديد</h1>
          <p className="text-slate-400 text-sm mt-1">ابدأ بإدارة فواتيرك مجاناً</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">الاسم الكامل</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="اسمك الكامل"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="email@example.com" dir="ltr"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">كلمة المرور</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="6 أحرف على الأقل" dir="ltr"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 outline-none" />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 text-base">
            {loading ? "جاري التسجيل..." : "إنشاء حساب"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          عندك حساب؟{" "}
          <Link href="/login" className="text-purple-400 font-bold hover:underline">سجّل دخولك</Link>
        </p>
      </div>
    </div>
  );
}
