import sanitizeHtml from "sanitize-html";

export interface DraftProfile {
  full_name?: string;
  business_name?: string;
  brand_color?: string;
  logo_url?: string;
  preferred_language?: "ar" | "en";
}

export interface DraftDoc {
  serial: string;
  date: string;
  client: string;
  project: string;
  title: string;
  summary?: string;
  content_html: string;
  status: string;
}

function escapeHtml(value: string = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Detect if text contains Arabic characters */
function isArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text || "");
}

export function sanitizeDraftHtml(html: string) {
  return sanitizeHtml(html || "", {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s",
      "ul", "ol", "li", "blockquote", "h1", "h2", "h3", "h4",
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div", "mark"
    ],
    allowedAttributes: {
      "*": ["style", "dir", "colspan", "rowspan", "data-text-align", "class"]
    },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/],
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        "font-size": [/^\d+(px|pt|em|rem|%)$/],
        "background-color": [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/],
        "border": [/.*/],
        "border-color": [/.*/],
        "border-width": [/.*/],
        "border-style": [/.*/],
      }
    }
  });
}

export function buildDraftHtml(doc: DraftDoc, profile: DraftProfile | null, lang?: "ar" | "en") {
  const brand = profile?.brand_color || "#2563eb";
  const business = profile?.business_name || profile?.full_name || "Invoicaty";
  const logo = profile?.logo_url ? `<img src="${escapeHtml(profile.logo_url)}" alt="Logo" style="max-height:48px;max-width:120px;object-fit:contain;display:block" />` : "";
  const content = sanitizeDraftHtml(doc.content_html);

  // Detect language: explicit param > profile preference > content detection
  const effectiveLang = lang || profile?.preferred_language || (isArabic(doc.title) || isArabic(doc.client) || isArabic(doc.content_html) ? "ar" : "en");
  const isRtl = effectiveLang === "ar";
  const dir = isRtl ? "rtl" : "ltr";
  const align = isRtl ? "right" : "left";
  const alignOpp = isRtl ? "left" : "right";
  const fontFamily = isRtl
    ? "'Tajawal', 'Segoe UI', 'Arial', sans-serif"
    : "'Inter', 'Segoe UI', 'Arial', sans-serif";
  const googleFont = isRtl
    ? '<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />'
    : '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />';

  return `<!doctype html>
<html lang="${effectiveLang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${googleFont}
  <title>${escapeHtml(doc.title || "Draft")} — ${escapeHtml(doc.serial)}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm 8mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      font-family: ${fontFamily};
      color: #0f172a;
      direction: ${dir};
      text-align: ${align};
      line-height: 1.4;
      font-size: 13px;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      background: #e8ecf0;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 8mm 10mm;
      box-shadow: 0 8px 40px rgba(15,23,42,0.07);
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      border-bottom: 3px solid ${brand};
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .header-start { flex: 1; min-width: 0; text-align: ${align}; }
    .header-end { text-align: ${alignOpp}; flex-shrink: 0; }
    .doc-title {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 2px;
      color: #0f172a;
      line-height: 1.1;
    }
    .client-name { font-weight: 700; font-size: 13px; margin-bottom: 1px; color: #1e293b; }
    .project-name { color: #64748b; font-size: 11px; }
    .biz-name { font-weight: 700; margin-top: 4px; font-size: 11px; color: #0f172a; }
    .meta-line { color: #64748b; font-size: 10px; margin-top: 1px; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      background: ${brand}15;
      color: ${brand};
      font-size: 9px;
      font-weight: 700;
      margin-top: 4px;
      border: 1px solid ${brand}30;
    }

    /* Summary */
    .summary {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 5px 8px;
      margin-bottom: 8px;
      font-size: 11px;
      color: #334155;
      line-height: 1.35;
    }

    /* Content */
    .content {
      font-size: 12px;
      line-height: 1.45;
      color: #1e293b;
    }
    .content p { margin-bottom: 5px; }
    .content h1 { font-size: 17px; font-weight: 800; margin: 10px 0 4px; color: #0f172a; }
    .content h2 { font-size: 14px; font-weight: 700; margin: 8px 0 3px; color: #0f172a; }
    .content h3 { font-size: 12px; font-weight: 700; margin: 6px 0 2px; color: #1e293b; }
    .content h4 { font-size: 11px; font-weight: 700; margin: 5px 0 2px; color: #334155; }
    .content ul, .content ol { margin: 4px 0; padding-${isRtl ? "right" : "left"}: 16px; }
    .content li { margin-bottom: 2px; }
    .content blockquote {
      border-${isRtl ? "right" : "left"}: 3px solid ${brand};
      padding: 4px 8px;
      margin: 6px 0;
      background: #f8fafc;
      color: #334155;
      font-style: italic;
    }

    /* Tables — compact padding, uniform border for ALL cells */
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0;
      font-size: 11px;
    }
    .content table th,
    .content table td {
      padding: 3px 5px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
      line-height: 1.3;
    }
    .content table th {
      font-weight: 700;
      background: #f1f5f9;
    }

    /* Footer */
    .footer {
      margin-top: 16px;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
    }

    /* Print button (screen only) */
    .pbtn {
      position: fixed;
      bottom: 20px;
      ${isRtl ? "left" : "right"}: 20px;
      background: ${brand};
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
    }
    .pbtn:hover { opacity: 0.9; }

    /* Print overrides */
    @media print {
      html, body { background: white !important; }
      body { padding: 0; }
      .page {
        margin: 0;
        padding: 0;
        min-height: auto;
        box-shadow: none;
        width: 100%;
      }
      .pbtn { display: none !important; }
      .header { break-inside: avoid; }
      .footer { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-start">
        <div class="doc-title">${escapeHtml(doc.title || "Draft")}</div>
        <div class="client-name">${escapeHtml(doc.client)}</div>
        <div class="project-name">${escapeHtml(doc.project)}</div>
      </div>
      <div class="header-end">
        ${logo}
        <div class="biz-name">${escapeHtml(business)}</div>
        <div class="meta-line">${escapeHtml(doc.date)}</div>
        <div class="meta-line">${escapeHtml(doc.serial)}</div>
        <span class="badge">${escapeHtml(doc.status)}</span>
      </div>
    </div>
    ${doc.summary ? `<div class="summary">${escapeHtml(doc.summary)}</div>` : ""}
    <div class="content">${content}</div>
    <div class="footer">Generated by Invoicaty</div>
  </div>
  <button class="pbtn" onclick="window.print()">🖨️ ${isRtl ? "حفظ كـ PDF" : "Save as PDF"}</button>
</body>
</html>`;
}

export function printDraft(doc: DraftDoc, profile: DraftProfile | null, lang?: "ar" | "en") {
  const html = buildDraftHtml(doc, profile, lang);
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
