import { buildContext, escapeHtml, printButton } from "./shared";
import type { PrintableDoc, Profile, DocType } from "./types";

/**
 * MINIMAL template — ultra-clean, black/grey only, brand color as a pixel-thin accent.
 * Logo small in the corner, everything else breathes on white space.
 * Ideal for designers, developers, and modern startups.
 */
export function renderMinimal(doc: PrintableDoc, profile: Profile | null, type: DocType): string {
  const ctx = buildContext(doc, profile, type);
  const { totals, color, name, businessName, displayLine1, displayLine2, phone, email, logoUrl, notes,
          bankHolder, bankName, bankAccount, bankIban, isQuotation, docLabel } = ctx;
  const { fmt } = totals;

  const rowsHtml = totals.items.map((it) => {
    const q = Number(it.quantity) || 0;
    const p = Number(it.unit_price) || 0;
    const lineTotal = q * p;
    return `<tr>
  <td class="c-desc">${escapeHtml(it.description)}</td>
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
    ? `<section class="section"><div class="section-t">Notes</div><div class="notes-b">${escapeHtml(notes)}</div></section>`
    : '';

  const validityHtml = isQuotation && doc.valid_until
    ? `<div class="kv"><span>Valid until</span><span>${escapeHtml(doc.valid_until)}</span></div>`
    : '';

  const hasBank = !isQuotation && (bankName || bankAccount || bankIban);
  const bankHtml = hasBank ? `<section class="section">
  <div class="section-t">Bank transfer</div>
  <div class="bank-grid">
    ${bankHolder ? `<div><span>Account Holder</span><span>${escapeHtml(bankHolder)}</span></div>` : ''}
    ${bankName ? `<div><span>Bank</span><span>${escapeHtml(bankName)}</span></div>` : ''}
    ${bankAccount ? `<div><span>Account No.</span><span class="mono">${escapeHtml(bankAccount)}</span></div>` : ''}
    ${bankIban ? `<div><span>IBAN</span><span class="mono">${escapeHtml(bankIban)}</span></div>` : ''}
  </div>
</section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${docLabel} #${escapeHtml(doc.serial)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--c:${color};--ink:#0a0a0a;--ink-2:#525252;--ink-3:#a3a3a3;--line:#e5e5e5;--line-2:#f5f5f5}
*{margin:0;padding:0;box-sizing:border-box}
html,body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:var(--ink);background:#f5f5f4;line-height:1.55;-webkit-font-smoothing:antialiased;letter-spacing:-.005em}
body{padding:24px;display:flex;justify-content:center}
.doc{width:800px;background:#fff;box-shadow:0 12px 40px rgba(0,0,0,.06)}
.doc-inner{padding:56px 64px 48px}

/* Top row — logo tiny left, doc info tiny right */
.top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:80px}
.brand{display:flex;align-items:center;gap:10px}
.logo{max-height:36px;max-width:140px;object-fit:contain}
.biz-name{font-size:13px;font-weight:600;color:var(--ink);letter-spacing:-.01em}
.doc-meta{text-align:right;font-size:11px;color:var(--ink-3);text-transform:uppercase;letter-spacing:.12em}
.doc-meta-label{margin-bottom:2px}
.doc-meta-value{color:var(--ink);font-weight:600;font-size:13px;letter-spacing:-.01em;text-transform:none}

/* Hero — big title */
.hero{margin-bottom:48px}
.hero-type{font-size:13px;color:var(--ink-3);letter-spacing:.15em;text-transform:uppercase;margin-bottom:8px;font-weight:500}
.hero-serial{font-size:56px;font-weight:800;letter-spacing:-.03em;line-height:1;color:var(--ink);position:relative;display:inline-block}
.hero-serial::after{content:"";position:absolute;bottom:4px;left:0;right:0;height:2px;background:var(--c);opacity:.5}

/* From / To grid */
.addr-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-bottom:48px;padding-bottom:32px;border-bottom:1px solid var(--line)}
.addr-block{font-size:13px;line-height:1.7}
.addr-lbl{font-size:10px;color:var(--ink-3);letter-spacing:.15em;text-transform:uppercase;font-weight:600;margin-bottom:10px}
.addr-primary{font-size:15px;font-weight:600;color:var(--ink);margin-bottom:4px;letter-spacing:-.01em}
.addr-secondary{color:var(--ink-2);font-size:12.5px}
.kv{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--ink-2);padding:2px 0}
.kv span:first-child{color:var(--ink-3)}

/* Items table */
table{width:100%;border-collapse:collapse;margin-bottom:32px}
thead th{text-align:left;font-size:10px;color:var(--ink-3);letter-spacing:.15em;text-transform:uppercase;font-weight:600;padding:12px 8px;border-bottom:1px solid var(--ink)}
thead th.c-qty,thead th.c-price,thead th.c-total{text-align:right}
tbody td{padding:16px 8px;font-size:13px;color:var(--ink);border-bottom:1px solid var(--line-2);vertical-align:top}
tbody tr:last-child td{border-bottom:none}
.c-desc{line-height:1.5;font-weight:500}
.c-qty{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-2);width:70px}
.c-price{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-2);width:120px;white-space:nowrap}
.c-total{text-align:right;font-variant-numeric:tabular-nums;font-weight:600;width:130px;white-space:nowrap}

