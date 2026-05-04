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

// Extend TableCell & TableHeader to support backgroundColor + borderColor attributes
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).style.backgroundColor || (el as HTMLElement).getAttribute("data-bg") || null,
        renderHTML: (attrs) => {
          if (!attrs.backgroundColor) return {};
          return { style: `background-color: ${attrs.backgroundColor}` };
        },
      },
      borderColor: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-border") || null,
        renderHTML: (attrs) => {
          if (!attrs.borderColor) return {};
          return { style: `border-color: ${attrs.borderColor}`, "data-border": attrs.borderColor };
        },
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
        renderHTML: (attrs) => {
          if (!attrs.backgroundColor) return {};
          return { style: `background-color: ${attrs.backgroundColor}` };
        },
      },
      borderColor: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-border") || null,
        renderHTML: (attrs) => {
          if (!attrs.borderColor) return {};
          return { style: `border-color: ${attrs.borderColor}`, "data-border": attrs.borderColor };
        },
      },
    };
  },
});
import { useEffect, useState, useRef } from "react";
import { useI18n } from "@/lib/i18n";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

function Btn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`min-w-[34px] h-9 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center ${active ? "bg-blue-600/30 border-blue-500/40 text-blue-300" : "bg-slate-800/80 border-slate-700/60 text-slate-200 hover:bg-slate-700/70"}`}
    >
      {children}
    </button>
  );
}

