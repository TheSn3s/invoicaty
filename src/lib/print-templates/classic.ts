import { buildContext, escapeHtml, printButton } from "./shared";
import type { PrintableDoc, Profile, DocType } from "./types";

/**
 * CLASSIC template — centered, elegant, serif-style.
 * Logo and business name centered at the top, flanked by rule lines.
 * Monochrome ink with the brand color as a discreet accent on dividers and the total box.
 * Ideal for lawyers, consultants, and premium brands.
 */
export function renderClassic(doc: PrintableDoc, profile: Profile | null, type: DocType): string {
  const ctx = buildContext(doc, profile, type);
  const isRtlText = (value: string) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(value || '');
  const textAttrs = (value: string) => isRtlText(value)
    ? ' dir="rtl" style="direction:rtl;text-align:right;unicode-bidi:plaintext;"'
    : ' dir="ltr" style="direction:ltr;text-align:left;unicode-bidi:plaintext;"';
  const { totals, color, name, businessName, displayLine1, displayLine2, phone, email, logoUrl, notes,
          bankHolder, bankName, bankAccount, bankIban, isQuotation, docLabel } = ctx;
  const { fmt } = totals;

  const rowsHtml = totals.items.map((it) => {
    const descAttrs = textAttrs(it.description);
    const q = Number(it.quantity) || 0;
    const p = Number(it.unit_price) || 0;
    const lineTotal = q * p;
    return `<tr>
  <td class="c-desc"${descAttrs}>${escapeHtml(it.description)}</td>
  <td class="c-qty">${q}</td>
  <td class="c-price">${fmt(p)}</td>
  <td class="c-total">${fmt(lineTotal)}</td>
</tr>`;
  }).join('');

  const logoBlock = logoUrl
    ? `<img src="${logoUrl}" alt="${escapeHtml(displayLine1)}" class="logo" />`
    : '';

  let totalsHtml = `<div class="tot-row"><span>Subtotal</span><span>${fmt(totals.subtotal)}</span></div>`;
  if (totals.showDiscount) totalsHtml += `<div class="tot-row"><span>Discount</span><span>- ${fmt(totals.discount)}</span></div>`;
  if (totals.showTax) totalsHtml += `<div class="tot-row"><span>Tax (${totals.taxRate}%)</span><span>${fmt(totals.taxAmount)}</span></div>`;

  const notesHtml = notes
    ? `<div class="card"><div class="card-t">Notes</div><div class="card-b"${textAttrs(notes)}>${escapeHtml(notes)}</div></div>`
    : '';

  const validityHtml = isQuotation && doc.valid_until
    ? `<div class="meta-row"><span>Valid until</span><span>${escapeHtml(doc.valid_until)}</span></div>`
    : '';

  const hasBank = !isQuotation && (bankName || bankAccount || bankIban);
  const bankHtml = hasBank ? `<div class="card">
  <div class="card-t">Bank transfer</div>
  <table class="bank-tbl">
    ${bankHolder ? `<tr><td class="bank-lbl">Account Holder</td><td>${escapeHtml(bankHolder)}</td></tr>` : ''}
    ${bankName ? `<tr><td class="bank-lbl">Bank</td><td>${escapeHtml(bankName)}</td></tr>` : ''}
    ${bankAccount ? `<tr><td class="bank-lbl">Account No.</td><td>${escapeHtml(bankAccount)}</td></tr>` : ''}
    ${bankIban ? `<tr><td class="bank-lbl">IBAN</td><td>${escapeHtml(bankIban)}</td></tr>` : ''}
  </table>
</div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${docLabel} #${escapeHtml(doc.serial)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--c:${color};--ink:#111827;--ink-2:#374151;--ink-3:#6b7280;--line:#1f2937;--line-2:#e5e7eb;--bg:#fafaf7}
*{margin:0;padding:0;box-sizing:border-box}
html,body{font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;color:var(--ink);background:#ecebe4;line-height:1.55;-webkit-font-smoothing:antialiased}
body{padding:24px;display:flex;justify-content:center}
.doc{width:800px;background:#fffdf8;box-shadow:0 20px 60px rgba(17,24,39,.1);border:1px solid #e8e2d0}
.doc-inner{padding:36px 56px 32px}

/* Header — centered, classic */
.hdr{text-align:center;margin-bottom:24px;position:relative}
.hdr-rule{height:1px;background:linear-gradient(90deg,transparent 0%,var(--line) 20%,var(--line) 80%,transparent 100%);margin:0 0 14px}
.logo{max-height:58px;max-width:200px;object-fit:contain;margin-bottom:10px;filter:grayscale(0)}
.biz-name{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;letter-spacing:.02em;color:var(--ink);line-height:1.08;margin-bottom:2px}
.biz-person{font-size:13px;color:var(--ink-3);font-style:italic;letter-spacing:.03em}
.hdr-bottom-rule{height:1px;background:linear-gradient(90deg,transparent 0%,var(--line) 20%,var(--line) 80%,transparent 100%);margin:14px 0 0}

/* Document title */
.doc-title{text-align:center;margin:22px 0 20px}
.doc-type{font-family:'Playfair Display',serif;font-size:30px;font-weight:400;letter-spacing:.24em;text-transform:uppercase;color:var(--ink);margin-bottom:4px}
.doc-serial{font-size:13px;color:var(--c);font-weight:600;letter-spacing:.12em}
.doc-accent{width:52px;height:2px;background:var(--c);margin:12px auto 0}

/* Meta */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:24px}
.info-block{font-size:14px}
.info-lbl{font-family:'Playfair Display',serif;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:var(--ink-3);margin-bottom:8px;font-weight:700}
.info-client{font-size:18px;font-weight:600;color:var(--ink);font-family:'Playfair Display',serif}
.meta-row{display:flex;justify-content:space-between;font-size:14px;padding:3px 0;color:var(--ink-2)}
.meta-row span:first-child{color:var(--ink-3);font-style:italic}
.meta-row span:last-child{font-weight:600}

/* Items table */
table{width:100%;border-collapse:collapse;margin-bottom:20px}
thead th{text-align:left;font-family:'Playfair Display',serif;font-size:11px;font-weight:700;letter-spacing:.2em;color:var(--ink);text-transform:uppercase;padding:10px 8px;border-top:2px solid var(--line);border-bottom:1px solid var(--line)}
thead th.c-qty,thead th.c-price,thead th.c-total{text-align:right}
tbody td{padding:10px 8px;font-size:13.5px;color:var(--ink-2);border-bottom:1px solid var(--line-2);vertical-align:top}
.c-desc{font-weight:500;line-height:1.35}
.c-qty{text-align:right;font-variant-numeric:tabular-nums;width:64px}
.c-price{text-align:right;font-variant-numeric:tabular-nums;width:116px;white-space:nowrap}
.c-total{text-align:right;font-variant-numeric:tabular-nums;font-weight:700;color:var(--ink);width:126px;white-space:nowrap}

/* Totals */
.totals-wrap{display:flex;justify-content:flex-end;margin-bottom:28px}
.totals{min-width:320px;font-size:14px}
.tot-row{display:flex;justify-content:space-between;padding:4px 0;color:var(--ink-2);font-variant-numeric:tabular-nums}
.tot-row span:first-child{font-style:italic;color:var(--ink-3)}
.tot-row span:last-child{font-weight:600;color:var(--ink)}
.grand{margin-top:12px;padding:14px 0;border-top:2px solid var(--line);border-bottom:2px solid var(--line);display:flex;justify-content:space-between;align-items:baseline}
.grand-lbl{font-family:'Playfair Display',serif;font-size:14px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink);font-weight:700}
.grand-val{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--c)}

/* Cards */
.card{border:1px solid var(--line-2);padding:14px 18px;margin-bottom:12px;background:var(--bg)}
.card-t{font-family:'Playfair Display',serif;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-3);font-weight:700;margin-bottom:8px}
.card-b{font-size:12.5px;color:var(--ink-2);line-height:1.6;white-space:pre-wrap;font-style:italic;unicode-bidi:plaintext}
.bank-tbl{width:auto;margin:0}
.bank-tbl td{padding:3px 18px 3px 0;border:none;font-size:12.5px;color:var(--ink-2)}
.bank-lbl{color:var(--ink-3);font-style:italic;white-space:nowrap}

/* Signature / Regards */
.regards{margin-top:22px;text-align:right;font-size:12.5px;color:var(--ink-2)}
.regards-line{font-style:italic;color:var(--ink-3);margin-bottom:2px}
.regards-name{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--ink)}

/* Footer */
.ftr{padding:14px 56px;border-top:1px solid var(--line-2);background:#fbf9f2;font-size:11px;color:var(--ink-3);display:flex;justify-content:space-between;font-style:italic}
.ftr-contact{display:flex;gap:20px}

@media print{
  body{padding:0;background:#fff!important}
  .doc{width:100%;box-shadow:none;border:none;background:#fff!important}
  .doc-inner{padding:28px 42px 24px}
  .hdr{margin-bottom:18px}
  .hdr-rule{margin-bottom:10px}
  .logo{max-height:48px;margin-bottom:8px}
  .biz-name{font-size:22px}
  .biz-person{font-size:12px}
  .hdr-bottom-rule{margin-top:10px}
  .doc-title{margin:16px 0 16px}
  .doc-type{font-size:26px;letter-spacing:.18em}
  .doc-serial{font-size:12px}
  .doc-accent{margin-top:10px}
  .info-grid{gap:24px;margin-bottom:18px}
  .info-lbl{margin-bottom:6px;font-size:10px}
  .info-client{font-size:16px}
  .meta-row{font-size:12.5px;padding:2px 0}
  table{margin-bottom:14px}
  thead th{padding:8px 6px;font-size:10px}
  tbody td{padding:8px 6px;font-size:12px}
  .c-desc{line-height:1.3}
  .c-qty{width:56px}
  .c-price{width:96px}
  .c-total{width:108px}
  .totals-wrap{margin-bottom:18px}
  .totals{min-width:260px;font-size:12px}
  .tot-row{padding:3px 0}
  .grand{margin-top:8px;padding:10px 0}
  .grand-lbl{font-size:12px}
  .grand-val{font-size:20px}
  .card{padding:12px 14px;margin-bottom:10px}
  .card-t{font-size:9px;margin-bottom:6px}
  .card-b{font-size:11.5px;line-height:1.45}
  .bank-tbl td{padding:2px 14px 2px 0;font-size:11.5px}
  .mono{font-size:11px}
  .regards{margin-top:14px;font-size:11.5px}
  .regards-name{font-size:14px}
  .ftr{padding:10px 42px;font-size:10px}
  .grand,.doc-accent{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  @page{size:A4;margin:8mm}
}
@media (max-width:900px){
  body{padding:8px}
  .doc{width:100%}
  .doc-inner{padding:32px 24px}
  .info-grid{grid-template-columns:1fr;gap:20px}
  .doc-type{font-size:28px;letter-spacing:.22em}
  .ftr{padding:14px 24px;flex-direction:column;gap:6px;align-items:flex-start}
}
</style>
</head>
<body>
<div class="doc">
  <div class="doc-inner">
    <header class="hdr">
      <div class="hdr-rule"></div>
      ${logoBlock}
      <div class="biz-name">${escapeHtml(displayLine1)}</div>
      ${displayLine2 ? `<div class="biz-person">${escapeHtml(displayLine2)}</div>` : ''}
      <div class="hdr-bottom-rule"></div>
    </header>

    <div class="doc-title">
      <div class="doc-type">${docLabel}</div>
      <div class="doc-serial">№ ${escapeHtml(doc.serial)}</div>
      <div class="doc-accent"></div>
    </div>

    <section class="info-grid">
      <div class="info-block">
        <div class="info-lbl">Billed to</div>
        <div class="info-client">${escapeHtml(doc.client)}</div>
      </div>
      <div class="info-block">
        <div class="info-lbl">Particulars</div>
        <div class="meta-row"><span>Date issued</span><span>${escapeHtml(doc.date)}</span></div>
        ${validityHtml}
        ${doc.project ? `<div class="meta-row"><span>Project</span><span>${escapeHtml(doc.project)}</span></div>` : ''}
      </div>
    </section>

    ${doc.description ? `<div style="margin-bottom:20px;padding:14px 18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;"><div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin-bottom:6px;">Scope of Work</div><div dir="${isRtlText(doc.description) ? 'rtl' : 'ltr'}" style="direction:${isRtlText(doc.description) ? 'rtl' : 'ltr'};text-align:${isRtlText(doc.description) ? 'right' : 'left'};unicode-bidi:plaintext;font-size:12px;color:#475569;line-height:1.7;white-space:pre-wrap;">${escapeHtml(doc.description)}</div></div>` : ''}

    <table>
      <thead>
        <tr>
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
          <span class="grand-lbl">Total</span>
          <span class="grand-val">${fmt(totals.total)}</span>
        </div>
      </div>
    </div>

    ${notesHtml}
    ${bankHtml}

    <div class="regards">
      <div class="regards-line">With sincere regards,</div>
      <div class="regards-name">${escapeHtml(displayLine1)}</div>
    </div>
  </div>

  <footer class="ftr">
    <div class="ftr-contact">
      ${phone ? `<span>${escapeHtml(phone)}</span>` : ''}
      ${email ? `<span>${escapeHtml(email)}</span>` : ''}
    </div>
    <div>Thank you for your trust.</div>
  </footer>
</div>
${printButton(color)}
</body>
</html>`;
}
