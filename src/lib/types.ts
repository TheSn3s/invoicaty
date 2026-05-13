// ============================================
// Invoicaty — Shared TypeScript types
// ============================================

export type Language = 'ar' | 'en';
export type BusinessType = 'influencer' | 'freelancer' | 'professional' | 'commerce' | 'small_business' | 'other';
export type InvoiceStatus = 'Paid' | 'Not Paid' | 'Canceled';
export type ExpenseStatus = 'Paid' | 'Pending' | 'Cancelled' | 'Deleted';
export type PaymentMethod = 'Cash' | 'Bank';
export type UserRole = 'user' | 'admin';

export interface Currency {
  code: string;            // ISO 4217, e.g. "KWD"
  name_en: string;
  name_ar: string;
  symbol: string;          // e.g. "د.ك", "$"
  decimal_places: number;  // 0, 2, 3
}

export interface Country {
  code: string;            // ISO 3166-1 alpha-2, e.g. "KW"
  name_en: string;
  name_ar: string;
  default_currency: string | null;
  default_tax_rate: number;
  phone_code: string | null;
  flag_emoji: string | null;
}

export interface Profile {
  id: string;
  full_name: string;
  business_name: string;
  phone: string;
  email: string;
  bank_name: string;
  bank_account: string;
  bank_iban: string;
  bank_holder: string;
  logo_url: string;
  signature_url: string;
  brand_color: string;

  // i18n / regional fields
  country_code: string | null;
  default_currency: string | null;
  preferred_language: Language;
  tax_rate: number;
  business_type: BusinessType | null;
  onboarding_completed: boolean;
  role: UserRole;

  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  serial: string;
  date: string;
  client: string;
  project: string;
  description: string;
  amount: number;
  currency: string;          // legacy text field (kept for back-compat)
  currency_code: string;     // new FK
  status: InvoiceStatus;
  category: string;

  // financial fields
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  subtotal: number;
  total: number;
  notes: string;

  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  serial: string;
  date: string;
  vendor: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: ExpenseStatus;
  payment_method: PaymentMethod;
  notes: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Draft {
  id: string;
  user_id: string;
  serial: string;
  date: string;
  client: string;
  project: string;
  title: string;
  summary: string;
  content_html: string;
  status: string;
  deleted_at?: string | null;
}
