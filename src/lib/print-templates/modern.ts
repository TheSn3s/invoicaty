import { buildContext, escapeHtml, printButton } from "./shared";
import type { PrintableDoc, Profile, DocType } from "./types";

/**
 * MODERN template — clean, professional, two-column header.
 * Logo + business identity on the left, contact info on the right.
 * Uses the brand color as subtle accent (left rule + totals box + headings),
 * not as a full color bar.
 */
export function renderModern(doc: PrintableDoc, profile: Profile | null, type: DocType): string {
  const ctx = buildContext(doc, profile, type);
  const { totals, color, name, businessName, displayLine1, displayLine2, phone, email, logoUrl, notes,
          bankHolder, bankName, bankAccount, bankIban, isQuotation, docLabel } = ctx;
  const { fmt } = totals;

  const rowsHtml = totals.items.map((it, idx) => {
    const q = Number(it.quantity) || 0;
    const p = Number(it.unit_price) || 0;
    const lineTotal = q * p;
    return `<tr>
  <td class="c-num">${idx + 1}</td>
  <td class="c-desc">${escapeHtml(it.description)}</td>
  <td class="c-qty">${q}</td>
  <td class="c-price">${fmt(p)}</td>
  <td class="c-total">${fmt(lineTotal)}</td>
</tr>`;
  }).join('');

  const logoBlock = logoUrl
    ? `<img src="${logoUrl}" alt="${escapeHtml(displayLine1)}" class="logo" />`
    : '';

  const businessLine = displayLine2
    ? `<div class="biz-name">${escapeHtml(displayLine1)}</div>
       <div class="biz-person">${escapeHtml(displayLine2)}</div>`
    : `<div class="biz-name">${escapeHtml(displayLine1)}</div>`;

  const contactHtml = [
    phone ? `<div class="contact-line"><span class="contact-lbl">Phone</span><span>${escapeHtml(phone)}</span></div>` : '',
    email ? `<div class="contact-line"><span class="contact-lbl">Email</span><span>${escapeHtml(email)}</span></div>` : '',
  ].join('');

  let totalsHtml = `<div class="tot-row"><span>Subtotal</span><span>${fmt(totals.subtotal)}</span></div>`;
  if (totals.showDiscount) totalsHtml += `<div class="tot-row"><span>Discount</span><span>- ${fmt(totals.discount)}</span></div>`;
  if (totals.showTax) totalsHtml += `<div class="tot-row"><span>Tax (${totals.taxRate}%)</span><span>${fmt(totals.taxAmount)}</span></div>`;

  const notesHtml = notes
    ? `<div class="card notes-card"><div class="card-t">Notes</div><div class="card-b">${escapeHtml(notes)}</div></div>`
    : '';

  const validityHtml = isQuotation && doc.valid_until
    ? `<div class="meta-row"><span class="meta-lbl">Valid until</span><span class="meta-val">${escapeHtml(doc.valid_until)}</span></div>`
    : '';

  const hasBank = !isQuotation && (bankName || bankAccount || bankIban);
  const bankHtml = hasBank ? `<div class="card bank-card">
  <div class="card-t">Bank transfer</div>
  <div class="bank-grid">
    ${bankHolder ? `<div><span class="bank-lbl">Account Holder</span><span>${escapeHtml(bankHolder)}</span></div>` : ''}
    ${bankName ? `<div><span class="bank-lbl">Bank</span><span>${escapeHtml(bankName)}</span></div>` : ''}
    ${bankAccount ? `<div><span class="bank-lbl">Account No.</span><span class="mono">${escapeHtml(bankAccount)}</span></div>` : ''}
    ${bankIban ? `<div><span class="bank-lbl">IBAN</span><span class="mono">${escapeHtml(bankIban)}</span></div>` : ''}
  </div>
</div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${docLabel} #${escapeHtml(doc.serial)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root{--c:${color};--ink:#0f172a;--ink-2:#334155;--ink-3:#64748b;--line:#e2e8f0;--line-2:#f1f5f9;--bg:#f8fafc}
*{margin:0;padding:0;box-sizing:border-box}
html,body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:var(--ink);background:#eef2f7;line-height:1.5;-webkit-font-smoothing:antialiased}
body{padding:24px;display:flex;justify-content:center}
.doc{width:800px;background:#fff;box-shadow:0 20px 60px rgba(15,23,42,.08);border-radius:6px;overflow:hidden}
.doc-inner{padding:48px 56px 40px;position:relative}
.doc-inner::before{content:"";position:absolute;inset:0 auto 0 0;width:4px;background:var(--c);border-radius:0}

/* Header */
.hdr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:start;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--line)}
.brand-wrap{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;min-width:0}
.brand{display:flex;align-items:center;gap:18px;min-width:0;flex:1}
.logo{max-height:64px;max-width:200px;object-fit:contain;border-radius:4px;flex-shrink:0}
.logo-fallback{width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:800;font-family:inherit}
.biz-meta{min-width:0;padding-top:4px}
.biz-name{font-size:18px;font-weight:800;color:var(--ink);line-height:1.2}
.biz-person{font-size:12px;color:var(--ink-3);margin-top:2px;font-weight:500}
.invoice-side{text-align:right;min-width:140px}
.doc-type{font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--c);text-transform:uppercase;margin-bottom:2px}
.doc-serial{font-size:34px;font-weight:800;color:var(--ink);line-height:1}
.info-strip{display:grid;grid-template-columns:minmax(260px,.72fr) minmax(0,1.28fr);gap:18px;align-items:stretch;margin-bottom:18px}
.info-block{min-width:0;background:#fff;border:1px solid #edf1f6;border-radius:16px;padding:18px 22px;box-shadow:0 2px 10px rgba(15,23,42,.03)}
.info-lbl{font-size:10px;font-weight:700;letter-spacing:.18em;color:var(--ink-3);text-transform:uppercase;margin-bottom:10px}
.info-client{font-size:17px;font-weight:800;color:var(--ink);line-height:1.3;word-break:break-word}
.meta-inline{display:grid;grid-template-columns:106px minmax(0,1fr);gap:6px 22px;align-items:start}
.meta-lbl{color:var(--ink-2);font-weight:600;font-size:11px;line-height:1.2}
.meta-val{color:var(--ink);font-weight:700;font-size:12px;line-height:1.35;word-break:break-word}
.section-rule{height:1px;background:var(--line);margin-bottom:22px}

/* Scope + spacing */
.scope-card{margin-bottom:24px;background:#f8fafc;border-color:#eef2f7;border-radius:14px;padding:18px 22px}
.card{padding:16px 20px}
.card-b{line-height:1.65}

/* Items table */
table{width:100%;border-collapse:collapse;margin-bottom:20px}
thead th{text-align:left;font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--ink-3);text-transform:uppercase;padding:10px 8px;border-bottom:2px solid var(--c)}
thead th.c-qty,thead th.c-price,thead th.c-total{text-align:right}
thead th.c-num{width:32px;text-align:center}
tbody td{padding:9px 8px;font-size:12.5px;color:var(--ink);border-bottom:1px solid var(--line-2);vertical-align:top}
tbody tr:last-child td{border-bottom:none}
.c-num{text-align:center;color:var(--ink-3);font-variant-numeric:tabular-nums;font-weight:600}
.c-desc{font-weight:500;line-height:1.35}
.c-qty{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-2);width:64px}
.c-price{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-2);width:104px;white-space:nowrap}
.c-total{text-align:right;font-variant-numeric:tabular-nums;font-weight:700;color:var(--ink);width:120px;white-space:nowrap}

/* Totals */
.totals-wrap{display:flex;justify-content:flex-end;margin-bottom:24px}
.totals{min-width:280px;font-size:12px}
.tot-row{display:flex;justify-content:space-between;padding:4px 0;color:var(--ink-2);font-variant-numeric:tabular-nums}
.tot-row span:first-child{color:var(--ink-3)}
.tot-row span:last-child{font-weight:600;color:var(--ink)}
.grand{margin-top:8px;padding:14px 18px;background:var(--c);color:#fff;border-radius:6px;display:flex;justify-content:space-between;align-items:center}
.grand-lbl{font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;opacity:.85}
.grand-val{font-size:18px;font-weight:800;font-variant-numeric:tabular-nums}

/* Cards */
.card{background:var(--bg);border:1px solid var(--line-2);border-radius:8px;padding:16px 20px;margin-bottom:16px}
.card-t{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--ink-3);font-weight:700;margin-bottom:8px}
.card-b{font-size:12px;color:var(--ink-2);line-height:1.7;white-space:pre-wrap}
.bank-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px}
.bank-grid>div{display:flex;flex-direction:column;gap:2px}
.bank-lbl{font-size:10px;color:var(--ink-3);font-weight:600;letter-spacing:.05em}
.bank-grid span:not(.bank-lbl){font-size:12px;color:var(--ink);font-weight:600}
.mono{font-family:'SF Mono','Menlo','Consolas',monospace;letter-spacing:.02em}

/* Footer */
.ftr{border-top:1px solid var(--line-2);padding:18px 56px;background:#fafbfc;font-size:10.5px;color:var(--ink-3);display:flex;justify-content:space-between;align-items:center}
.ftr-contact{display:flex;gap:18px}
.ftr-contact span{display:flex;align-items:center;gap:5px}
.contact-line{display:flex;justify-content:space-between;gap:16px;font-size:11.5px;color:var(--ink-2)}
.contact-lbl{color:var(--ink-3);font-weight:600;font-size:10px;letter-spacing:.1em;text-transform:uppercase}

/* Print */
@media print{
  body{padding:0;background:#fff!important}
  .doc{width:100%;box-shadow:none;border-radius:0}
  .doc-inner{padding:30px 34px 24px}
  .doc-inner::before{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .hdr{display:block;margin-bottom:14px;padding-bottom:12px}
  .brand-wrap{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:16px}
  .brand{gap:12px}
  .logo{max-height:48px;max-width:150px}
  .biz-meta{padding-top:0}
  .biz-name{font-size:16px}
  .biz-person{font-size:11px}
  .invoice-side{min-width:110px;text-align:right;justify-self:end}
  .doc-type{font-size:10px;margin-bottom:1px}
  .doc-serial{font-size:28px}
  .info-strip{display:table;width:100%;table-layout:fixed;border-spacing:10px 0;margin:0 0 12px}
  .info-block{display:table-cell;vertical-align:top;padding:10px 12px;border-radius:10px}
  .info-block:first-child{width:40%}
  .info-block:last-child{width:60%}
  .info-lbl{margin-bottom:5px;font-size:8.5px}
  .info-client{font-size:14px;line-height:1.18}
  .meta-inline{grid-template-columns:64px minmax(0,1fr);gap:3px 10px}
  .meta-lbl{font-size:9.5px}
  .meta-val{font-size:10.5px;line-height:1.2}
  .section-rule{margin-bottom:14px}
  .scope-card{margin-bottom:14px;padding:12px 14px;border-radius:12px}
  .card-t{margin-bottom:6px;font-size:9px}
  .card-b{font-size:11px;line-height:1.45}
  table{margin-bottom:14px}
  thead th{padding:8px 6px;font-size:9px}
  tbody td{padding:7px 6px;font-size:11.5px}
  .c-desc{line-height:1.25}
  .c-qty{width:52px}
  .c-price{width:88px}
  .c-total{width:100px}
  .totals-wrap{margin-bottom:14px}
  .totals{min-width:240px;font-size:11px}
  .tot-row{padding:3px 0}
  .grand{margin-top:6px;padding:10px 12px;border-radius:5px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .grand-lbl{font-size:10px}
  .grand-val{font-size:15px}
  .card{margin-bottom:8px;padding:10px 12px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .notes-card,.bank-card{break-inside:avoid;page-break-inside:avoid}
  .bank-card{padding:10px 12px}
  .bank-grid{display:grid !important;grid-template-columns:1fr 1fr !important;gap:6px 14px !important}
  .bank-grid>div{display:flex;flex-direction:column;gap:2px;min-width:0}
  .bank-lbl{font-size:8.5px}
  .bank-grid span:not(.bank-lbl){font-size:10.5px}
  .ftr{padding:12px 34px;font-size:9.5px}
  @page{size:A4;margin:8mm}
}
@media (max-width:900px){
  body{padding:8px}
  .doc{width:100%}
  .doc-inner{padding:28px 20px}
  .hdr{grid-template-columns:1fr;gap:16px}
  .brand-wrap{flex-direction:column;gap:14px}
  .invoice-side{text-align:left;min-width:0}
  .info-strip{grid-template-columns:1fr;gap:12px}
  .meta-inline{grid-template-columns:1fr;gap:8px}
  .doc-serial{font-size:28px}
  .bank-grid{grid-template-columns:1fr}
  .ftr{padding:14px 20px;flex-direction:column;gap:8px;align-items:flex-start}
}
</style>
</head>
<body>
<div class="doc">
  <div class="doc-inner">
    <header class="hdr">
      <div class="brand-wrap">
        <div class="brand">
          ${logoBlock}
          <div class="biz-meta">${businessLine}</div>
        </div>
        <div class="invoice-side">
          <div class="doc-type">${docLabel}</div>
          <div class="doc-serial">#${escapeHtml(doc.serial)}</div>
        </div>
      </div>
    </header>

    <section class="info-strip">
      <div class="info-block">
        <div class="info-lbl">Bill to</div>
        <div class="info-client">${escapeHtml(doc.client)}</div>
      </div>
      <div class="info-block">
        <div class="info-lbl">Details</div>
        <div class="meta-inline">
          <span class="meta-lbl">Date</span><span class="meta-val">${escapeHtml(doc.date)}</span>
          ${doc.project ? `<span class="meta-lbl">Project</span><span class="meta-val">${escapeHtml(doc.project)}</span>` : ''}
          ${isQuotation && doc.valid_until ? `<span class="meta-lbl">Valid until</span><span class="meta-val">${escapeHtml(doc.valid_until)}</span>` : ''}
        </div>
      </div>
    </section>

    <div class="section-rule"></div>

    ${doc.description ? `<div class="card scope-card"><div class="card-t">Scope of Work</div><div class="card-b">${escapeHtml(doc.description)}</div></div>` : ''}

    <table>
      <thead>
        <tr>
          <th class="c-num">#</th>
          <th class="c-desc">Description</th>
          <th class="c-qty">Qty</th>
          <th class="c-price">Unit price</th>
          <th class="c-total">Amount</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>

    <div class="totals-wrap">
      <div class="totals">
        ${totalsHtml}
        <div class="grand">
          <span class="grand-lbl">Total due</span>
          <span class="grand-val">${fmt(totals.total)}</span>
        </div>
      </div>
    </div>

    ${notesHtml}
    ${bankHtml}
  </div>

  <footer class="ftr">
    <div class="ftr-contact">
      ${phone ? `<span>☎ ${escapeHtml(phone)}</span>` : ''}
      ${email ? `<span>✉ ${escapeHtml(email)}</span>` : ''}
    </div>
    <div>Thank you for your business.</div>
  </footer>
</div>
${printButton(color)}
${contactHtml ? '' /* contact already in footer */ : ''}
</body>
</html>`;
}
