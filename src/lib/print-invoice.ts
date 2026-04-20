interface Invoice {
  serial: string; date: string; client: string; project: string;
  description: string; amount: number; discount?: number; currency: string;
}

interface Profile {
  full_name: string; business_name: string; phone: string; email: string;
  bank_name: string; bank_account: string; bank_iban: string; bank_holder: string;
  brand_color: string;
}

export function printInvoice(inv: Invoice, profile: Profile | null) {
  const amt = Number(inv.amount) || 0;
  const disc = Number(inv.discount) || 0;
  const total = amt - disc;
  const amtFmt = `${inv.currency || 'KWD'} ${amt.toLocaleString()}`;
  const discFmt = `${inv.currency || 'KWD'} ${disc.toLocaleString()}`;
  const totalFmt = `${inv.currency || 'KWD'} ${total.toLocaleString()}`;
  const desc = inv.description || 'Professional services as agreed.';
  const name = profile?.full_name || profile?.business_name || 'Your Name';
  const color = profile?.brand_color || '#f04444';
  const phone = profile?.phone || '';
  const email = profile?.email || '';
  const bankHolder = profile?.bank_holder || name;
  const bankName = profile?.bank_name || '—';
  const bankAccount = profile?.bank_account || '—';
  const bankIban = profile?.bank_iban || '—';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice #${inv.serial}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Montserrat',sans-serif;background:#f9fafb;color:#000;display:flex;justify-content:center;padding:1rem}
.inv{width:800px;background:#fff;box-shadow:0 10px 40px rgba(0,0,0,.1);border:1px solid #e5e7eb}
.hdr{background:${color};color:#fff;padding:1.25rem;text-align:center}
.hdr h1{font-size:1.6rem;font-weight:900;margin-bottom:.1rem}
.hdr p{font-size:.65rem;font-weight:700;opacity:.9}
.cnt{padding:1.5rem 2.5rem}
.bar{display:flex;justify-content:space-between;border-bottom:2px solid ${color};padding-bottom:.25rem;margin-bottom:1.25rem;font-weight:700;font-size:.7rem;text-transform:uppercase;color:#1e293b}
.ttl{color:${color};font-size:1.1rem;font-weight:900;margin-bottom:.4rem}
.cli{font-weight:700;font-size:.875rem;color:#1e293b;margin-bottom:1.25rem}
table{width:100%;border-collapse:collapse;margin-bottom:1.25rem;text-align:left}
thead tr{border-bottom:2px solid ${color}}
th{font-size:.6rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:#334155;padding:.35rem 0}
th:last-child{text-align:right}
td{padding:.75rem 0;font-size:.75rem;vertical-align:top;color:#334155}
td:first-child,td:nth-child(2){text-align:center;width:3rem}
td:last-child{text-align:right;font-weight:900;font-size:.875rem;white-space:nowrap;color:#1e293b}
.pn{font-weight:700;font-size:.875rem;color:#1e293b;margin-bottom:.15rem}
.pd{font-size:.625rem;line-height:1.5;color:#334155}
tbody tr{border-bottom:1px solid #f1f5f9}
.tots{display:flex;justify-content:flex-end;margin-bottom:1.25rem}
.totb{width:12rem;font-size:.7rem;font-weight:700}
.totr{display:flex;justify-content:space-between;color:#334155;margin-bottom:.35rem}
.tott{display:flex;justify-content:space-between;border-top:2px solid #000;padding-top:.35rem;font-size:.875rem;font-weight:900;color:#1e293b}
.bank{font-size:.625rem;color:#1e293b;background:#f8fafc;padding:.6rem .8rem;border-radius:.375rem;border:1px solid #f1f5f9;display:inline-block;margin-bottom:1rem;line-height:1.7}
.bank b{font-weight:900;color:#334155}
.bank .bt{font-weight:900;font-size:.65rem;color:#0f172a;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.3rem}
.reg{font-size:.75rem;margin-bottom:.75rem}
.reg p:first-child{color:#334155;font-weight:700;margin-bottom:.15rem}
.reg .nm{font-weight:900;font-size:.875rem;color:#1e293b}
.ftr{padding:.75rem 2.5rem;display:flex;justify-content:space-between;color:${color};font-weight:900;font-size:.55rem;text-transform:uppercase;letter-spacing:.15em;border-top:1px solid #e5e7eb}
.pbtn{position:fixed;bottom:2rem;right:2rem;background:${color};color:#fff;border:none;padding:1rem 2rem;border-radius:50px;font-weight:900;font-size:.875rem;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.2);display:flex;align-items:center;gap:.75rem;font-family:'Montserrat',sans-serif;transition:transform .2s}
.pbtn:hover{transform:scale(1.05)}
@media print{
@page{size:A4;margin:8mm}
body{padding:0;background:#fff!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
.inv{box-shadow:none;border:none;width:100%}
.hdr{background:${color}!important;color:#fff!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.pbtn{display:none}
.bar{border-bottom-color:${color}!important}
thead tr{border-bottom-color:${color}!important}
.ttl{color:${color}!important}
.ftr{color:${color}!important}
.bank{background:#f8fafc!important;-webkit-print-color-adjust:exact!important}
.tott{border-top:2px solid #000!important}
}
@media(max-width:900px){
body{padding:.5rem}
.inv{width:100%}
.cnt{padding:1rem 1.5rem}
.ftr{padding:.75rem 1.5rem;flex-wrap:wrap;gap:.5rem;justify-content:center}
}
</style>
</head>
<body>
<div class="inv">
<div class="hdr"><h1>${name}</h1><p>${profile?.business_name || ''}</p></div>
<div class="cnt">
<div class="bar"><div>${inv.date}</div><div>Invoice #${inv.serial}</div><div>${inv.client}</div></div>
<div class="ttl">Invoice #${inv.serial}</div>
<div class="cli">${inv.client}</div>
<table><thead><tr><th>ID</th><th>QTY</th><th>DESCRIPTION</th><th>COST</th></tr></thead>
<tbody><tr><td>1</td><td>1</td><td style="padding-right:2rem"><div class="pn">${inv.project}</div><div class="pd">${desc}</div></td><td>${amtFmt}</td></tr></tbody></table>
<div class="tots"><div class="totb">
<div class="totr"><span>Subtotal</span><span>${amtFmt}</span></div>
<div class="totr"><span>Discount</span><span>${discFmt}</span></div>
<div class="tott"><span>Total</span><span>${totalFmt}</span></div>
</div></div>
<div class="bank"><div class="bt">Banking Details:</div>
<div><b>Account Holder:</b> ${bankHolder}</div>
<div><b>Bank Name:</b> ${bankName}</div>
<div><b>Account Number:</b> ${bankAccount}</div>
<div><b>IBAN:</b> ${bankIban}</div>
</div>
<div class="reg"><p>Regards,</p><p class="nm">${name}</p></div>
</div>
<div class="ftr">
${phone ? `<div>${phone}</div>` : ''}
${email ? `<div>${email}</div>` : ''}
</div>
</div>
<button class="pbtn" onclick="window.print()">🖨️ SAVE AS PDF</button>
</body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}
