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
  const logo = profile?.logo_url ? `<img src="${escapeHtml(profile.logo_url)}" alt="Logo" style="max-height:56px;max-width:140px;object-fit:contain;display:block" />` : "";
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
    /* ═══════════════════════════════════════════════════════════
       PRINT-FIRST LAYOUT — identical on screen and in PDF
       ═══════════════════════════════════════════════════════════ */
    @page {
      size: A4;
      margin: 12mm 10mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      font-family: ${fontFamily};
      color: #0f172a;
      direction: ${dir};
      text-align: ${align};
      line-height: 1.55;
      font-size: 14px;
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
      padding: 16mm 14mm;
      box-shadow: 0 8px 40px rgba(15,23,42,0.07);
    }

    /* ─── Header ─── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      border-bottom: 3px solid ${brand};
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .header-start { flex: 1; min-width: 0; text-align: ${align}; }
    .header-end { text-align: ${alignOpp}; flex-shrink: 0; }
    .doc-title {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 5px;
      color: #0f172a;
      line-height: 1.1;
    }
    .client-name { font-weight: 700; font-size: 15px; margin-bottom: 2px; color: #1e293b; }
    .project-name { color: #64748b; font-size: 12px; }
    .biz-name { font-weight: 700; margin-top: 6px; font-size: 13px; color: #0f172a; }
    .meta-line { color: #64748b; font-size: 11px; margin-top: 2px; }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      background: ${brand}15;
      color: ${brand};
      font-size: 10px;
      font-weight: 700;
      margin-top: 6px;
      border: 1px solid ${brand}30;
    }

    /* ─── Summary ─── */
    .summary {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 18px;
      font-size: 13px;
      color: #334155;
      line-height: 1.5;
    }

    /* ─── Content ─── */
    .content {
      font-size: 14px;
      line-height: 1.65;
      color: #1e293b;
    }
    .content p { margin-bottom: 10px; }
    .content h1 { font-size: 22px; font-weight: 800; margin: 18px 0 8px; color: #0f172a; }
    .content h2 { font-size: 18px; font-weight: 700; margin: 14px 0 6px; color: #0f172a; }
    .content h3 { font-size: 15px; font-weight: 700; margin: 12px 0 4px; color: #1e293b; }
    .content h4 { font-size: 14px; font-weight: 700; margin: 10px 0 4px; color: #334155; }
    .content ul, .content ol { margin: 8px 0; padding-${isRtl ? "right" : "left"}: 22px; }
    .content li { margin-bottom: 4px; }
    .content blockquote {
      border-${isRtl ? "right" : "left"}: 3px solid ${brand};
      padding: 8px 14px;
      margin: 10px 0;
      background: #f8fafc;
      color: #475569;
      font-style: italic;
    }
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 13px;
    }
    .content table th,
    .content table td {
      border: 1px solid #e2e8f0;
      padding: 7px 10px;
      text-align: ${align};
    }
    .content table th {
      background: #f1f5f9;
      font-weight: 700;
      color: #0f172a;
    }
    .content strong, .content b { font-weight: 700; }
    .content em, .content i { font-style: italic; }
    .content u { text-decoration: underline; }
    .content s { text-decoration: line-through; color: #94a3b8; }
    .content mark { background: #fef08a; padding: 1px 3px; border-radius: 2px; }

    /* ─── Footer ─── */
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }

    /* ─── Print button (screen only) ─── */
    .pbtn {
      position: fixed;
      bottom: 24px;
      ${isRtl ? "left" : "right"}: 24px;
      background: ${brand};
      color: white;
      border: none;
      padding: 12px 22px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 9999;
    }
    .pbtn:hover { opacity: 0.9; transform: translateY(-1px); }

    /* ═══════════════════════════════════════════════════════════
       PRINT OVERRIDES — minimal, because layout is already A4
       ═══════════════════════════════════════════════════════════ */
    @media print {
      html, body {
        background: white !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      body { display: block; }
      .page {
        width: 100% !important;
        min-height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
      }
      .pbtn { display: none !important; }
      .header { break-inside: avoid; }
      .content table { break-inside: avoid; }
      .content blockquote { break-inside: avoid; }
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
  <button class="pbtn" onclick="window.print()">\u{1F5A8}\uFE0F ${isRtl ? "حفظ كـ PDF" : "Save as PDF"}</button>
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
