// Shared types for invoice/quotation printing

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface PrintableDoc {
  serial: string;
  date: string;
  client: string;
  project: string;
  description: string;
  amount: number;
  discount?: number;
  currency: string;
  tax_rate?: number;
  tax_amount?: number;
  total?: number;
  notes?: string;
  valid_until?: string | null;
  items?: LineItem[] | null;
}

export interface Profile {
  full_name: string;
  business_name: string;
  phone: string;
  email: string;
  bank_name: string;
  bank_account: string;
  bank_iban: string;
  bank_holder: string;
  brand_color: string;
  logo_url?: string;
  invoice_template?: TemplateId | null;
}

export type DocType = 'invoice' | 'quotation';

export type TemplateId = 'modern' | 'classic' | 'minimal';

export const TEMPLATE_IDS: TemplateId[] = ['modern', 'classic', 'minimal'];