/* Totals */
.totals-wrap{display:flex;justify-content:flex-end;margin-bottom:64px}
.totals{min-width:300px;font-size:13px}
.tot-row{display:flex;justify-content:space-between;padding:6px 0;color:var(--ink-2);font-variant-numeric:tabular-nums}
.tot-row span:first-child{color:var(--ink-3)}
.tot-row span:last-child{font-weight:500;color:var(--ink)}
.grand{margin-top:10px;padding-top:14px;border-top:1px solid var(--ink);display:flex;justify-content:space-between;align-items:baseline}
.grand-lbl{font-size:13px;letter-spacing:-.01em;color:var(--ink);font-weight:600}
.grand-val{font-size:24px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.02em}

/* Sections (notes, bank) */
.section{margin-bottom:28px;padding-top:20px;border-top:1px solid var(--line-2)}
.section-t{font-size:10px;color:var(--ink-3);letter-spacing:.15em;text-transform:uppercase;font-weight:600;margin-bottom:12px}
.notes-b{font-size:13px;color:var(--ink-2);line-height:1.7;white-space:pre-wrap}
.bank-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 32px;font-size:12.5px}
.bank-grid>div{display:flex;flex-direction:column;gap:2px}
.bank-grid span:first-child{font-size:10px;color:var(--ink-3);letter-spacing:.1em;text-transform:uppercase;font-weight:600}
.bank-grid span:last-child{color:var(--ink);font-weight:500}
.mono{font-family:'SF Mono','Menlo','Consolas',monospace;font-size:12px;letter-spacing:.01em}

/* Footer — just a thin line, tiny text */
.ftr{padding:24px 64px;border-top:1px solid var(--line-2);font-size:11px;color:var(--ink-3);display:flex;justify-content:space-between;letter-spacing:.02em}
.ftr-contact{display:flex;gap:20px}

@media print{
  body{padding:0;background:#fff!important}
  .doc{width:100%;box-shadow:none}
  .hero-serial::after{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  @page{size:A4;margin:12mm}
}
@media (max-width:900px){
  body{padding:8px}
  .doc{width:100%}
  .doc-inner{padding:32px 24px}
  .top{margin-bottom:48px}
  .hero{margin-bottom:32px}
  .hero-serial{font-size:40px}
  .addr-grid{grid-template-columns:1fr;gap:24px;padding-bottom:24px;margin-bottom:32px}
  .bank-grid{grid-template-columns:1fr;gap:12px}
  .totals-wrap{margin-bottom:40px}
  .ftr{padding:18px 24px;flex-direction:column;gap:8px;align-items:flex-start}
}
</style>
</head>
<body>
<div class="doc">
  <div class="doc-inner">
    <div class="top">
      <div class="brand">
        ${logoBlock}
        <div class="biz-name">${escapeHtml(displayLine1)}</div>
      </div>
      <div class="doc-meta">
        <div class="doc-meta-label">${docLabel}</div>
        <div class="doc-meta-value">${escapeHtml(doc.date)}</div>
      </div>
    </div>

    <div class="hero">
      <div class="hero-type">${docLabel}</div>
      <div class="hero-serial">#${escapeHtml(doc.serial)}</div>
    </div>

    <section class="addr-grid">
      <div class="addr-block">
        <div class="addr-lbl">From</div>
        <div class="addr-primary">${escapeHtml(displayLine1)}</div>
        ${displayLine2 ? `<div class="addr-secondary">${escapeHtml(displayLine2)}</div>` : ''}
        ${phone ? `<div class="addr-secondary">${escapeHtml(phone)}</div>` : ''}
        ${email ? `<div class="addr-secondary">${escapeHtml(email)}</div>` : ''}
      </div>
      <div class="addr-block">
        <div class="addr-lbl">Billed to</div>
        <div class="addr-primary">${escapeHtml(doc.client)}</div>
        ${doc.project ? `<div class="addr-secondary">${escapeHtml(doc.project)}</div>` : ''}
        ${validityHtml}
      </div>
    </section>

    <table>
      <thead>
        <tr>
          <th class="c-desc">Description</th>
          <th class="c-qty">Qty</th>
          <th class="c-price">Price</th>
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
  </div>

  <footer class="ftr">
    <div class="ftr-contact">
      ${phone ? `<span>${escapeHtml(phone)}</span>` : ''}
      ${email ? `<span>${escapeHtml(email)}</span>` : ''}
    </div>
    <div>Thank you.</div>
  </footer>
</div>
${printButton(color)}
</body>
</html>`;
}
