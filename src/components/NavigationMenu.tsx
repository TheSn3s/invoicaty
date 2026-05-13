"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface Props {
  items: NavItem[];
  align?: "left" | "right";
}

export default function NavigationMenu({ items, align = "right" }: Props) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current && btnRef.current.contains(target)) return;
      if (ref.current && ref.current.contains(target)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("touchstart", onDoc as unknown as EventListener);
      document.addEventListener("keydown", onEsc);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc as unknown as EventListener);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
        title={t("nav.menu") || (lang === "ar" ? "التنقل" : "Menu")}
      >
        <span className="text-sm">☰</span>
        <span className="hidden sm:inline">{t("nav.menu") || (lang === "ar" ? "القائمة" : "Menu")}</span>
      </button>

      {open && (
        <div
          role="menu"
          style={{ backgroundColor: "rgb(15 23 42 / 0.97)" }}
          className={`absolute ${align === "left" ? "left-0" : "right-0"} top-full mt-2 w-64 backdrop-blur-2xl border border-slate-600/70 rounded-xl shadow-2xl shadow-black/70 z-50 overflow-hidden fade-in ring-1 ring-black/30`}
        >
          <div className="px-3 py-2 border-b border-slate-700/60 bg-slate-800/60">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("nav.menu") || (lang === "ar" ? "القائمة" : "Menu")}</div>
          </div>

          <div className="py-1.5">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-between gap-3 px-3 py-3 hover:bg-slate-800/70 transition-colors text-start"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-lg">{item.icon}</span>
                  <span className="text-sm text-white font-bold truncate">{item.label}</span>
                </div>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
