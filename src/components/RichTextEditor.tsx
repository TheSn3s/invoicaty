"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
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

/* ─── Custom Table Extensions (preserve bg/border) ─── */
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

interface SlashItem {
  icon: string;
  label: string;
  labelAr: string;
  desc: string;
  descAr: string;
  action: (editor: ReturnType<typeof useEditor>) => void;
}

/* ─── Slash Command Items ─── */
const SLASH_ITEMS: SlashItem[] = [
  {
    icon: "📝", label: "Text", labelAr: "نص عادي",
    desc: "Plain paragraph", descAr: "فقرة عادية",
    action: (e) => e?.chain().focus().setParagraph().run(),
  },
  {
    icon: "𝗛₁", label: "Heading 1", labelAr: "عنوان ١",
    desc: "Large heading", descAr: "عنوان كبير",
    action: (e) => e?.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    icon: "𝗛₂", label: "Heading 2", labelAr: "عنوان ٢",
    desc: "Medium heading", descAr: "عنوان متوسط",
    action: (e) => e?.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    icon: "𝗛₃", label: "Heading 3", labelAr: "عنوان ٣",
    desc: "Small heading", descAr: "عنوان صغير",
    action: (e) => e?.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    icon: "•", label: "Bullet List", labelAr: "قائمة نقاط",
    desc: "Unordered list", descAr: "قائمة بدون ترقيم",
    action: (e) => e?.chain().focus().toggleBulletList().run(),
  },
  {
    icon: "1.", label: "Numbered List", labelAr: "قائمة مرقمة",
    desc: "Ordered list", descAr: "قائمة بأرقام",
    action: (e) => e?.chain().focus().toggleOrderedList().run(),
  },
  {
    icon: "❝", label: "Quote", labelAr: "اقتباس",
    desc: "Block quote", descAr: "نص مقتبس",
    action: (e) => e?.chain().focus().toggleBlockquote().run(),
  },
  {
    icon: "▦", label: "Table", labelAr: "جدول",
    desc: "Insert a table", descAr: "إدراج جدول",
    action: (e) => e?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    icon: "—", label: "Divider", labelAr: "فاصل",
    desc: "Horizontal line", descAr: "خط أفقي",
    action: (e) => e?.chain().focus().setHorizontalRule().run(),
  },
];

/* ─── Color Swatches ─── */
const TEXT_COLORS = ["#0f172a", "#374151", "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#2563eb", "#7c3aed", "#db2777", "#ffffff"];
const BG_COLORS = ["transparent", "#fef3c7", "#fee2e2", "#dcfce7", "#dbeafe", "#ede9fe", "#fce7f3", "#f1f5f9"];

