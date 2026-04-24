"use client";
import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export interface ShareableDoc {
  type: "invoice" | "quotation";
  serial: string;
  client: string;
  project: string;
  date: string;
  amount: number;
  total?: number;
  currency: string;
  valid_until?: string | null;
  notes?: string;
}

interface Profile {
  full_name?: string;
  business_name?: string;
  phone?: string;
  email?: string;
}

interface Props {
  doc: ShareableDoc;
  profile: Profile | null;
  onPrintPdf: () => void;
  buttonClassName?: string;
  buttonLabel?: string;
  align?: "left" | "right";
}

/**
 * Build a friendly text summary suitable for sharing on WhatsApp / Email / SMS.
 * Falls back to bilingual-aware text via `lang`.
 */
function buildShareText(doc: ShareableDoc, profile: Profile | null, lang: "ar" | "en") {
  const total = Number(doc.total || doc.amount || 0);
  const fmt = (n: number) => `${doc.currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`;
  const senderName = profile?.business_name || profile?.full_name || "";
  const isQuote = doc.type === "quotation";

  if (lang === "ar") {
    const lines: string[] = [];
    lines.push(`السلام عليكم ${doc.client}،`);
    lines.push("");
    if (isQuote) {
      lines.push(`يسعدنا إرسال *عرض السعر رقم #${doc.serial}* الخاص بـ "${doc.project}".`);
    } else {
      lines.push(`نرفق لكم *الفاتورة رقم #${doc.serial}* الخاصة بـ "${doc.project}".`);
    }
    lines.push("");
    lines.push(`📅 التاريخ: ${doc.date}`);
    if (isQuote && doc.valid_until) lines.push(`⏳ صالح حتى: ${doc.valid_until}`);
    lines.push(`💵 الإجمالي: *${fmt(total)}*`);
    if (doc.notes) {
      lines.push("");
      lines.push(`📝 ملاحظات: ${doc.notes}`);
    }
    lines.push("");
    if (isQuote) {
      lines.push("في انتظار ردكم الكريم لاعتماد العرض.");
    } else {
      lines.push("نرجو سداد المبلغ في أقرب وقت ممكن. شكراً لتعاملكم معنا.");
    }
    if (senderName) {
      lines.push("");
      lines.push(`مع أطيب التحيات،`);
      lines.push(senderName);
    }
    return lines.join("\n");
  }

  // English
  const lines: string[] = [];
  lines.push(`Hello ${doc.client},`);
  lines.push("");
  if (isQuote) {
    lines.push(`Please find below *Quotation #${doc.serial}* for "${doc.project}".`);
  } else {
    lines.push(`Please find attached *Invoice #${doc.serial}* for "${doc.project}".`);
  }
  lines.push("");
  lines.push(`📅 Date: ${doc.date}`);
  if (isQuote && doc.valid_until) lines.push(`⏳ Valid Until: ${doc.valid_until}`);
  lines.push(`💵 Total: *${fmt(total)}*`);
  if (doc.notes) {
    lines.push("");
    lines.push(`📝 Notes: ${doc.notes}`);
  }
  lines.push("");
  if (isQuote) {
    lines.push("Looking forward to your approval to proceed.");
  } else {
    lines.push("Kindly arrange the payment at your earliest convenience. Thank you!");
  }
  if (senderName) {
    lines.push("");
    lines.push(`Best regards,`);
    lines.push(senderName);
  }
  return lines.join("\n");
}

export default function ShareMenu({ doc, profile, onPrintPdf, buttonClassName, buttonLabel, align = "right" }: Props) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const text = buildShareText(doc, profile, lang);
  const subject = doc.type === "quotation"
    ? (lang === "ar" ? `عرض سعر #${doc.serial} - ${doc.project}` : `Quotation #${doc.serial} - ${doc.project}`)
    : (lang === "ar" ? `فاتورة #${doc.serial} - ${doc.project}` : `Invoice #${doc.serial} - ${doc.project}`);

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleEmail = () => {
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = url;
    setOpen(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: subject, text });
      }
    } catch {
      /* user dismissed */
    }
    setOpen(false);
  };

  const handlePrint = () => {
    onPrintPdf();
    setOpen(false);
  };

  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const defaultBtnClass = "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1.5";
  const menuAlign = align === "right" ? "right-0" : "left-0";

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={buttonClassName || defaultBtnClass}
        title={t("share.title") || "Share"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        <span>{buttonLabel || t("share.title") || "Share"}</span>
      </button>

      {open && (
        <div className={`absolute ${menuAlign} mt-2 w-56 bg-slate-900/98 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-2xl shadow-black/40 z-40 overflow-hidden fade-in`}>
          <div className="px-3 py-2 border-b border-slate-800/60">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("share.title") || "Share via"}</div>
          </div>

          <button onClick={handleWhatsApp} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-green-500/10 transition-colors text-start">
            <span className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center text-base">💬</span>
            <span className="text-sm text-white font-medium">{t("share.whatsapp") || "WhatsApp"}</span>
          </button>

          <button onClick={handleEmail} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-500/10 transition-colors text-start">
            <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-base">📧</span>
            <span className="text-sm text-white font-medium">{t("share.email") || "Email"}</span>
          </button>

          <button onClick={handleCopy} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-500/10 transition-colors text-start">
            <span className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-base">{copied ? "✅" : "📋"}</span>
            <span className="text-sm text-white font-medium">{copied ? (t("share.copied") || "Copied!") : (t("share.copyText") || "Copy text")}</span>
          </button>

          {hasNativeShare && (
            <button onClick={handleNativeShare} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-amber-500/10 transition-colors text-start">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-base">📲</span>
              <span className="text-sm text-white font-medium">{t("share.more") || "More options…"}</span>
            </button>
          )}

          <div className="border-t border-slate-800/60">
            <button onClick={handlePrint} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700/50 transition-colors text-start">
              <span className="w-7 h-7 rounded-lg bg-slate-600/30 flex items-center justify-center text-base">🖨️</span>
              <span className="text-sm text-white font-medium">{t("share.printPdf") || "Print / Save PDF"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
