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
    ? `<div class="card"><div class="card-t">Notes</div><div class="card-b">${escapeHtml(notes)}</div></div>`
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
.hdr{display:grid;grid-template-columns:1fr auto;gap:32px;align-items:flex-start;margin-bottom:36px}
.brand{display:flex;align-items:center;gap:16px}
.logo{max-height:64px;max-width:200px;object-fit:contain;border-radius:4px}
.logo-fallback{width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:800;font-family:inherit}
.biz-name{font-size:18px;font-weight:800;color:var(--ink);line-height:1.2}
.biz-person{font-size:12px;color:var(--ink-3);margin-top:2px;font-weight:500}

.doc-title{text-align:right}
.doc-type{font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--c);text-transform:uppercase;margin-bottom:6px}
.doc-serial{font-size:28px;font-weight:800;color:var(--ink);line-height:1}

/* Meta + Bill To grid */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid var(--line-2)}
.info-block{display:flex;flex-direction:column;gap:8px}
.info-lbl{font-size:10px;font-weight:700;letter-spacing:.15em;color:var(--ink-3);text-transform:uppercase}
.info-client{font-size:16px;font-weight:700;color:var(--ink)}
.meta-row{display:flex;justify-content:space-between;font-size:12px}
.meta-lbl{color:var(--ink-3);font-weight:500}
.meta-val{color:var(--ink);font-weight:600}

/* Items table */
table{width:100%;border-collapse:collapse;margin-bottom:28px}
thead th{text-align:left;font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--ink-3);text-transform:uppercase;padding:12px 8px;border-bottom:2px solid var(--c)}
thead th.c-qty,thead th.c-price,thead th.c-total{text-align:right}
thead th.c-num{width:32px;text-align:center}
tbody td{padding:14px 8px;font-size:13px;color:var(--ink);border-bottom:1px solid var(--line-2);vertical-align:top}
tbody tr:last-child td{border-bottom:none}
.c-num{text-align:center;color:var(--ink-3);font-variant-numeric:tabular-nums;font-weight:600}
.c-desc{font-weight:500;line-height:1.5}
.c-qty{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-2);width:70px}
.c-price{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-2);width:110px;white-space:nowrap}
.c-total{text-align:right;font-variant-numeric:tabular-nums;font-weight:700;color:var(--ink);width:130px;white-space:nowrap}

/* Totals */
.totals-wrap{display:flex;justify-content:flex-end;margin-bottom:32px}
.totals{min-width:280px;font-size:12px}
.tot-row{display:flex;justify-content:space-between;padding:6px 0;color:var(--ink-2);font-variant-numeric:tabular-nums}
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
  .doc-inner::before{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .grand{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .card{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  @page{size:A4;margin:12mm}
}
@media (max-width:900px){
  body{padding:8px}
  .doc{width:100%}
  .doc-inner{padding:28px 20px}
  .hdr{grid-template-columns:1fr;gap:16px}
  .doc-title{text-align:left}
  .info-grid{grid-template-columns:1fr;gap:16px}
  .bank-grid{grid-template-columns:1fr}
  .ftr{padding:14px 20px;flex-direction:column;gap:8px;align-items:flex-start}
}
</style>
</head>
<body>
<div class="doc">
  <div class="doc-inner">
    <header class="hdr">
      <div class="brand">
        ${logoBlock}
        <div>${businessLine}</div>
      </div>
      <div class="doc-title">
        <div class="doc-type">${docLabel}</div>
        <div class="doc-serial">#${escapeHtml(doc.serial)}</div>
      </div>
    </header>

    <section class="info-grid">
      <div class="info-block">
        <div class="info-lbl">Bill to</div>
        <div class="info-client">${escapeHtml(doc.client)}</div>
      </div>
      <div class="info-block">
        <div class="info-lbl">Details</div>
        <div class="meta-row"><span class="meta-lbl">Date</span><span class="meta-val">${escapeHtml(doc.date)}</span></div>
        ${validityHtml}
        ${doc.project ? `<div class="meta-row"><span class="meta-lbl">Project</span><span class="meta-val">${escapeHtml(doc.project)}</span></div>` : ''}
      </div>
    </section>

    ${doc.description ? `<div class="card" style="margin-bottom:24px;"><div class="card-t">Scope of Work</div><div class="card-b">${escapeHtml(doc.description)}</div></div>` : ''}

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
