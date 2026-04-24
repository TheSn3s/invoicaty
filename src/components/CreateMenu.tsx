"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

interface Props {
  /** Called when the user picks "New invoice". If omitted, no-op. */
  onNewInvoice?: () => void;
  /** Called when the user picks "New quotation". If omitted, navigates to /quotations?new=1. */
  onNewQuotation?: () => void;
  /** Visual style: header button (compact) or floating action button (FAB) */
  variant?: "header" | "fab";
  /** Optional extra className for the trigger button */
  className?: string;
  /** Align the dropdown menu */
  align?: "left" | "right";
}

export default function CreateMenu({ onNewInvoice, onNewQuotation, variant = "header", align = "right", className }: Props) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      // Ignore clicks on the trigger button itself (prevents immediate close on toggle)
      if (btnRef.current && btnRef.current.contains(target)) return;
      if (ref.current && ref.current.contains(target)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    // Delay listener registration by a tick so the opening click doesn't
    // immediately trigger the handler (fab uses position:fixed which escapes
    // the wrapper's bounding box, so contains() check is unreliable).
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

  const handleInvoice = () => {
    setOpen(false);
    if (onNewInvoice) onNewInvoice();
    else router.push("/dashboard?new=1");
  };
  const handleQuotation = () => {
    setOpen(false);
    if (onNewQuotation) onNewQuotation();
    else router.push("/quotations?new=1");
  };

  const triggerClass = variant === "fab"
    ? (className || "md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center justify-center text-white text-2xl z-20 active:scale-95 transition-transform safe-bottom")
    : (className || "bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20");

  const menuAlignClass = variant === "fab"
    ? (align === "left" ? "left-0 bottom-full mb-3" : "right-0 bottom-full mb-3")
    : (align === "left" ? "left-0 top-full mt-2" : "right-0 top-full mt-2");

  return (
    <div className={variant === "fab" ? "" : "relative inline-block"} ref={ref}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={triggerClass}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t("nav.new") || "New"}
      >
        {variant === "fab" ? (
          <span className={`inline-block transition-transform ${open ? "rotate-45" : ""}`}>+</span>
        ) : (
          <>
            <span className={`inline-block transition-transform ${open ? "rotate-45" : ""}`}>+</span>
            <span className="hidden sm:inline">{t("nav.create") || (lang === "ar" ? "إنشاء جديد" : "New")}</span>
            <span className="sm:hidden">{t("nav.new") || (lang === "ar" ? "جديد" : "New")}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          style={{ backgroundColor: "rgb(15 23 42 / 0.97)" }}
          className={
            variant === "fab"
              ? `fixed ${align === "left" ? "left-6" : "right-6"} bottom-24 w-60 backdrop-blur-2xl border border-slate-600/70 rounded-xl shadow-2xl shadow-black/70 z-50 overflow-hidden fade-in ring-1 ring-black/30`
              : `absolute ${menuAlignClass} w-60 backdrop-blur-2xl border border-slate-600/70 rounded-xl shadow-2xl shadow-black/70 z-50 overflow-hidden fade-in ring-1 ring-black/30`
          }
        >
          <div className="px-3 py-2 border-b border-slate-700/60 bg-slate-800/60">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("nav.createNew") || (lang === "ar" ? "إنشاء جديد" : "Create new")}</div>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleInvoice}
            className="w-full flex items-center gap-3 px-3 py-3 bg-slate-900 hover:bg-blue-600/20 transition-colors text-start group"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/40 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">🧾</span>
            <div className="flex-1">
              <div className="text-sm text-white font-bold">{t("nav.newInvoice") || (lang === "ar" ? "فاتورة جديدة" : "New Invoice")}</div>
              <div className="text-[10px] text-slate-400">{lang === "ar" ? "إصدار فاتورة للعميل" : "Issue an invoice to a client"}</div>
            </div>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleQuotation}
            className="w-full flex items-center gap-3 px-3 py-3 bg-slate-900 hover:bg-purple-600/20 transition-colors text-start group border-t border-slate-700/60"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 border border-purple-500/40 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">📋</span>
            <div className="flex-1">
              <div className="text-sm text-white font-bold">{t("nav.newQuotation") || (lang === "ar" ? "عرض سعر جديد" : "New Quotation")}</div>
              <div className="text-[10px] text-slate-400">{lang === "ar" ? "إعداد عرض سعر للعميل" : "Prepare a quote for a client"}</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
