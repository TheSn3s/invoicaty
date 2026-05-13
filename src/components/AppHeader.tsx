"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AppNav from "@/components/AppNav";

interface Props {
  title?: string;
  subtitle?: string;
  icon?: string;
  backHref?: string;
  showBack?: boolean;
  showLogo?: boolean;
  showNav?: boolean;
  deletedCount?: number;
  rightSlot?: ReactNode;
  extraActions?: ReactNode;
}

export default function AppHeader({
  title,
  subtitle,
  icon,
  backHref = "/dashboard",
  showBack = false,
  showLogo = false,
  showNav = false,
  deletedCount = 0,
  rightSlot,
  extraActions,
}: Props) {
  const { t, lang } = useI18n();

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-700/50 px-3 py-3 md:px-8 md:py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          {showBack && (
            <Link href={backHref} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all flex-shrink-0">
              {lang === "ar" ? "→" : "←"}
            </Link>
          )}

          {showLogo ? (
            <>
              <img src="/logo-dark.png" alt="Invoicaty" className="h-8 w-auto flex-shrink-0" />
              <div className="hidden sm:block min-w-0">
                <h1 className="text-sm font-bold text-white leading-tight truncate">Invoicaty</h1>
                {subtitle && <p className="text-[10px] text-slate-400 truncate">{subtitle}</p>}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              {icon && <span className="text-base flex-shrink-0">{icon}</span>}
              <div className="min-w-0">
                {title && <h1 className="text-sm font-bold text-white truncate">{title}</h1>}
                {subtitle && <p className="text-[10px] text-slate-400 truncate">{subtitle}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0">
          <LanguageSwitcher />
          {showNav && <AppNav deletedCount={deletedCount} />}
          {extraActions}
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