function ColorPicker({ label, color, onPick, swatches }: { label: string; color?: string; onPick: (c: string | null) => void; swatches: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)} title={label} className="min-w-[34px] h-9 px-2 rounded-lg text-xs font-bold border border-slate-700/60 bg-slate-800/80 hover:bg-slate-700/70 text-slate-200 flex items-center gap-1.5">
        <span className="w-4 h-4 rounded border border-slate-500" style={{ background: color || "transparent" }} />
        <span className="hidden sm:inline">{label}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 left-0 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 w-56">
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {swatches.map(s => (
              <button key={s} type="button" onClick={() => { onPick(s); setOpen(false); }} className="w-6 h-6 rounded-md border border-slate-600 hover:scale-110 transition-transform" style={{ background: s }} title={s} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="color" onChange={(e) => onPick(e.target.value)} className="w-9 h-9 rounded border border-slate-700 bg-slate-800 cursor-pointer" />
            <button type="button" onClick={() => { onPick(null); setOpen(false); }} className="flex-1 text-[11px] font-bold py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}

const TEXT_SWATCHES = ["#0f172a", "#1f2937", "#374151", "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0891b2", "#2563eb", "#7c3aed", "#db2777", "#ffffff", "#94a3b8", "#000000"];
const HIGHLIGHT_SWATCHES = ["#fef3c7", "#fee2e2", "#dcfce7", "#dbeafe", "#ede9fe", "#fce7f3", "#f1f5f9", "#fde68a", "#fecaca", "#bbf7d0", "#bfdbfe", "#ddd6fe", "#fbcfe8", "#ffffff"];
const CELL_BG_SWATCHES = ["#ffffff", "#f8fafc", "#f1f5f9", "#fef9c3", "#fee2e2", "#dcfce7", "#dbeafe", "#ede9fe", "#fce7f3", "#fde68a", "#fecaca", "#bbf7d0", "#bfdbfe", "#ddd6fe"];
const BORDER_SWATCHES = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#dc2626", "#16a34a", "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#ca8a04", "#0891b2", "#000000"];

export default function RichTextEditor({ value, onChange }: Props) {
  const { lang } = useI18n();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "draft-table" } }),
      TableRow,
      CustomTableHeader,
      CustomTableCell,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "max-w-none min-h-[360px] focus:outline-none px-5 py-4 text-slate-900 text-[15px] leading-relaxed",
        dir: lang === "ar" ? "rtl" : "ltr",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const inTable = editor.isActive("table");

  const setCellBackground = (color: string | null) => {
    editor.chain().focus().setCellAttribute("backgroundColor", color).run();
  };

  const setCellBorder = (color: string | null) => {
    editor.chain().focus().setCellAttribute("borderColor", color).run();
  };

  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-inner">
      <style jsx global>{`
        .ProseMirror { min-height: 360px; outline: none; font-size: 15px; line-height: 1.4; }
        .ProseMirror table.draft-table { border-collapse: collapse; width: 100%; margin: 14px 0; table-layout: fixed; display: table !important; visibility: visible !important; }
        .ProseMirror table.draft-table td, .ProseMirror table.draft-table th {
          border: 2px solid #475569;
          padding: 8px 10px;
          vertical-align: top;
          min-width: 60px;
          position: relative;
        }
        .ProseMirror table.draft-table th { background: #e2e8f0; font-weight: 700; }
        .ProseMirror table.draft-table .selectedCell {
          background: rgba(37, 99, 235, 0.12);
          outline: 2px solid #2563eb;
          outline-offset: -2px;
        }
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: 14px 0; display: table !important; }
        .ProseMirror table td, .ProseMirror table th {
          border: 2px solid #475569;
          padding: 8px 10px;
          vertical-align: top;
          min-width: 60px;
        }
        .ProseMirror table th { background: #e2e8f0; font-weight: 700; }
        .ProseMirror table .selectedCell {
          background: rgba(37, 99, 235, 0.12);
          outline: 2px solid #2563eb;
          outline-offset: -2px;
        }
        .ProseMirror p { margin: 0.15em 0; line-height: 1.4; }
        .ProseMirror li { line-height: 1.4; margin: 0.1em 0; }
        .ProseMirror h1 { font-size: 1.8em; font-weight: 700; margin: 0.5em 0; }
        .ProseMirror h2 { font-size: 1.4em; font-weight: 700; margin: 0.5em 0; }
        .ProseMirror h3 { font-size: 1.15em; font-weight: 700; margin: 0.4em 0; }
        .ProseMirror ul, .ProseMirror ol { padding-inline-start: 1.5em; }
        .ProseMirror ul { list-style: disc; }
        .ProseMirror ol { list-style: decimal; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror u { text-decoration: underline; }
        .ProseMirror s { text-decoration: line-through; }
        .ProseMirror blockquote { border-inline-start: 4px solid #cbd5e1; padding-inline-start: 1em; color: #64748b; }
        .ProseMirror .tableWrapper { overflow-x: auto; }
        .ProseMirror .column-resize-handle { background-color: #2563eb; width: 3px; position: absolute; right: -2px; top: 0; bottom: 0; pointer-events: none; }
      `}</style>

      <div className="flex flex-wrap gap-1.5 p-3 border-b border-slate-200 bg-slate-50">
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo">↶</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo">↷</Btn>
        <span className="w-px bg-slate-300 mx-1" />

        <select
          className="h-9 px-2 rounded-lg text-xs font-bold border border-slate-700/60 bg-slate-800/80 text-slate-200"
          value={editor.isActive("heading", { level: 1 }) ? "h1" : editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "p"}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(v.slice(1)) as 1 | 2 | 3 }).run();
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <select
          className="h-9 px-2 rounded-lg text-xs font-bold border border-slate-700/60 bg-slate-800/80 text-slate-200"
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetMark("textStyle").run();
            else editor.chain().focus().setMark("textStyle", { fontSize: `${v}px` }).run();
          }}
        >
          <option value="">Size</option>
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
          <option value="24">24</option>
          <option value="28">28</option>
          <option value="32">32</option>
        </select>

        <span className="w-px bg-slate-300 mx-1" />
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">B</Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><span className="italic">I</span></Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><span className="underline">U</span></Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strike"><span className="line-through">S</span></Btn>

        <span className="w-px bg-slate-300 mx-1" />
        <ColorPicker label="A" color={editor.getAttributes("textStyle").color} onPick={(c) => c ? editor.chain().focus().setColor(c).run() : editor.chain().focus().unsetColor().run()} swatches={TEXT_SWATCHES} />
        <ColorPicker label="Hi" color={editor.getAttributes("highlight").color} onPick={(c) => c ? editor.chain().focus().setHighlight({ color: c }).run() : editor.chain().focus().unsetHighlight().run()} swatches={HIGHLIGHT_SWATCHES} />

        <span className="w-px bg-slate-300 mx-1" />
        <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">⟸</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">≡</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">⟹</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">≣</Btn>

        <span className="w-px bg-slate-300 mx-1" />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">• List</Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">1. List</Btn>

        <span className="w-px bg-slate-300 mx-1" />
        <Btn onClick={() => { if (!inTable) editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }} active={inTable} title={inTable ? "Already inside a table — use Table toolbar below" : "Insert table"}>▦ Table</Btn>
      </div>

      {inTable && (
        <div className="flex flex-wrap gap-1.5 p-3 border-b border-slate-200 bg-blue-50/60">
          <span className="text-[11px] font-bold text-slate-600 self-center mr-2">Table:</span>
          <Btn onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add column before">+ ◀ Col</Btn>
          <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column after">Col ▶ +</Btn>
          <Btn onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete column">✕ Col</Btn>
          <span className="w-px bg-slate-300 mx-1" />
          <Btn onClick={() => editor.chain().focus().addRowBefore().run()} title="Add row before">+ ▲ Row</Btn>
          <Btn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row after">Row ▼ +</Btn>
          <Btn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete row">✕ Row</Btn>
          <span className="w-px bg-slate-300 mx-1" />
          <Btn onClick={() => editor.chain().focus().mergeCells().run()} title="Merge cells">⇲ Merge</Btn>
          <Btn onClick={() => editor.chain().focus().splitCell().run()} title="Split cell">⇱ Split</Btn>
          <Btn onClick={() => editor.chain().focus().toggleHeaderRow().run()} title="Toggle header row">H Row</Btn>
          <Btn onClick={() => editor.chain().focus().toggleHeaderColumn().run()} title="Toggle header column">H Col</Btn>
          <span className="w-px bg-slate-300 mx-1" />
          <ColorPicker label="Cell BG" onPick={setCellBackground} swatches={CELL_BG_SWATCHES} />
          <ColorPicker label="Border" onPick={setCellBorder} swatches={BORDER_SWATCHES} />
          <span className="w-px bg-slate-300 mx-1" />
          <Btn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table">🗑 Table</Btn>
        </div>
      )}

      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
