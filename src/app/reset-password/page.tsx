"use client";
import { useState } from "react";
import { createClient } from "../../lib/supabase";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError("حدث خطأ. تأكد من البريد الإلكتروني وحاول مرة أخرى.");
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="glass rounded-3xl p-10 text-center fade-in max-w-sm w-full border-t-4 border-amber-500">
          <div className="text-6xl mb-6">📩</div>
          <h2 className="text-2xl font-bold text-white mb-3">رابط إعادة التعيين</h2>
          <p className="text-slate-300 text-sm mb-2">أرسلنا رابطاً خاصاً إلى:</p>
          <p className="text-blue-400 font-bold text-base mb-6" dir="ltr">{email}</p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8">
            <p className="text-slate-400 text-xs leading-relaxed">
              يرجى التحقق من بريدك الإلكتروني والضغط على الرابط لتتمكن من اختيار كلمة مرور جديدة.
            </p>
          </div>
          <div className="space-y-3">
            <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="block w-full bg-white text-slate-900 py-3.5 rounded-xl text-sm font-bold transition-all hover:bg-slate-200">
              فتح Gmail
            </a>
            <Link href="/login" className="block w-full bg-slate-800 text-slate-300 py-3.5 rounded-xl text-sm font-bold transition-all hover:bg-slate-700">
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
      <div className="glass rounded-3xl p-8 w-full max-w-sm relative z-10 fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">🔑</div>
          <h1 className="text-2xl font-bold text-white">نسيت كلمة المرور</h1>
          <p className="text-slate-400 text-sm mt-1">أدخل بريدك وسنرسل لك رابط إعادة التعيين</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="email@example.com" dir="ltr"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/50 outline-none" />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 text-base">
            {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          <Link href="/login" className="text-blue-400 font-bold hover:underline">← العودة لتسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
