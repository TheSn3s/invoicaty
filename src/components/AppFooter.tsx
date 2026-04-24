"use client";
import { useI18n } from "@/lib/i18n";
import { DEVELOPER_INFO, SUPPORT_LINKS } from "@/lib/developer-info";

interface Props {
  /** Compact variant for dense pages (smaller padding, single row) */
  compact?: boolean;
}

export default function AppFooter({ compact = false }: Props) {
  const { t, lang } = useI18n();
  const year = new Date().getFullYear();
  const devName = lang === "ar" ? DEVELOPER_INFO.name_ar : DEVELOPER_INFO.name_en;

  const copyrightText = lang === "ar"
    ? `Invoicaty © ${year} — جميع الحقوق محفوظة`
    : `Invoicaty © ${year} — All rights reserved`;

  const byText = lang === "ar" ? `بواسطة ${devName}` : `by ${devName}`;

  return (
    <footer className={`border-t border-slate-800/60 ${compact ? "py-3" : "py-5"} px-4 mt-8`}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="text-[11px] text-slate-500 text-center sm:text-start flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span>{copyrightText}</span>
          <span className="hidden sm:inline text-slate-700">·</span>
          <span className="text-slate-400 font-medium">{byText}</span>
        </div>

        <a
          href={SUPPORT_LINKS.email}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-400 bg-slate-800/40 hover:bg-blue-500/10 border border-slate-700/50 hover:border-blue-500/30 px-3 py-1.5 rounded-lg transition-all"
          title={t("support.contactDeveloper") || "Contact developer"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span>{t("support.contactSupport") || (lang === "ar" ? "تواصل مع الدعم" : "Contact Support")}</span>
        </a>
      </div>
    </footer>
  );
}
