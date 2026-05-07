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
import { useEffect, useState, useRef } from "react";
import { useI18n } from "@/lib/i18n";

/* ─── Custom Table Extensions ─── */
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).style.backgroundColor || (el as HTMLElement).getAttribute("data-bg") || null,
        renderHTML: (attrs) => attrs.backgroundColor ? { style: `background-color: ${attrs.backgroundColor}` } : {},
      },
      borderColor: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-border") || null,
        renderHTML: (attrs) => attrs.borderColor ? { style: `border-color: ${attrs.borderColor}`, "data-border": attrs.borderColor } : {},
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
        renderHTML: (attrs) => attrs.backgroundColor ? { style: `background-color: ${attrs.backgroundColor}` } : {},
      },
      borderColor: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-border") || null,
        renderHTML: (attrs) => attrs.borderColor ? { style: `border-color: ${attrs.borderColor}`, "data-border": attrs.borderColor } : {},
      },
    };
  },
});

/* ─── Types ─── */
interface Props {
  value: string;
  onChange: (html: string) => void;
}

/* ─── Toolbar Button ─── */
function Btn({ onClick, active, title, children, className = "" }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-all ${
        active
          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/* ─── Color Picker Dropdown ─── */
function ColorDropdown({ colors, current, onPick, children, title }: {
  colors: string[]; current?: string; onPick: (c: string | null) => void; children: React.ReactNode; title: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={title}
        className="w-8 h-8 rounded-md text-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
      >
        {children}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2.5 w-[180px]">
          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { onPick(c === "transparent" ? null : c); setOpen(false); }}
                className={`w-6 h-6 rounded-md border hover:scale-110 transition-transform ${
                  current === c ? "ring-2 ring-blue-500 ring-offset-1" : "border-slate-200 dark:border-slate-600"
                } ${c === "transparent" ? "bg-white dark:bg-slate-800" : ""}`}
                style={c !== "transparent" ? { background: c } : undefined}
                title={c === "transparent" ? "Clear" : c}
              >
                {c === "transparent" && <span className="text-[8px] text-slate-400 flex items-center justify-center">✕</span>}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => { onPick(null); setOpen(false); }}
            className="w-full text-[11px] font-medium py-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Separator ─── */
function Sep() {
  return <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 flex-shrink-0" />;
}

/* ─── Color Swatches ─── */
const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#cccccc", "#efefef",
  "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#2563eb", "#7c3aed",
  "#db2777", "#0891b2", "#4f46e5", "#059669", "#d97706", "#9333ea",
];
const HIGHLIGHT_COLORS = [
  "transparent",
  "#fef08a", "#fde68a", "#fed7aa", "#fecaca", "#bbf7d0",
  "#bfdbfe", "#ddd6fe", "#fce7f3", "#ccfbf1", "#f1f5f9",
  "#fef9c3", "#ffedd5", "#ffe4e6", "#dcfce7", "#dbeafe",
  "#ede9fe", "#fdf2f8",
];

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
};

