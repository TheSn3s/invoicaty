import type { LineItem, PrintableDoc, Profile, DocType } from "./types";

export function escapeHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  const currency = doc.currency || 'KWD';

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
  return {
    doc,
    profile,
    type,
    totals,
    name,
    businessName,
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
  return `<button class="pbtn" onclick="window.print()">🖨️ Save as PDF</button>
<style>
.pbtn{position:fixed;bottom:2rem;right:2rem;background:${color};color:#fff;border:none;padding:.9rem 1.6rem;border-radius:999px;font-weight:700;font-size:.875rem;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.25);display:flex;align-items:center;gap:.6rem;font-family:inherit;transition:transform .15s,box-shadow .15s;z-index:999}
.pbtn:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(0,0,0,.3)}
@media print{.pbtn{display:none!important}}
</style>`;
}
