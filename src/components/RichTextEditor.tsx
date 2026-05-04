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
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

function ToolButton({ onClick, active, label, children }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${active ? "bg-blue-600/30 border-blue-500/40 text-blue-300" : "bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700/70"}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange }: Props) {
  const { lang } = useI18n();
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[320px] focus:outline-none px-4 py-4 text-slate-900",
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

  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-inner">
      <div className="flex flex-wrap gap-2 p-3 border-b border-slate-200 bg-slate-50">
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold">B</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic">I</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Underline">U</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list">• List</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list">1. List</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} label="Align left">⟸</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} label="Align center">≡</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} label="Align right">⟹</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} label="Insert table">▦ Table</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().addColumnAfter().run()} label="Add column">+ Col</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().addRowAfter().run()} label="Add row">+ Row</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().deleteTable().run()} label="Delete table">✕ Table</ToolButton>
        <select
          className="px-3 py-2 rounded-lg text-xs font-bold border bg-slate-800/80 border-slate-700/60 text-slate-300"
          defaultValue="16"
          onChange={(e) => editor.chain().focus().setMark("textStyle", { fontSize: `${e.target.value}px` }).run()}
        >
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="28">28px</option>
        </select>
        <input
          type="color"
          title="Text color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-10 h-10 rounded-lg border border-slate-700/60 bg-slate-800/80"
        />
      </div>
      <div className="bg-white [&_.ProseMirror]:min-h-[320px] [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:my-4 [&_.ProseMirror_table]:border [&_.ProseMirror_table]:border-slate-500 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-slate-500 [&_.ProseMirror_th]:bg-slate-100 [&_.ProseMirror_th]:px-3 [&_.ProseMirror_th]:py-2 [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-slate-400 [&_.ProseMirror_td]:px-3 [&_.ProseMirror_td]:py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