/* ─── Slash Command Menu ─── */
function SlashMenu({ query, items, selectedIndex, onSelect, isAr }: {
  query: string;
  items: SlashItem[];
  selectedIndex: number;
  onSelect: (item: SlashItem) => void;
  isAr: boolean;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = menuRef.current?.children[selectedIndex] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const filtered = items.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return item.label.toLowerCase().includes(q) || item.labelAr.includes(q);
  });

  if (filtered.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-black/10 overflow-hidden max-h-[280px] overflow-y-auto w-[220px] py-1"
    >
      {filtered.map((item, i) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelect(item)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-start transition-colors ${
            i === selectedIndex
              ? "bg-blue-50 dark:bg-blue-500/10"
              : "hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm flex-shrink-0">{item.icon}</span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">{isAr ? item.labelAr : item.label}</div>
            <div className="text-[10px] text-slate-400 truncate">{isAr ? item.descAr : item.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── Inline Color Picker (compact) ─── */
function InlineColorPicker({ colors, current, onPick, label }: { colors: string[]; current?: string; onPick: (c: string | null) => void; label: string }) {
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
        onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o); }}
        className="h-8 px-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 hover:bg-white/10"
        title={label}
      >
        <span className="w-4 h-4 rounded border border-white/30" style={{ background: current || "transparent" }} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2 w-auto">
          <div className="flex gap-1">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onPick(c === "transparent" ? null : c);
                  setOpen(false);
                }}
                className={`w-5 h-5 rounded border transition-transform hover:scale-125 ${
                  c === "transparent" ? "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" : "border-slate-200 dark:border-slate-600"
                } ${current === c ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                style={c !== "transparent" ? { background: c } : undefined}
                title={c === "transparent" ? "Clear" : c}
              >
                {c === "transparent" && <span className="text-[8px] text-slate-400">✕</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Bubble Menu Button ─── */
function BubbleBtn({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`h-8 min-w-[28px] px-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
        active ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Main Editor ─── */
export default function RichTextEditor({ value, onChange }: Props) {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  // Slash command state
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashPos, setSlashPos] = useState<{ top: number; left: number } | null>(null);
  const slashStartPos = useRef<number | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
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
        placeholder: isAr ? "اكتب / لعرض الأوامر..." : "Type / for commands...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "draft-editor-content",
        dir: isAr ? "rtl" : "ltr",
      },
      handleKeyDown: (view, event) => {
        // Slash command handling
        if (event.key === "/" && !slashOpen) {
          setTimeout(() => {
            const { from } = view.state.selection;
            slashStartPos.current = from;
            setSlashOpen(true);
            setSlashQuery("");
            setSlashIndex(0);

            // Position the menu
            const coords = view.coordsAtPos(from);
            const editorRect = view.dom.getBoundingClientRect();
            setSlashPos({
              top: coords.bottom - editorRect.top + 4,
              left: coords.left - editorRect.left,
            });
          }, 0);
          return false;
        }

        if (slashOpen) {
          if (event.key === "Escape") {
            setSlashOpen(false);
            return true;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSlashIndex((i) => Math.min(i + 1, getFilteredItems().length - 1));
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSlashIndex((i) => Math.max(i - 1, 0));
            return true;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            const items = getFilteredItems();
            if (items[slashIndex]) {
              selectSlashItem(items[slashIndex]);
            }
            return true;
          }
          if (event.key === "Backspace") {
            // Check if we're deleting the / character
            const { from } = view.state.selection;
            if (slashStartPos.current !== null && from <= slashStartPos.current) {
              setSlashOpen(false);
            }
            return false;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());

      // Update slash query
      if (slashOpen && slashStartPos.current !== null) {
        const { from } = e.state.selection;
        const text = e.state.doc.textBetween(slashStartPos.current, from, "");
        // Text after the "/"
        setSlashQuery(text);
        setSlashIndex(0);
      }
    },
  });

  const getFilteredItems = useCallback(() => {
    return SLASH_ITEMS.filter((item) => {
      if (!slashQuery) return true;
      const q = slashQuery.toLowerCase();
      return item.label.toLowerCase().includes(q) || item.labelAr.includes(q);
    });
  }, [slashQuery]);

  const selectSlashItem = useCallback((item: SlashItem) => {
    if (!editor || slashStartPos.current === null) return;
    // Delete the "/" and query text
    const from = slashStartPos.current - 1; // include the "/"
    const to = editor.state.selection.from;
    editor.chain().focus().deleteRange({ from, to }).run();
    item.action(editor);
    setSlashOpen(false);
    slashStartPos.current = null;
  }, [editor]);

  // Close slash menu on blur/click outside
  useEffect(() => {
    if (!slashOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".slash-menu")) {
        setSlashOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [slashOpen]);

  // Sync external value
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const inTable = editor.isActive("table");

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      {/* ─── Editor Styles ─── */}
      <style jsx global>{`
        .draft-editor-content {
          min-height: 400px;
          outline: none;
          font-size: 16px;
          line-height: 1.65;
          padding: 20px 24px;
          color: #1e293b;
        }
        @media (max-width: 640px) {
          .draft-editor-content { padding: 16px; font-size: 15px; }
        }

        /* Placeholder */
        .draft-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
        [dir="rtl"] .draft-editor-content p.is-editor-empty:first-child::before {
          float: right;
        }

        /* Headings */
        .draft-editor-content h1 { font-size: 1.75em; font-weight: 800; margin: 0.8em 0 0.3em; color: #0f172a; letter-spacing: -0.02em; }
        .draft-editor-content h2 { font-size: 1.35em; font-weight: 700; margin: 0.7em 0 0.25em; color: #1e293b; }
        .draft-editor-content h3 { font-size: 1.1em; font-weight: 700; margin: 0.6em 0 0.2em; color: #334155; }

        /* Paragraphs & lists */
        .draft-editor-content p { margin: 0.3em 0; }
        .draft-editor-content ul, .draft-editor-content ol { padding-inline-start: 1.5em; margin: 0.4em 0; }
        .draft-editor-content ul { list-style: disc; }
        .draft-editor-content ol { list-style: decimal; }
        .draft-editor-content li { margin: 0.15em 0; }
        .draft-editor-content li p { margin: 0; }

        /* Blockquote */
        .draft-editor-content blockquote {
          border-inline-start: 3px solid #3b82f6;
          padding-inline-start: 1em;
          color: #64748b;
          margin: 0.6em 0;
          font-style: italic;
        }

        /* Horizontal rule */
        .draft-editor-content hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 1.5em 0;
        }

        /* Inline formatting */
        .draft-editor-content strong { font-weight: 700; }
        .draft-editor-content em { font-style: italic; }
        .draft-editor-content u { text-decoration: underline; text-underline-offset: 2px; }
        .draft-editor-content s { text-decoration: line-through; color: #94a3b8; }
        .draft-editor-content mark { border-radius: 3px; padding: 1px 3px; }

        /* Tables */
        .draft-editor-content table.draft-table { border-collapse: collapse; width: 100%; margin: 16px 0; table-layout: auto; }
        .draft-editor-content table.draft-table td,
        .draft-editor-content table.draft-table th {
          border: 1.5px solid #cbd5e1;
          padding: 10px 12px;
          vertical-align: top;
          min-width: 60px;
        }
        .draft-editor-content table.draft-table th { background: #f1f5f9; font-weight: 600; font-size: 0.9em; color: #475569; }
        .draft-editor-content table.draft-table .selectedCell {
          background: rgba(59, 130, 246, 0.08);
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
        }
        .draft-editor-content .tableWrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .draft-editor-content .column-resize-handle { background-color: #3b82f6; width: 2px; position: absolute; right: -1px; top: 0; bottom: 0; pointer-events: none; }

        /* Selection */
        .draft-editor-content ::selection { background: rgba(59, 130, 246, 0.2); }
      `}</style>

      {/* ─── Bubble Menu (appears on text selection) ─── */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{
          duration: 150,
          placement: "top",
          animation: "shift-away",
        }}
        className="bg-slate-800 rounded-xl shadow-2xl shadow-black/20 border border-slate-700 flex items-center gap-0.5 px-1.5 py-1"
      >
        <BubbleBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <span className="font-black">B</span>
        </BubbleBtn>
        <BubbleBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <span className="italic">I</span>
        </BubbleBtn>
        <BubbleBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <span className="underline">U</span>
        </BubbleBtn>
        <BubbleBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <span className="line-through">S</span>
        </BubbleBtn>

        <span className="w-px h-4 bg-slate-600 mx-0.5" />

        <InlineColorPicker
          label="Text color"
          colors={TEXT_COLORS}
          current={editor.getAttributes("textStyle").color}
          onPick={(c) => c ? editor.chain().focus().setColor(c).run() : editor.chain().focus().unsetColor().run()}
        />
        <InlineColorPicker
          label="Highlight"
          colors={BG_COLORS}
          current={editor.getAttributes("highlight").color}
          onPick={(c) => c ? editor.chain().focus().setHighlight({ color: c }).run() : editor.chain().focus().unsetHighlight().run()}
        />

        <span className="w-px h-4 bg-slate-600 mx-0.5" />

        <BubbleBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </BubbleBtn>
        <BubbleBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </BubbleBtn>
        <BubbleBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Right">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </BubbleBtn>
      </BubbleMenu>

      {/* ─── Table Toolbar (only when cursor is in table) ─── */}
      {inTable && (
        <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-500/5">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mr-1">Table</span>
          <TblBtn onClick={() => editor.chain().focus().addRowAfter().run()}>+ Row</TblBtn>
          <TblBtn onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col</TblBtn>
          <TblBtn onClick={() => editor.chain().focus().deleteRow().run()} danger>− Row</TblBtn>
          <TblBtn onClick={() => editor.chain().focus().deleteColumn().run()} danger>− Col</TblBtn>
          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
          <TblBtn onClick={() => editor.chain().focus().mergeCells().run()}>Merge</TblBtn>
          <TblBtn onClick={() => editor.chain().focus().splitCell().run()}>Split</TblBtn>
          <TblBtn onClick={() => editor.chain().focus().toggleHeaderRow().run()}>H-Row</TblBtn>
          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
          <TblBtn onClick={() => editor.chain().focus().deleteTable().run()} danger>🗑 Delete</TblBtn>
        </div>
      )}

      {/* ─── Editor Content ─── */}
      <div className="relative">
        <EditorContent editor={editor} />

        {/* ─── Slash Command Menu ─── */}
        {slashOpen && slashPos && (
          <div
            className="slash-menu absolute z-50"
            style={{ top: slashPos.top, left: slashPos.left }}
          >
            <SlashMenu
              query={slashQuery}
              items={SLASH_ITEMS}
              selectedIndex={slashIndex}
              onSelect={selectSlashItem}
              isAr={isAr}
            />
          </div>
        )}
      </div>

      {/* ─── Bottom Hint ─── */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <p className="text-[10px] text-slate-400 text-center">
          {isAr
            ? "اكتب / لعرض الأوامر • حدد نص لتنسيقه"
            : "Type / for commands • Select text to format"}
        </p>
      </div>
    </div>
  );
}

/* ─── Small table button ─── */
function TblBtn({ onClick, children, danger }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
        danger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}
