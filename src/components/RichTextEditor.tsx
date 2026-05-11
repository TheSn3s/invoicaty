"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";

/* ─── Custom Table Extensions (border width + color + bg) ─── */
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).style.backgroundColor || (el as HTMLElement).getAttribute("data-bg") || null,
        renderHTML: (a) => a.backgroundColor ? { style: `background-color: ${a.backgroundColor}` } : {},
      },
      borderColor: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-border") || null,
        renderHTML: (a) => a.borderColor ? { "data-border": a.borderColor } : {},
      },
      borderWidth: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-bw") || null,
        renderHTML: (a) => a.borderWidth ? { "data-bw": a.borderWidth } : {},
      },
    };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).style.backgroundColor || null,
        renderHTML: (a) => a.backgroundColor ? { style: `background-color: ${a.backgroundColor}` } : {},
      },
      borderColor: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-border") || null,
        renderHTML: (a) => a.borderColor ? { "data-border": a.borderColor } : {},
      },
      borderWidth: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-bw") || null,
        renderHTML: (a) => a.borderWidth ? { "data-bw": a.borderWidth } : {},
      },
    };
  },
});

/* ─── Types ─── */
interface Props {
  value: string;
  onChange: (html: string) => void;
  brandColor?: string;
}

/* ─── Toolbar Button ─── */
function Btn({ onClick, active, title, children, className = "" }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-all ${
        active ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
               : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
      } ${className}`}>{children}</button>
  );
}

/* ─── Separator ─── */
function Sep() { return <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 flex-shrink-0" />; }

/* ─── Dropdown wrapper (close on outside click) ─── */
function Dropdown({ trigger, children, title, width = "w-[220px]", align = "left" }: {
  trigger: React.ReactNode; children: React.ReactNode; title: string; width?: string; align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); setOpen(o => !o); }} title={title}
        className="w-8 h-8 rounded-md text-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all">
        {trigger}
      </button>
      {open && (
        <div className={`absolute z-[100] mt-1 ${align === "right" ? "right-0" : "left-0"} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2.5 ${width}`}
          onMouseDown={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Enhanced Color Picker (swatches + custom input) ─── */
function ColorPicker({ colors, current, onPick, children, title, popDirection = "down" }: {
  colors: string[]; current?: string; onPick: (c: string | null) => void; children: React.ReactNode; title: string; popDirection?: "up" | "down";
}) {
  const [open, setOpen] = useState(false);
  const [customHex, setCustomHex] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const applyCustom = () => {
    const hex = customHex.startsWith("#") ? customHex : `#${customHex}`;
    if (/^#[0-9a-fA-F]{3,8}$/.test(hex)) { onPick(hex); setOpen(false); setCustomHex(""); }
  };
  return (
    <div className="relative" ref={ref}>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); setOpen(o => !o); }} title={title}
        className="w-8 h-8 rounded-md text-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all">
        {children}
      </button>
      {open && (
        <div className={`absolute z-[200] ${popDirection === "up" ? "bottom-full mb-1 right-0" : "mt-1 right-0"} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2.5 w-[220px]`}>
          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {colors.map((c) => (
              <button key={c} type="button"
                onMouseDown={(e) => { e.preventDefault(); onPick(c === "transparent" ? null : c); setOpen(false); }}
                className={`w-6 h-6 rounded-md border hover:scale-110 transition-transform ${
                  current === c ? "ring-2 ring-blue-500 ring-offset-1" : "border-slate-200 dark:border-slate-600"
                } ${c === "transparent" ? "bg-white dark:bg-slate-800" : ""}`}
                style={c !== "transparent" ? { background: c } : undefined}
                title={c === "transparent" ? "Clear" : c}>
                {c === "transparent" && <span className="text-[8px] text-slate-400 flex items-center justify-center">✕</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <input type="color" value={current || "#000000"}
              onChange={(e) => { onPick(e.target.value); setOpen(false); }}
              className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent p-0" />
            <div className="flex-1 flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">#</span>
              <input type="text" value={customHex} onChange={(e) => setCustomHex(e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6))}
                placeholder="hex" maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && applyCustom()}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-[11px] text-slate-700 dark:text-slate-200 outline-none font-mono" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); applyCustom(); }}
                className="px-2 py-1 rounded-md text-[10px] font-bold bg-blue-500 text-white hover:bg-blue-600">OK</button>
            </div>
          </div>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); onPick(null); setOpen(false); }}
            className="w-full text-[11px] font-medium py-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Clear</button>
        </div>
      )}
    </div>
  );
}

