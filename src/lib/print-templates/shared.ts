import type { LineItem, PrintableDoc, Profile, DocType } from "./types";

export function escapeHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Returns { line1, line2 } for the sender block based on invoice_display setting */
export function getDisplayName(profile: Profile): { line1: string; line2: string } {
  const display = profile.invoice_display || 'name';
  const name = profile.full_name || '';
  const company = profile.company_name || '';

  if (display === 'company' && company) {
    return { line1: company, line2: '' };
  }
  if (display === 'both' && company) {
    return { line1: company, line2: name };
  }
  // 'name' or fallback
  return { line1: name, line2: '' };
}

export interface ComputedTotals {
  items: LineItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  showDiscount: boolean;
  showTax: boolean;
  fmt: (n: number) => string;
}

export function computeTotals(doc: PrintableDoc): ComputedTotals {
  const rawItems: LineItem[] = Array.isArray(doc.items) && doc.items.length > 0
    ? doc.items
    : [{
        description: doc.project + (doc.description ? ` — ${doc.description}` : ''),
        quantity: 1,
        unit_price: Number(doc.amount) || 0,
      }];

  const itemsSubtotal = rawItems.reduce(
    (s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
    0,
  );
  const subtotal = itemsSubtotal > 0 ? itemsSubtotal : Number(doc.amount) || 0;
  const discount = Number(doc.discount) || 0;
  const taxRate = Number(doc.tax_rate) || 0;
  const taxableBase = Math.max(subtotal - discount, 0);
  const taxAmount = Number(doc.tax_amount) || +(taxableBase * (taxRate / 100)).toFixed(3);
  const total = Number(doc.total) || +(taxableBase + taxAmount).toFixed(3);
  const currency = doc.currency || 'USD';

  const fmt = (n: number) =>
    `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`;

  return {
    items: rawItems,
    subtotal,
    discount,
    taxRate,
    taxAmount,
    total,
    currency,
    showDiscount: discount > 0,
    showTax: taxRate > 0,
    fmt,
  };
}

export interface TemplateContext {
  doc: PrintableDoc;
  profile: Profile | null;
  type: DocType;
  totals: ComputedTotals;

  // Convenience fields derived from profile/doc
  name: string;
  businessName: string;
  displayLine1: string;
  displayLine2: string;
  color: string;
  phone: string;
  email: string;
  bankHolder: string;
  bankName: string;
  bankAccount: string;
  bankIban: string;
  logoUrl: string;
  notes: string;
  isQuotation: boolean;
  docLabel: string;
}

export function buildContext(
  doc: PrintableDoc,
  profile: Profile | null,
  type: DocType,
): TemplateContext {
  const totals = computeTotals(doc);
  const name = profile?.full_name || profile?.business_name || 'Your Name';
  const businessName = profile?.business_name || '';
  const { line1: displayLine1, line2: displayLine2 } = profile ? getDisplayName(profile) : { line1: name, line2: '' };
  return {
    doc,
    profile,
    type,
    totals,
    name,
    businessName,
    displayLine1,
    displayLine2,
    color: profile?.brand_color || '#3b82f6',
    phone: profile?.phone || '',
    email: profile?.email || '',
    bankHolder: profile?.bank_holder || name,
    bankName: profile?.bank_name || '',
    bankAccount: profile?.bank_account || '',
    bankIban: profile?.bank_iban || '',
    logoUrl: profile?.logo_url || '',
    notes: doc.notes || '',
    isQuotation: type === 'quotation',
    docLabel: type === 'quotation' ? 'Quotation' : 'Invoice',
  };
}

export function printButton(color: string): string {
  return `<button class="pbtn" onclick="window.print()" aria-label="Download PDF" title="Download PDF">
  <span class="pbtn-icon" aria-hidden="true">PDF</span>
  <span class="pbtn-label">Download PDF</span>
</button>
<style>
.pbtn{position:fixed;bottom:2rem;right:2rem;background:${color};color:#fff;border:none;padding:1rem 1.35rem;border-radius:999px;font-weight:800;font-size:.95rem;cursor:pointer;box-shadow:0 12px 32px rgba(0,0,0,.28);display:flex;align-items:center;gap:.75rem;font-family:inherit;transition:transform .15s,box-shadow .15s,opacity .15s;z-index:999}
.pbtn:hover{transform:translateY(-2px);box-shadow:0 16px 38px rgba(0,0,0,.34)}
.pbtn:focus-visible{outline:3px solid rgba(255,255,255,.55);outline-offset:3px}
.pbtn-icon{display:inline-flex;align-items:center;justify-content:center;min-width:2.5rem;height:2.5rem;padding:0 .7rem;border-radius:999px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);font-size:.82rem;line-height:1;letter-spacing:.08em;font-weight:900}
.pbtn-label{white-space:nowrap;letter-spacing:.01em}
@media (max-width:640px){.pbtn{bottom:1rem;right:1rem;padding:.95rem 1.15rem;font-size:.92rem}.pbtn-icon{min-width:2.35rem;height:2.35rem}}
@media print{.pbtn{display:none!important}}
</style>`;
}
