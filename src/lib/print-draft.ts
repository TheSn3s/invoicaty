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
  const logo = profile?.logo_url ? `<img src="${escapeHtml(profile.logo_url)}" alt="Logo" style="max-height:64px;max-width:160px;object-fit:contain" />` : "";
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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${fontFamily};
      color: #0f172a;
      background: #f1f5f9;
      direction: ${dir};
      text-align: ${align};
      line-height: 1.7;
      font-size: 15px;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 18mm 16mm;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      border-bottom: 4px solid ${brand};
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header-start { flex: 1; text-align: ${align}; }
    .header-end { text-align: ${alignOpp}; flex-shrink: 0; }
    .doc-title { font-size: 26px; font-weight: 800; margin-bottom: 6px; color: #0f172a; }
    .client-name { font-weight: 700; font-size: 16px; margin-bottom: 2px; color: #1e293b; }
    .project-name { color: #64748b; font-size: 13px; }
    .biz-name { font-weight: 700; margin-top: 8px; font-size: 14px; }
    .meta-line { color: #64748b; font-size: 12px; margin-top: 2px; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      background: ${brand}18;
      color: ${brand};
      font-size: 11px;
      font-weight: 700;
      margin-top: 8px;
    }

    /* Summary */
    .summary {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      margin-top: 16px;
      font-size: 14px;
      color: #334155;
    }

    /* Content area */
    .content {
      margin-top: 24px;
      line-height: 1.8;
      font-size: 15px;
    }
    .content p { margin: 0.5em 0; }
    .content h1 { font-size: 1.6em; font-weight: 800; margin: 0.6em 0 0.3em; }
    .content h2 { font-size: 1.3em; font-weight: 700; margin: 0.5em 0 0.3em; }
    .content h3 { font-size: 1.1em; font-weight: 700; margin: 0.4em 0 0.2em; }
    .content ul { list-style: disc; padding-${isRtl ? "right" : "left"}: 1.5em; margin: 0.5em 0; }
    .content ol { list-style: decimal; padding-${isRtl ? "right" : "left"}: 1.5em; margin: 0.5em 0; }
    .content li { margin: 0.2em 0; }
    .content strong { font-weight: 700; }
    .content em { font-style: italic; }
    .content u { text-decoration: underline; }
    .content s { text-decoration: line-through; }
    .content blockquote {
      border-${isRtl ? "right" : "left"}: 4px solid #cbd5e1;
      padding-${isRtl ? "right" : "left"}: 1em;
      color: #64748b;
      margin: 0.5em 0;
    }

    /* Tables */
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      direction: ${dir};
      table-layout: auto;
    }
    .content th, .content td {
      border: 1px solid #94a3b8;
      padding: 8px 12px;
      vertical-align: top;
      text-align: ${align};
      font-size: 14px;
    }
    .content th {
      background: #f1f5f9;
      font-weight: 700;
      font-size: 13px;
    }

    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      color: #94a3b8;
      font-size: 11px;
      text-align: center;
    }

    /* Print button */
    .pbtn {
      position: fixed;
      bottom: 2rem;
      ${isRtl ? "left" : "right"}: 2rem;
      background: ${brand};
      color: #fff;
      border: none;
      padding: 0.9rem 1.6rem;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      font-family: inherit;
      z-index: 999;
    }
    .pbtn:hover { transform: translateY(-2px); }

    @media print {
      body { background: white; }
      .page { margin: 0; min-height: auto; box-shadow: none; }
      .pbtn { display: none !important; }
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