/* ─── Table sub-button ─── */
function TblBtn({ onClick, children, danger }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
        danger ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
               : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}>{children}</button>
  );
}

/* ─── Color Swatches ─── */
const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#cccccc", "#efefef",
  "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#2563eb", "#7c3aed",
  "#db2777", "#0891b2", "#4f46e5", "#059669", "#d97706", "#9333ea",
];
const HIGHLIGHT_COLORS = [
  "transparent", "#fef08a", "#fde68a", "#fed7aa", "#fecaca", "#bbf7d0",
  "#bfdbfe", "#ddd6fe", "#fce7f3", "#ccfbf1", "#f1f5f9", "#fef9c3",
  "#ffedd5", "#ffe4e6", "#dcfce7", "#dbeafe", "#ede9fe", "#fdf2f8",
];
const CELL_BG_COLORS = [
  "transparent", "#ffffff", "#f8fafc", "#fef9c3", "#fee2e2", "#dcfce7",
  "#dbeafe", "#ede9fe", "#fce7f3", "#ccfbf1", "#e2e8f0", "#fde68a",
];
const BORDER_COLORS = [
  "#94a3b8", "#64748b", "#475569", "#334155", "#0f172a", "#dc2626",
  "#ea580c", "#ca8a04", "#16a34a", "#2563eb", "#7c3aed", "#db2777",
];
const BORDER_WIDTHS = ["0", "1", "1.5", "2", "3", "4"];

