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
    ? ' dir="rtl" style="direction:rtl;text-align:right;"'
    : ' dir="ltr" style="direction:ltr;text-align:left;"';
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
    ${bankAccount ? `<tr><td class="bank-lbl">Account No.</td><td class="mono">${escapeHtml(bankAccount)}</td></tr>` : ''}
    ${bankIban ? `<tr><td class="bank-lbl">IBAN</td><td class="mono">${escapeHtml(bankIban)}</td></tr>` : ''}
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
.doc-inner{padding:56px 64px 48px}

/* Header — centered, classic */
.hdr{text-align:center;margin-bottom:44px;position:relative}
.hdr-rule{height:1px;background:linear-gradient(90deg,transparent 0%,var(--line) 20%,var(--line) 80%,transparent 100%);margin:0 0 24px}
.logo{max-height:72px;max-width:240px;object-fit:contain;margin-bottom:18px;filter:grayscale(0)}
.biz-name{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;letter-spacing:.02em;color:var(--ink);line-height:1.1;margin-bottom:4px}
.biz-person{font-size:15px;color:var(--ink-3);font-style:italic;letter-spacing:.04em}
.hdr-bottom-rule{height:1px;background:linear-gradient(90deg,transparent 0%,var(--line) 20%,var(--line) 80%,transparent 100%);margin:24px 0 0}

/* Document title */
.doc-title{text-align:center;margin:40px 0 32px}
.doc-type{font-family:'Playfair Display',serif;font-size:38px;font-weight:400;letter-spacing:.3em;text-transform:uppercase;color:var(--ink);margin-bottom:6px}
.doc-serial{font-size:16px;color:var(--c);font-weight:600;letter-spacing:.15em}
.doc-accent{width:60px;height:2px;background:var(--c);margin:16px auto 0}

/* Meta */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:36px}
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
.card{border:1px solid var(--line-2);padding:20px 24px;margin-bottom:18px;background:var(--bg)}
.card-t{font-family:'Playfair Display',serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-3);font-weight:700;margin-bottom:10px}
.card-b{font-size:14px;color:var(--ink-2);line-height:1.8;white-space:pre-wrap;font-style:italic}
.bank-tbl{width:auto;margin:0}
.bank-tbl td{padding:4px 24px 4px 0;border:none;font-size:14px;color:var(--ink-2)}
.bank-lbl{color:var(--ink-3);font-style:italic;white-space:nowrap}
.mono{font-family:'SF Mono','Menlo','Consolas',monospace;font-size:13px;letter-spacing:.02em}

/* Signature / Regards */
.regards{margin-top:40px;text-align:right;font-size:14px;color:var(--ink-2)}
.regards-line{font-style:italic;color:var(--ink-3);margin-bottom:4px}
.regards-name{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--ink)}

/* Footer */
.ftr{padding:20px 64px;border-top:1px solid var(--line-2);background:#fbf9f2;font-size:12px;color:var(--ink-3);display:flex;justify-content:space-between;font-style:italic}
.ftr-contact{display:flex;gap:20px}

@media print{
  body{padding:0;background:#fff!important}
  .doc{width:100%;box-shadow:none;border:none;background:#fff!important}
  .grand,.doc-accent{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  @page{size:A4;margin:14mm}
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

    ${doc.description ? `<div style="margin-bottom:20px;padding:14px 18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;"><div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin-bottom:6px;">Scope of Work</div><div dir="${isRtlText(doc.description) ? 'rtl' : 'ltr'}" style="direction:${isRtlText(doc.description) ? 'rtl' : 'ltr'};text-align:${isRtlText(doc.description) ? 'right' : 'left'};font-size:12px;color:#475569;line-height:1.7;white-space:pre-wrap;">${escapeHtml(doc.description)}</div></div>` : ''}

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