/* ─── Table Button (compact) ─── */
function TblBtn({ onClick, children, danger }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════
   MAIN EDITOR
   ═══════════════════════════════════════════ */
export default function RichTextEditor({ value, onChange }: Props) {
  const { lang } = useI18n();
  const isAr = lang === "ar";

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
        placeholder: isAr ? "ابدأ الكتابة هنا..." : "Start typing here...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "draft-editor-content",
        dir: isAr ? "rtl" : "ltr",
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const inTable = editor.isActive("table");

  // Current heading level for dropdown
  const headingValue = editor.isActive("heading", { level: 1 })
    ? "h1" : editor.isActive("heading", { level: 2 })
    ? "h2" : editor.isActive("heading", { level: 3 })
    ? "h3" : "p";

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
      {/* ═══ Styles ═══ */}
      <style jsx global>{`
        .draft-editor-content {
          min-height: 400px;
          outline: none;
          font-size: 16px;
          line-height: 1.7;
          padding: 24px 28px;
          color: #1e293b;
        }
        @media (max-width: 640px) {
          .draft-editor-content { padding: 16px 18px; font-size: 15px; line-height: 1.65; }
        }
        .draft-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left; color: #94a3b8; pointer-events: none; height: 0;
        }
        [dir="rtl"] .draft-editor-content p.is-editor-empty:first-child::before { float: right; }
        .draft-editor-content h1 { font-size: 1.75em; font-weight: 800; margin: 0.8em 0 0.3em; color: #0f172a; letter-spacing: -0.02em; }
        .draft-editor-content h2 { font-size: 1.4em; font-weight: 700; margin: 0.7em 0 0.25em; color: #1e293b; }
        .draft-editor-content h3 { font-size: 1.15em; font-weight: 700; margin: 0.6em 0 0.2em; color: #334155; }
        .draft-editor-content p { margin: 0.25em 0; }
        .draft-editor-content ul, .draft-editor-content ol { padding-inline-start: 1.5em; margin: 0.4em 0; }
        .draft-editor-content ul { list-style: disc; }
        .draft-editor-content ol { list-style: decimal; }
        .draft-editor-content li { margin: 0.15em 0; }
        .draft-editor-content li p { margin: 0; }
        .draft-editor-content blockquote {
          border-inline-start: 3px solid #3b82f6;
          padding-inline-start: 1em; margin: 0.6em 0;
          color: #64748b; font-style: italic;
        }
        .draft-editor-content hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5em 0; }
        .draft-editor-content strong { font-weight: 700; }
        .draft-editor-content em { font-style: italic; }
        .draft-editor-content u { text-decoration: underline; text-underline-offset: 3px; }
        .draft-editor-content s { text-decoration: line-through; color: #94a3b8; }
        .draft-editor-content mark { border-radius: 3px; padding: 1px 4px; }
        .draft-editor-content table.draft-table { border-collapse: collapse; width: 100%; margin: 16px 0; table-layout: auto; }
        .draft-editor-content table.draft-table td,
        .draft-editor-content table.draft-table th {
          border: 1.5px solid #cbd5e1; padding: 10px 12px; vertical-align: top; min-width: 60px;
        }
        .draft-editor-content table.draft-table th { background: #f8fafc; font-weight: 600; font-size: 0.9em; color: #475569; }
        .draft-editor-content table.draft-table .selectedCell {
          background: rgba(59, 130, 246, 0.08); outline: 2px solid #3b82f6; outline-offset: -2px;
        }
        .draft-editor-content .tableWrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .draft-editor-content .column-resize-handle { background-color: #3b82f6; width: 2px; position: absolute; right: -1px; top: 0; bottom: 0; pointer-events: none; }
        .draft-editor-content ::selection { background: rgba(59, 130, 246, 0.15); }
      `}</style>

      {/* ═══ Toolbar ═══ */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80">
        {/* Row 1: Main toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto scrollbar-hide">
          {/* Undo / Redo */}
          <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">{icons.undo}</Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">{icons.redo}</Btn>

          <Sep />

          {/* Heading Dropdown */}
          <select
            value={headingValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "p") editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level: Number(v.slice(1)) as 1 | 2 | 3 }).run();
            }}
            className="h-8 px-2 rounded-md text-[13px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer min-w-[110px]"
          >
            <option value="p">{isAr ? "نص عادي" : "Paragraph"}</option>
            <option value="h1">{isAr ? "عنوان ١" : "Heading 1"}</option>
            <option value="h2">{isAr ? "عنوان ٢" : "Heading 2"}</option>
            <option value="h3">{isAr ? "عنوان ٣" : "Heading 3"}</option>
          </select>

          <Sep />

          {/* Bold / Italic / Underline / Strike */}
          <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">{icons.bold}</Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">{icons.italic}</Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">{icons.underline}</Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">{icons.strike}</Btn>

          <Sep />

          {/* Text Color & Highlight */}
          <ColorDropdown
            colors={TEXT_COLORS}
            current={editor.getAttributes("textStyle").color}
            onPick={(c) => c ? editor.chain().focus().setColor(c).run() : editor.chain().focus().unsetColor().run()}
            title={isAr ? "لون النص" : "Text Color"}
          >
            <div className="flex flex-col items-center">
              {icons.textColor}
              <span className="w-4 h-1 rounded-full mt-0.5" style={{ background: editor.getAttributes("textStyle").color || "#000" }} />
            </div>
          </ColorDropdown>
          <ColorDropdown
            colors={HIGHLIGHT_COLORS}
            current={editor.getAttributes("highlight").color}
            onPick={(c) => c ? editor.chain().focus().setHighlight({ color: c }).run() : editor.chain().focus().unsetHighlight().run()}
            title={isAr ? "تمييز" : "Highlight"}
          >
            <div className="flex flex-col items-center">
              {icons.highlight}
              <span className="w-4 h-1 rounded-full mt-0.5" style={{ background: editor.getAttributes("highlight").color || "#fef08a" }} />
            </div>
          </ColorDropdown>

          <Sep />

          {/* Alignment */}
          <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">{icons.alignLeft}</Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">{icons.alignCenter}</Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">{icons.alignRight}</Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">{icons.alignJustify}</Btn>

          <Sep />

          {/* Lists */}
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title={isAr ? "قائمة نقاط" : "Bullet List"}>{icons.bulletList}</Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title={isAr ? "قائمة مرقمة" : "Numbered List"}>{icons.orderedList}</Btn>

          <Sep />

          {/* Blockquote / HR / Table */}
          <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title={isAr ? "اقتباس" : "Quote"}>{icons.blockquote}</Btn>
          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title={isAr ? "فاصل أفقي" : "Horizontal Rule"}>{icons.hr}</Btn>
          <Btn
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title={isAr ? "إدراج جدول" : "Insert Table"}
          >
            {icons.table}
          </Btn>

          <Sep />

          {/* Clear Formatting */}
          <Btn
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title={isAr ? "مسح التنسيق" : "Clear Formatting"}
          >
            {icons.clearFormat}
          </Btn>
        </div>

        {/* Row 2: Table tools (only visible when cursor is in table) */}
        {inTable && (
          <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-t border-slate-200 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-500/5">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mr-1.5">{isAr ? "جدول" : "Table"}</span>
            <TblBtn onClick={() => editor.chain().focus().addRowAfter().run()}>+ {isAr ? "صف" : "Row"}</TblBtn>
            <TblBtn onClick={() => editor.chain().focus().addColumnAfter().run()}>+ {isAr ? "عمود" : "Col"}</TblBtn>
            <TblBtn onClick={() => editor.chain().focus().deleteRow().run()} danger>− {isAr ? "صف" : "Row"}</TblBtn>
            <TblBtn onClick={() => editor.chain().focus().deleteColumn().run()} danger>− {isAr ? "عمود" : "Col"}</TblBtn>
            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
            <TblBtn onClick={() => editor.chain().focus().mergeCells().run()}>{isAr ? "دمج" : "Merge"}</TblBtn>
            <TblBtn onClick={() => editor.chain().focus().splitCell().run()}>{isAr ? "فصل" : "Split"}</TblBtn>
            <TblBtn onClick={() => editor.chain().focus().toggleHeaderRow().run()}>{isAr ? "صف رأسي" : "H-Row"}</TblBtn>
            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
            <TblBtn onClick={() => editor.chain().focus().deleteTable().run()} danger>🗑 {isAr ? "حذف" : "Delete"}</TblBtn>
          </div>
        )}
      </div>

      {/* ═══ Editor Area ═══ */}
      <EditorContent editor={editor} />

      {/* ═══ Status Bar ═══ */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] text-slate-400">
        <span>{headingValue === "p" ? (isAr ? "نص عادي" : "Paragraph") : headingValue.toUpperCase()}</span>
        <span>
          {editor.getText().split(/\s+/).filter(Boolean).length} {isAr ? "كلمة" : "words"}
        </span>
      </div>
    </div>
  );
}
