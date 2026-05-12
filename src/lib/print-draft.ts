import sanitizeHtml from "sanitize-html";

export interface DraftProfile {
  full_name?: string;
  business_name?: string;
  company_name?: string;
  invoice_display?: "name" | "company" | "both";
  brand_color?: string;
  logo_url?: string;
  phone?: string;
  email?: string;
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

function getDisplayName(profile: DraftProfile): { line1: string; line2: string } {
  const display = profile.invoice_display || "name";
  const name = profile.full_name || "";
  const company = profile.company_name || profile.business_name || "";
  if (display === "company" && company) return { line1: company, line2: "" };
  if (display === "both" && company) return { line1: company, line2: name };
  return { line1: name || company, line2: "" };
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
  const color = profile?.brand_color || "#e74c3c";
  const { line1: displayLine1, line2: displayLine2 } = profile ? getDisplayName(profile) : { line1: "Invoicaty", line2: "" };
  const logoUrl = profile?.logo_url || "";
  const phone = profile?.phone || "";
  const email = profile?.email || "";
  const content = sanitizeDraftHtml(doc.content_html);

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

  const logoBlock = logoUrl
    ? `<img src="${logoUrl}" class="logo" alt="${escapeHtml(displayLine1)}" />`
    : "";

  const businessBlock = displayLine2
    ? `<div class="biz-name">${escapeHtml(displayLine1)}</div><div class="biz-person">${escapeHtml(displayLine2)}</div>`
    : `<div class="biz-name">${escapeHtml(displayLine1)}</div>`;

  const docLabel = "DRAFT";

  return `<!DOCTYPE html>
<html lang="${effectiveLang}" dir="${dir}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
${googleFont}
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<title>${escapeHtml(doc.title || "Draft")} — ${escapeHtml(doc.serial)}</title>
<style>
/* ═══════════════════════════════════════════════════════════
   MODERN DRAFT TEMPLATE — matches Invoice modern template
   ═══════════════════════════════════════════════════════════ */
@page { size: A4; margin: 0; }
:root {
  --c: ${color};
  --ink: #1e293b;
  --ink-2: #475569;
  --ink-3: #64748b;
  --line: #e2e8f0;
  --bg: #f8fafc;
  --radius: 10px;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  font-family: ${fontFamily};
  color: var(--ink);
  line-height: 1.5;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  background: #e8ecf0;
}
body { padding: 24px; display: flex; justify-content: center; }

/* Page container with left color rule */
.inv {
  width: 210mm;
  min-height: 297mm;
  background: white;
  position: relative;
  padding: 40px 44px 32px 44px;
  box-shadow: 0 25px 60px rgba(15,23,42,0.08);
  border-radius: 4px;
}
.inv::before {
  content: "";
  position: absolute;
  top: 0; bottom: 0;
  ${isRtl ? "right: 0" : "left: 0"};
  width: 5px;
  background: var(--c);
  border-radius: ${isRtl ? "0 4px 4px 0" : "4px 0 0 4px"};
}

/* ─── Header ─── */
.hdr {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}
.hdr-left { display: flex; align-items: center; gap: 14px; }
.logo { height: 52px; width: auto; max-width: 120px; object-fit: contain; border-radius: 6px; }
.biz-name { font-size: 20px; font-weight: 800; color: var(--ink); }
.biz-person { font-size: 13px; color: var(--ink-3); margin-top: 1px; }
.hdr-right { text-align: ${alignOpp}; }
.doc-type { font-size: 12px; font-weight: 700; color: var(--c); text-transform: uppercase; letter-spacing: 0.08em; }
.doc-serial { font-size: 32px; font-weight: 900; color: var(--ink); line-height: 1; margin-top: 2px; }

/* ─── Meta cards (Bill To / Details) ─── */
.meta-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 16px;
  margin-bottom: 24px;
}
.meta-card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 14px 18px;
}
.meta-card-t {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-3);
  margin-bottom: 6px;
}
.meta-card-v { font-size: 15px; font-weight: 700; color: var(--ink); }
.meta-card-sub { font-size: 12px; color: var(--ink-2); margin-top: 3px; }

/* ─── Content area ─── */
.content {
  font-size: 13px;
  line-height: 1.55;
  color: var(--ink);
}
.content p { margin-bottom: 6px; }
.content h1 { font-size: 18px; font-weight: 800; margin: 14px 0 6px; }
.content h2 { font-size: 15px; font-weight: 700; margin: 12px 0 4px; }
.content h3 { font-size: 13px; font-weight: 700; margin: 10px 0 3px; }
.content h4 { font-size: 12px; font-weight: 600; margin: 8px 0 3px; color: var(--ink-2); }
.content ul, .content ol { margin: 6px 0; padding-${isRtl ? "right" : "left"}: 18px; }
.content li { margin-bottom: 3px; }
.content blockquote {
  border-${isRtl ? "right" : "left"}: 3px solid var(--c);
  padding: 8px 12px;
  margin: 10px 0;
  background: var(--bg);
  color: var(--ink-2);
  font-style: italic;
  border-radius: 0 6px 6px 0;
}

/* ─── Tables ─── */
.content table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 12px;
}
.content table th {
  background: var(--c);
  color: white;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 8px 10px;
  text-align: ${align};
}
.content table td {
  padding: 5px 10px 2px 10px;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}
.content table tr:last-child td { border-bottom: 2px solid var(--c); }
.content table tbody tr:nth-child(even) td { background: #f8fafc; }

/* ─── Footer ─── */
.ftr {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--ink-3);
  position: absolute;
  bottom: 28px;
  left: 44px;
  right: 44px;
}
.ftr-contact { display: flex; gap: 16px; }

/* ─── Badge ─── */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: ${color}15;
  color: var(--c);
  font-size: 10px;
  font-weight: 700;
  border: 1px solid ${color}30;
}

/* ─── Print button ─── */
.pbtn {
  position: fixed;
  bottom: 24px;
  ${isRtl ? "left" : "right"}: 24px;
  background: var(--c);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 32px rgba(0,0,0,0.25);
  z-index: 9999;
  font-family: inherit;
}
.pbtn:hover { opacity: 0.9; transform: translateY(-1px); }

/* ─── Print overrides ─── */
@media print {
  html, body { background: white !important; }
  body { padding: 0; }
  .inv { margin: 0; padding: 28px 32px 24px 32px; min-height: auto; box-shadow: none; border-radius: 0; width: 100%; }
  .inv::before { border-radius: 0; }
  .pbtn { display: none !important; }
  .ftr { position: relative; bottom: auto; left: auto; right: auto; margin-top: 24px; }
}
</style>
</head>
<body>
<div class="inv">
  <!-- Header -->
  <div class="hdr">
    <div class="hdr-left">
      ${logoBlock}
      <div>
        ${businessBlock}
      </div>
    </div>
    <div class="hdr-right">
      <div class="doc-type">${docLabel}</div>
      <div class="doc-serial">#${escapeHtml(doc.serial)}</div>
    </div>
  </div>

  <!-- Meta cards -->
  <div class="meta-row">
    <div class="meta-card">
      <div class="meta-card-t">${isRtl ? "العميل" : "Bill to"}</div>
      <div class="meta-card-v">${escapeHtml(doc.client)}</div>
    </div>
    <div class="meta-card">
      <div class="meta-card-t">${isRtl ? "التفاصيل" : "Details"}</div>
      <div class="meta-card-sub">${isRtl ? "التاريخ" : "Date"}: <strong>${escapeHtml(doc.date)}</strong></div>
      <div class="meta-card-sub">${isRtl ? "المشروع" : "Project"}: <strong>${escapeHtml(doc.project)}</strong></div>
      ${doc.title ? `<div class="meta-card-sub">${isRtl ? "العنوان" : "Title"}: <strong>${escapeHtml(doc.title)}</strong></div>` : ""}
      <span class="badge">${escapeHtml(doc.status)}</span>
    </div>
  </div>

  ${doc.summary ? `<div style="background:var(--bg);border:1px solid var(--line);border-radius:var(--radius);padding:10px 14px;margin-bottom:16px;font-size:12px;color:var(--ink-2);">${escapeHtml(doc.summary)}</div>` : ""}

  <!-- Content -->
  <div class="content">${content}</div>

  <!-- Footer -->
  <div class="ftr">
    <div class="ftr-contact">
      ${phone ? `<span>☎ ${escapeHtml(phone)}</span>` : ""}
      ${email ? `<span>✉ ${escapeHtml(email)}</span>` : ""}
    </div>
    <div>Generated by Invoicaty</div>
  </div>
</div>

<button class="pbtn" onclick="window.print()">${isRtl ? "حفظ كـ PDF 🖨️" : "🖨️ Save as PDF"}</button>
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