/* ─── Helper: lighten a hex color ─── */
function lighten(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const r = Math.min(255, (n >> 16) + Math.round((255 - (n >> 16)) * amount));
  const g = Math.min(255, ((n >> 8) & 0xff) + Math.round((255 - ((n >> 8) & 0xff)) * amount));
  const b = Math.min(255, (n & 0xff) + Math.round((255 - (n & 0xff)) * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/* ─── SVG Icons ─── */
const icons = {
  undo: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
  redo: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>,
  bold: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  italic: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  underline: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>,
  strike: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 0 0-3 3c0 2 1.5 3 3 3"/><line x1="4" y1="12" x2="20" y2="12"/><path d="M15 12c1.5 0 3 1 3 3s-1.5 3-3 3H8"/></svg>,
  textColor: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16"/><path d="M9.5 4L5 16h2l1.2-3h7.6L17 16h2L14.5 4h-5z"/></svg>,
  highlight: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>,
  alignLeft: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>,
  alignCenter: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
  alignRight: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>,
  alignJustify: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  bulletList: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>,
  orderedList: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="2" y="8" fontSize="8" fill="currentColor" stroke="none" fontWeight="700" fontFamily="system-ui">1</text><text x="2" y="14" fontSize="8" fill="currentColor" stroke="none" fontWeight="700" fontFamily="system-ui">2</text><text x="2" y="20" fontSize="8" fill="currentColor" stroke="none" fontWeight="700" fontFamily="system-ui">3</text></svg>,
  indent: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="5" x2="21" y2="5"/><line x1="11" y1="10" x2="21" y2="10"/><line x1="11" y1="15" x2="21" y2="15"/><line x1="3" y1="20" x2="21" y2="20"/><polyline points="3 10 7 12.5 3 15"/></svg>,
  outdent: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="5" x2="21" y2="5"/><line x1="11" y1="10" x2="21" y2="10"/><line x1="11" y1="15" x2="21" y2="15"/><line x1="3" y1="20" x2="21" y2="20"/><polyline points="7 10 3 12.5 7 15"/></svg>,
  blockquote: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>,
  hr: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  table: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>,
  clearFormat: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/><line x1="3" y1="21" x2="21" y2="3"/></svg>,
  fullscreen: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>,
  minimize: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>,
  rtl: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="6" y2="18"/><polyline points="6 3 3 6 6 9"/></svg>,
  ltr: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/><polyline points="18 3 21 6 18 9"/></svg>,
};

/* ═══════════════════════════════════════════
   TABLE PRESETS GENERATOR
   ═══════════════════════════════════════════ */
function buildTablePresetHtml(type: "pricing" | "tasks" | "comparison", brandColor: string, isAr: boolean): string {
  const bg = lighten(brandColor, 0.85);
  const hdrStyle = `background-color:${brandColor};color:#fff;font-weight:700;padding:10px 12px;border:1.5px solid ${brandColor};`;
  const cellStyle = `padding:10px 12px;border:1.5px solid ${lighten(brandColor, 0.5)};`;
  const altStyle = `${cellStyle}background-color:${bg};`;

  if (type === "pricing") {
    const h = isAr ? ["البند", "الكمية", "السعر", "المجموع"] : ["Item", "Qty", "Price", "Total"];
    return `<table><thead><tr>${h.map(t => `<th style="${hdrStyle}">${t}</th>`).join("")}</tr></thead><tbody>
      <tr>${h.map((_, i) => `<td style="${cellStyle}">${i === 0 ? (isAr ? "خدمة ١" : "Service 1") : ""}</td>`).join("")}</tr>
      <tr>${h.map((_, i) => `<td style="${altStyle}">${i === 0 ? (isAr ? "خدمة ٢" : "Service 2") : ""}</td>`).join("")}</tr>
      <tr>${h.map((_, i) => `<td style="${cellStyle}">${i === 0 ? (isAr ? "خدمة ٣" : "Service 3") : ""}</td>`).join("")}</tr>
    </tbody></table>`;
  }
  if (type === "tasks") {
    const h = isAr ? ["المهمة", "المسؤول", "الموعد", "الحالة"] : ["Task", "Owner", "Due Date", "Status"];
    return `<table><thead><tr>${h.map(t => `<th style="${hdrStyle}">${t}</th>`).join("")}</tr></thead><tbody>
      <tr>${h.map(() => `<td style="${cellStyle}"></td>`).join("")}</tr>
      <tr>${h.map(() => `<td style="${altStyle}"></td>`).join("")}</tr>
    </tbody></table>`;
  }
  // comparison
  const h = isAr ? ["الميزة", "الخيار أ", "الخيار ب", "الخيار ج"] : ["Feature", "Option A", "Option B", "Option C"];
  return `<table><thead><tr>${h.map(t => `<th style="${hdrStyle}">${t}</th>`).join("")}</tr></thead><tbody>
    <tr>${h.map((_, i) => `<td style="${cellStyle}">${i === 0 ? (isAr ? "ميزة ١" : "Feature 1") : ""}</td>`).join("")}</tr>
    <tr>${h.map((_, i) => `<td style="${altStyle}">${i === 0 ? (isAr ? "ميزة ٢" : "Feature 2") : ""}</td>`).join("")}</tr>
    <tr>${h.map((_, i) => `<td style="${cellStyle}">${i === 0 ? (isAr ? "ميزة ٣" : "Feature 3") : ""}</td>`).join("")}</tr>
  </tbody></table>`;
}

/* ═══════════════════════════════════════════
   MAIN EDITOR COMPONENT
   ═══════════════════════════════════════════ */
export default function RichTextEditor({ value, onChange, brandColor = "#3b82f6" }: Props) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorDir, setEditorDir] = useState<"rtl" | "ltr">(isAr ? "rtl" : "ltr");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "draft-table" } }),
      TableRow,
      CustomTableHeader,
      CustomTableCell,
      Placeholder.configure({
        placeholder: isAr ? "\u0627\u0628\u062f\u0623 \u0627\u0644\u0643\u062a\u0627\u0628\u0629 \u0647\u0646\u0627..." : "Start typing here...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: { class: "draft-editor-content", dir: editorDir },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    if (!isFullscreen || typeof document === "undefined") return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, [isFullscreen]);

  const toggleDir = useCallback(() => {
    const next = editorDir === "rtl" ? "ltr" : "rtl";
    setEditorDir(next);
    if (editor) {
      const el = editor.view.dom;
      el.setAttribute("dir", next);
      el.style.direction = next;
    }
  }, [editorDir, editor]);

  if (!editor) return null;

  const inTable = editor.isActive("table");
  let hasAnyTable = false;
  let firstTableCellPos = -1;
  editor.state.doc.descendants((node, pos) => {
    if (!hasAnyTable && node.type.name === "table") hasAnyTable = true;
    if (firstTableCellPos === -1 && node.type.name === "tableCell") firstTableCellPos = pos + 1;
    return true;
  });

  const focusFirstTableCell = () => {
    if (firstTableCellPos > 0) { editor.chain().focus().setTextSelection(firstTableCellPos).run(); return true; }
    return false;
  };

  const insertNewTable = (rows = 3, cols = 3) => {
    editor.chain().focus("end").insertContent("<p></p>").insertTable({ rows, cols, withHeaderRow: true }).run();
  };

  const insertPresetTable = (type: "pricing" | "tasks" | "comparison") => {
    const html = buildTablePresetHtml(type, brandColor, isAr);
    editor.chain().focus("end").insertContent("<p></p>").insertContent(html).run();
  };

  /* Apply attribute to ALL cells in the current table */
  const setAllTableCellsAttr = (attr: string, val: string | null) => {
    const { state, dispatch } = editor.view;
    const { tr } = state;
    let modified = false;
    state.doc.descendants((node, pos) => {
      if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, [attr]: val });
        modified = true;
      }
    });
    if (modified) dispatch(tr);
  };

  const headingValue = editor.isActive("heading", { level: 1 }) ? "h1"
    : editor.isActive("heading", { level: 2 }) ? "h2"
    : editor.isActive("heading", { level: 3 }) ? "h3" : "p";

  /* ─── Dynamic border CSS for data-border / data-bw attributes ─── */
  const dynamicBorderCss = `
    .draft-editor-content table [data-border] { border-color: attr(data-border) !important; }
    .draft-editor-content table [data-bw="0"] { border-width: 0 !important; }
    .draft-editor-content table [data-bw="1"] { border-width: 1px !important; }
    .draft-editor-content table [data-bw="1.5"] { border-width: 1.5px !important; }
    .draft-editor-content table [data-bw="2"] { border-width: 2px !important; }
    .draft-editor-content table [data-bw="3"] { border-width: 3px !important; }
    .draft-editor-content table [data-bw="4"] { border-width: 4px !important; }
  `;

  return (
    <div className={isFullscreen ? "fixed inset-0 z-[90] bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4" : ""}>
      <div className={`border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm ${isFullscreen ? "h-full rounded-2xl flex flex-col max-w-7xl mx-auto overflow-hidden" : "rounded-2xl"}`}>
        <style jsx global>{`
          .draft-editor-content {
            min-height: 400px; outline: none; font-size: 16px; line-height: 1.7; padding: 24px 28px; color: #1e293b;
          }
          @media (max-width: 640px) { .draft-editor-content { padding: 16px 18px; font-size: 15px; line-height: 1.65; } }
          .draft-editor-content p.is-editor-empty:first-child::before {
            content: attr(data-placeholder); float: left; color: #94a3b8; pointer-events: none; height: 0;
          }
          [dir="rtl"] .draft-editor-content p.is-editor-empty:first-child::before { float: right; }
          .draft-editor-content h1 { font-size: 1.75em; font-weight: 800; margin: 0.8em 0 0.3em; color: #0f172a; }
          .draft-editor-content h2 { font-size: 1.4em; font-weight: 700; margin: 0.7em 0 0.25em; color: #1e293b; }
          .draft-editor-content h3 { font-size: 1.15em; font-weight: 700; margin: 0.6em 0 0.2em; color: #334155; }
          .draft-editor-content p { margin: 0.25em 0; }
          .draft-editor-content ul, .draft-editor-content ol { padding-inline-start: 1.5em; margin: 0.4em 0; }
          .draft-editor-content ul { list-style: disc; }
          .draft-editor-content ol { list-style: decimal; }
          .draft-editor-content li { margin: 0.15em 0; }
          .draft-editor-content li p { margin: 0; }
          .draft-editor-content blockquote { border-inline-start: 3px solid #3b82f6; padding-inline-start: 1em; margin: 0.6em 0; color: #64748b; font-style: italic; }
          .draft-editor-content hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5em 0; }
          .draft-editor-content strong { font-weight: 700; }
          .draft-editor-content em { font-style: italic; }
          .draft-editor-content u { text-decoration: underline; text-underline-offset: 3px; }
          .draft-editor-content s { text-decoration: line-through; color: #94a3b8; }
          .draft-editor-content mark { border-radius: 3px; padding: 1px 4px; }
          .draft-editor-content table.draft-table { border-collapse: collapse; width: 100%; margin: 16px 0; table-layout: auto; border: 2px solid #64748b; }
          .draft-editor-content table.draft-table td, .draft-editor-content table.draft-table th { border: 1.5px solid #94a3b8; padding: 10px 12px; vertical-align: top; min-width: 60px; }
          .draft-editor-content table.draft-table th { background: #f1f5f9; font-weight: 700; font-size: 0.9em; color: #334155; border-bottom: 2.5px solid #64748b; }
          .draft-editor-content table { border-collapse: collapse; width: 100%; margin: 16px 0; border: 2px solid #64748b; }
          .draft-editor-content table td, .draft-editor-content table th { border: 1.5px solid #94a3b8; padding: 10px 12px; vertical-align: top; min-width: 60px; }
          .draft-editor-content table th { background: #f1f5f9; font-weight: 700; border-bottom: 2.5px solid #64748b; }
          .draft-editor-content table .selectedCell { background: rgba(59,130,246,0.08); outline: 2px solid #3b82f6; outline-offset: -2px; }
          .draft-editor-content .tableWrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .draft-editor-content .column-resize-handle { background-color: #3b82f6; width: 2px; position: absolute; right: -1px; top: 0; bottom: 0; pointer-events: none; }
          .draft-editor-content ::selection { background: rgba(59,130,246,0.15); }
          ${dynamicBorderCss}
        `}</style>

        {/* ═══ TOOLBAR (sticky in fullscreen) ═══ */}
        <div className={`border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 relative z-20 ${isFullscreen ? "sticky top-0 z-10" : ""}`}>
          <div className="flex items-center gap-0.5 px-2 py-1.5 flex-wrap">
            {/* Fullscreen */}
            <Btn onClick={() => setIsFullscreen(v => !v)} title={isFullscreen ? (isAr ? "\u0625\u0644\u063a\u0627\u0621 \u0645\u0644\u0621 \u0627\u0644\u0634\u0627\u0634\u0629" : "Exit Full Screen") : (isAr ? "\u0645\u0644\u0621 \u0627\u0644\u0634\u0627\u0634\u0629" : "Full Screen")}>
              {isFullscreen ? icons.minimize : icons.fullscreen}
            </Btn>

            {/* RTL / LTR */}
            <Btn onClick={toggleDir} title={editorDir === "rtl" ? "Switch to LTR" : "Switch to RTL"}>
              {editorDir === "rtl" ? icons.ltr : icons.rtl}
            </Btn>

            <Sep />
            <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo">{icons.undo}</Btn>
            <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo">{icons.redo}</Btn>
            <Sep />

            {/* Heading */}
            <select value={headingValue} onChange={(e) => {
              const v = e.target.value;
              if (v === "p") editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level: Number(v.slice(1)) as 1|2|3 }).run();
            }} className="h-8 px-2 rounded-md text-[13px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer min-w-[100px]">
              <option value="p">{isAr ? "\u0646\u0635 \u0639\u0627\u062f\u064a" : "Paragraph"}</option>
              <option value="h1">{isAr ? "\u0639\u0646\u0648\u0627\u0646 \u0661" : "Heading 1"}</option>
              <option value="h2">{isAr ? "\u0639\u0646\u0648\u0627\u0646 \u0662" : "Heading 2"}</option>
              <option value="h3">{isAr ? "\u0639\u0646\u0648\u0627\u0646 \u0663" : "Heading 3"}</option>
            </select>

            {/* Font size */}
            <select defaultValue="" onChange={(e) => {
              const v = e.target.value;
              if (!v) editor.chain().focus().unsetMark("textStyle").run();
              else editor.chain().focus().setMark("textStyle", { fontSize: `${v}px` }).run();
            }} className="h-8 px-1.5 rounded-md text-[13px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer w-[58px]">
              <option value="">{isAr ? "\u062d\u062c\u0645" : "Size"}</option>
              {[12,14,16,18,20,24,28,32].map(s => <option key={s} value={String(s)}>{s}</option>)}
            </select>

            <Sep />
            <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">{icons.bold}</Btn>
            <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">{icons.italic}</Btn>
            <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">{icons.underline}</Btn>
            <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strike">{icons.strike}</Btn>

            <Sep />
            <ColorPicker colors={TEXT_COLORS} current={editor.getAttributes("textStyle").color}
              onPick={(c) => c ? editor.chain().focus().setColor(c).run() : editor.chain().focus().unsetColor().run()}
              title={isAr ? "\u0644\u0648\u0646 \u0627\u0644\u0646\u0635" : "Text Color"}>
              <div className="flex flex-col items-center">{icons.textColor}<span className="w-4 h-1 rounded-full mt-0.5" style={{ background: editor.getAttributes("textStyle").color || "#000" }} /></div>
            </ColorPicker>
            <ColorPicker colors={HIGHLIGHT_COLORS} current={editor.getAttributes("highlight").color}
              onPick={(c) => c ? editor.chain().focus().setHighlight({ color: c }).run() : editor.chain().focus().unsetHighlight().run()}
              title={isAr ? "\u062a\u0645\u064a\u064a\u0632" : "Highlight"}>
              <div className="flex flex-col items-center">{icons.highlight}<span className="w-4 h-1 rounded-full mt-0.5" style={{ background: editor.getAttributes("highlight").color || "#fef08a" }} /></div>
            </ColorPicker>

            <Sep />
            <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Left">{icons.alignLeft}</Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">{icons.alignCenter}</Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Right">{icons.alignRight}</Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">{icons.alignJustify}</Btn>

            <Sep />
            <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title={isAr ? "\u0642\u0627\u0626\u0645\u0629 \u0646\u0642\u0627\u0637" : "Bullets"}>{icons.bulletList}</Btn>
            <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title={isAr ? "\u0642\u0627\u0626\u0645\u0629 \u0645\u0631\u0642\u0645\u0629" : "Numbered"}>{icons.orderedList}</Btn>
            <Btn onClick={() => editor.chain().focus().sinkListItem("listItem").run()} title="Indent">{icons.indent}</Btn>
            <Btn onClick={() => editor.chain().focus().liftListItem("listItem").run()} title="Outdent">{icons.outdent}</Btn>

            <Sep />
            <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title={isAr ? "\u0627\u0642\u062a\u0628\u0627\u0633" : "Quote"}>{icons.blockquote}</Btn>
            <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title={isAr ? "\u0641\u0627\u0635\u0644" : "HR"}>{icons.hr}</Btn>

            {/* ─── TABLE DROPDOWN ─── */}
            <Dropdown trigger={icons.table} title={isAr ? "\u062c\u062f\u0648\u0644" : "Table"} width="w-[200px]" align="right">
              <div className="space-y-0.5">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertNewTable(); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[12px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  {isAr ? "\u2795 \u062c\u062f\u0648\u0644 \u062c\u062f\u064a\u062f (3\u00d73)" : "\u2795 New Table (3\u00d73)"}
                </button>
                {hasAnyTable && !inTable && (
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); focusFirstTableCell(); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all">
                    {isAr ? "\u270e \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u062d\u0627\u0644\u064a" : "\u270e Edit Current Table"}
                  </button>
                )}
                <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isAr ? "\u0642\u0648\u0627\u0644\u0628 \u062c\u0627\u0647\u0632\u0629" : "Presets"}</div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertPresetTable("pricing"); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: brandColor }} /> {isAr ? "\u062c\u062f\u0648\u0644 \u0623\u0633\u0639\u0627\u0631" : "Pricing Table"}
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertPresetTable("tasks"); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: brandColor }} /> {isAr ? "\u062c\u062f\u0648\u0644 \u0645\u0647\u0627\u0645" : "Task Table"}
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertPresetTable("comparison"); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: brandColor }} /> {isAr ? "\u062c\u062f\u0648\u0644 \u0645\u0642\u0627\u0631\u0646\u0629" : "Comparison Table"}
                </button>
              </div>
            </Dropdown>

            <Sep />
            <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title={isAr ? "\u0645\u0633\u062d \u0627\u0644\u062a\u0646\u0633\u064a\u0642" : "Clear Formatting"}>{icons.clearFormat}</Btn>
          </div>

          {/* ─── Table tools row (shown when table exists) ─── */}
          {(inTable || hasAnyTable) && (
            <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-t border-slate-200 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-500/5 relative overflow-visible">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mr-1.5">{isAr ? "\u062c\u062f\u0648\u0644" : "Table"}</span>
              {!inTable && hasAnyTable && (
                <TblBtn onClick={focusFirstTableCell}>{isAr ? "\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u062c\u062f\u0648\u0644" : "Focus table"}</TblBtn>
              )}
              <TblBtn onClick={() => editor.chain().focus().addRowAfter().run()}>+ {isAr ? "\u0635\u0641" : "Row"}</TblBtn>
              <TblBtn onClick={() => editor.chain().focus().addColumnAfter().run()}>+ {isAr ? "\u0639\u0645\u0648\u062f" : "Col"}</TblBtn>
              <TblBtn onClick={() => editor.chain().focus().deleteRow().run()} danger>{"\u2212"} {isAr ? "\u0635\u0641" : "Row"}</TblBtn>
              <TblBtn onClick={() => editor.chain().focus().deleteColumn().run()} danger>{"\u2212"} {isAr ? "\u0639\u0645\u0648\u062f" : "Col"}</TblBtn>
              <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <TblBtn onClick={() => editor.chain().focus().mergeCells().run()}>{isAr ? "\u062f\u0645\u062c" : "Merge"}</TblBtn>
              <TblBtn onClick={() => editor.chain().focus().splitCell().run()}>{isAr ? "\u0641\u0635\u0644" : "Split"}</TblBtn>
              <TblBtn onClick={() => editor.chain().focus().toggleHeaderRow().run()}>{isAr ? "\u0635\u0641 \u0631\u0623\u0633\u064a" : "H-Row"}</TblBtn>
              <TblBtn onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>{isAr ? "\u0639\u0645\u0648\u062f \u0631\u0623\u0633\u064a" : "H-Col"}</TblBtn>
              <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

              {/* Cell BG */}
              <ColorPicker colors={CELL_BG_COLORS} popDirection="up"
                current={editor.getAttributes("tableCell").backgroundColor || editor.getAttributes("tableHeader").backgroundColor}
                onPick={(c) => setAllTableCellsAttr("backgroundColor", c)}
                title={isAr ? "\u0644\u0648\u0646 \u0627\u0644\u062e\u0644\u064a\u0629" : "Cell BG"}>
                <span className="text-[10px] font-bold">BG</span>
              </ColorPicker>

              {/* Border Color */}
              <ColorPicker colors={BORDER_COLORS} popDirection="up"
                current={editor.getAttributes("tableCell").borderColor || editor.getAttributes("tableHeader").borderColor}
                onPick={(c) => setAllTableCellsAttr("borderColor", c)}
                title={isAr ? "\u0644\u0648\u0646 \u0627\u0644\u062d\u062f\u0648\u062f" : "Border Color"}>
                <span className="text-[10px] font-bold">BD</span>
              </ColorPicker>

              {/* Border Width */}
              <select
                value={editor.getAttributes("tableCell").borderWidth || editor.getAttributes("tableHeader").borderWidth || "1.5"}
                onChange={(e) => setAllTableCellsAttr("borderWidth", e.target.value)}
                className="h-7 px-1.5 rounded-md text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                title={isAr ? "\u0633\u0645\u0643 \u0627\u0644\u062d\u062f\u0648\u062f" : "Border Width"}>
                {BORDER_WIDTHS.map(w => <option key={w} value={w}>{w}px</option>)}
              </select>

              <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <TblBtn onClick={() => editor.chain().focus().deleteTable().run()} danger>{"\ud83d\uddd1"} {isAr ? "\u062d\u0630\u0641" : "Delete"}</TblBtn>
            </div>
          )}
        </div>

        {/* ═══ Editor Area ═══ */}
        <div className={`bg-white dark:bg-slate-950 ${isFullscreen ? "flex-1 overflow-y-auto" : ""}`}>
          <EditorContent editor={editor} />
        </div>

        {/* ═══ Status Bar ═══ */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>{headingValue === "p" ? (isAr ? "\u0646\u0635 \u0639\u0627\u062f\u064a" : "Paragraph") : headingValue.toUpperCase()}</span>
            <span className="uppercase">{editorDir}</span>
          </div>
          <span>{editor.getText().split(/\s+/).filter(Boolean).length} {isAr ? "\u0643\u0644\u0645\u0629" : "words"}</span>
        </div>
      </div>
    </div>
  );
}
