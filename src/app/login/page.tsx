"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(t("auth.wrongCredentials"));
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl" />
      </div>
      <div className="fixed top-4 right-4 z-20"><LanguageSwitcher /></div>
      <div className="glass rounded-3xl p-8 w-full max-w-sm relative z-10 fade-in">
        <div className="text-center mb-8">
          <img src="/logo-dark.png" alt="Invoicaty" className="w-16 h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">{t("auth.loginTitle")}</h1>
          <p className="text-slate-400 text-sm mt-1">{t("auth.loginSubtitle")}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">{t("auth.email")}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder={t("auth.emailPlaceholder")} dir="ltr"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">{t("auth.password")}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••" dir="ltr"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none" />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <div className="text-left">
            <Link href="/reset-password" className="text-xs text-slate-400 hover:text-blue-400 transition-colors">{t("auth.forgotPassword")}</Link>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 text-base">
            {loading ? t("auth.loginLoading") : t("auth.loginBtn")}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="text-blue-400 font-bold hover:underline">{t("auth.registerNow")}</Link>
        </p>
      </div>
    </div>
  );
}
