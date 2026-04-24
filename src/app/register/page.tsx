"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { trackSignup } from "@/lib/gtag";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== confirmEmail) { setError(t("auth.emailMismatch")); return; }
    if (password.length < 6) { setError(t("auth.passwordTooShort")); return; }
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
      setError(error.message === "User already registered" ? t("auth.alreadyRegistered") : error.message);
      setLoading(false);
    } else {
      // 📊 Google Ads: track successful signup as conversion
      trackSignup();
      setLoading(false);
      setSuccess(true);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    setError("");
    const { error: resendErr } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResending(false);
    if (resendErr) {
      setError(resendErr.message);
    } else {
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="glass rounded-3xl p-10 text-center fade-in max-w-sm border-t-4 border-green-500">
          <div className="text-6xl mb-6">📩</div>
          <h2 className="text-2xl font-bold text-white mb-3">{t("auth.activationTitle")}</h2>
          <p className="text-slate-300 text-sm mb-2">{t("auth.activationSent")}</p>
          <p className="text-blue-400 font-bold text-base mb-6" dir="ltr">{email}</p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-8">
            <p className="text-slate-400 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: t("auth.activationNote") }} />
          </div>
          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resending}
              className="block w-full bg-blue-600/90 hover:bg-blue-500 text-white py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60">
              {resending ? "⏳ …" : resent ? "✅ تم الإرسال / Resent!" : "📨 إعادة إرسال الإيميل / Resend Email"}
            </button>
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            <p className="text-[11px] text-slate-500 px-2 leading-relaxed mt-2">
              💡 لم يصلك الإيميل؟ تحقّق من مجلد <b>Spam / Junk</b> أو <b>Promotions</b>
            </p>
            <Link href="/login" className="block w-full bg-slate-800 text-slate-300 py-3.5 rounded-xl text-sm font-bold transition-all hover:bg-slate-700">
              {t("auth.backToLogin")}
            </Link>
          </div>
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
      <div className="fixed top-4 right-4 z-20"><LanguageSwitcher /></div>
      <div className="glass rounded-3xl p-8 w-full max-w-sm relative z-10 fade-in">
        <div className="text-center mb-8">
          <img src="/logo-dark.png" alt="Invoicaty" className="w-16 h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">{t("auth.registerTitle")}</h1>
          <p className="text-slate-400 text-sm mt-1">{t("auth.registerSubtitle")}</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">{t("auth.fullName")}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder={t("auth.fullNamePlaceholder")}
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">{t("auth.email")}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder={t("auth.emailPlaceholder")} dir="ltr"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">{t("auth.confirmEmail")}</label>
            <input type="email" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} required
              placeholder={t("auth.confirmEmail")} dir="ltr"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">{t("auth.password")}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder={t("auth.passwordPlaceholder")} dir="ltr"
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 outline-none" />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 text-base">
            {loading ? t("auth.registerLoading") : t("auth.registerBtn")}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          {t("auth.hasAccount")}{" "}
          <Link href="/login" className="text-purple-400 font-bold hover:underline">{t("auth.loginNow")}</Link>
        </p>
      </div>
    </div>
  );
}
