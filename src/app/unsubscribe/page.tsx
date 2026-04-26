"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function UnsubscribePage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">("loading");
  const supabase = createClient();
  const { t, lang } = useI18n();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("invalid");
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .update({ email_unsubscribed_at: new Date().toISOString() })
          .eq("unsubscribe_token", token)
          .select("id")
          .single();

        if (error || !data) {
          setStatus("invalid");
        } else {
          setStatus("success");
        }
      } catch {
        setStatus("error");
      }
    })();
  }, [supabase]);

  const isAr = lang === "ar";

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="glass rounded-3xl p-10 text-center fade-in max-w-sm">
        {status === "loading" && (
          <>
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">{isAr ? "جارٍ المعالجة..." : "Processing..."}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {isAr ? "تم إلغاء الاشتراك" : "Unsubscribed"}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {isAr
                ? "لن تتلقى رسائل تذكير منا بعد الآن. يمكنك دائماً العودة واستخدام Invoicaty."
                : "You won't receive reminder emails from us anymore. You can always come back and use Invoicaty."}
            </p>
            <Link href="/" className="text-purple-400 font-bold hover:underline text-sm">
              {isAr ? "العودة للصفحة الرئيسية" : "Back to homepage"}
            </Link>
          </>
        )}

        {status === "invalid" && (
          <>
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {isAr ? "رابط غير صالح" : "Invalid Link"}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {isAr
                ? "هذا الرابط غير صالح أو منتهي الصلاحية."
                : "This link is invalid or has expired."}
            </p>
            <Link href="/" className="text-purple-400 font-bold hover:underline text-sm">
              {isAr ? "العودة للصفحة الرئيسية" : "Back to homepage"}
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {isAr ? "حدث خطأ" : "Something went wrong"}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {isAr
                ? "يرجى المحاولة مرة أخرى لاحقاً."
                : "Please try again later."}
            </p>
            <Link href="/" className="text-purple-400 font-bold hover:underline text-sm">
              {isAr ? "العودة للصفحة الرئيسية" : "Back to homepage"}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
