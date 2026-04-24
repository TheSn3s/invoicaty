"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  useEffect(() => {
    // 1) Check if a session already exists (user just came from /auth/callback with
    //    a valid recovery code that was exchanged server-side). If yes — we're ready.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    // 2) Also listen for the PASSWORD_RECOVERY event (fires when Supabase recognises
    //    the recovery flow — e.g. when using the old token-hash fragment flow).
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });

    // 3) Safety net: if after 5s we still have no session AND no event fired,
    //    the link is invalid/expired. Show a helpful error instead of spinning forever.
    const timeout = setTimeout(() => {
      setReady((r) => {
        if (!r) {
          setError(t("auth.invalidResetLink"));
        }
        return r;
      });
    }, 5000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [supabase, t]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError(t("auth.passwordTooShort")); return; }
    if (password !== confirm) { setError(t("auth.passwordMismatch")); return; }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(t("common.error"));
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="glass rounded-3xl p-10 text-center fade-in">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">{t("auth.updateSuccess")}</h2>
          <p className="text-slate-400 text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
      </div>
      <div className="fixed top-4 right-4 z-20"><LanguageSwitcher /></div>
      <div className="glass rounded-3xl p-8 w-full max-w-sm relative z-10 fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-3xl shadow-lg shadow-green-500/20">🔐</div>
          <h1 className="text-2xl font-bold text-white">{t("auth.updatePasswordTitle")}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {ready ? t("auth.resetSubtitle") : t("common.loading")}
          </p>
        </div>

        {ready ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">{t("auth.newPassword")}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder={t("auth.passwordPlaceholder")} dir="ltr"
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-green-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">{t("auth.confirmPassword")}</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                placeholder={t("auth.passwordPlaceholder")} dir="ltr"
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-green-500/50 outline-none" />
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 text-base">
              {loading ? t("auth.updateLoading") : t("auth.updateBtn")}
            </button>
          </form>
        ) : error ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <a href="/reset-password" className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all">
              {t("auth.requestNewLink")}
            </a>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
