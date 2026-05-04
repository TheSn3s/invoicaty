"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Font,
  Alignment,
  List,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  Heading,
  Undo,
  Autoformat,
  PasteFromOffice,
} from "ckeditor5";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export default function CKRichTextEditor({ value, onChange }: Props) {
  const { lang } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-inner min-h-[420px]" />
    );
  }

  return (
    <div className="ckeditor-wrapper rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-inner">
      <style jsx global>{`
        .ckeditor-wrapper .ck.ck-editor__main > .ck-editor__editable {
          min-height: 420px;
          background: #ffffff;
          color: #0f172a;
        }
        .ckeditor-wrapper .ck.ck-toolbar {
          background: #f8fafc;
          border-color: #e2e8f0;
        }
        .ckeditor-wrapper .ck.ck-editor__main > .ck-editor__editable:not(.ck-focused) {
          border-color: #e2e8f0;
        }
      `}</style>
      <CKEditor
        editor={ClassicEditor}
        config={{
          licenseKey: 'GPL',
          language: lang === 'ar' ? 'ar' : 'en',
          plugins: [
            Essentials,
            Paragraph,
            Bold,
            Italic,
            Underline,
            Font,
            Alignment,
            List,
            Table,
            TableToolbar,
            TableProperties,
            TableCellProperties,
            Heading,
            Undo,
            Autoformat,
            PasteFromOffice,
          ],
          toolbar: [
            'undo', 'redo', '|',
            'heading', '|',
            'bold', 'italic', 'underline', '|',
            'fontSize', 'fontColor', 'fontBackgroundColor', '|',
            'alignment', '|',
            'bulletedList', 'numberedList', '|',
            'insertTable'
          ],
          table: {
            contentToolbar: [
              'tableColumn',
              'tableRow',
              'mergeTableCells',
              'tableProperties',
              'tableCellProperties'
            ]
          },
          initialData: value || ''
        }}
        onChange={(_, editor) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
}
