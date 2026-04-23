// ============================================
// Currency formatting helpers
// ============================================
import type { Currency, Language } from './types';

/**
 * Format a number using a currency's locale-aware rules.
 * Falls back gracefully if currency metadata is missing.
 */
export function formatAmount(
  amount: number,
  currency?: Currency | null,
  language: Language = 'ar'
): string {
  const decimals = currency?.decimal_places ?? 2;
  const locale = language === 'ar' ? 'ar' : 'en-US';

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount || 0);

  if (!currency) return formatted;

  // Symbol position: Arabic currencies usually come after, Western before
  const isArabicSymbol = /[\u0600-\u06FF]/.test(currency.symbol);
  return isArabicSymbol
    ? `${formatted} ${currency.symbol}`
    : `${currency.symbol} ${formatted}`;
}

/**
 * Compute invoice totals: subtotal → discount → tax → total.
 */
export function computeInvoiceTotals(input: {
  subtotal: number;
  discountAmount?: number;
  taxRate?: number;
}): { subtotal: number; discountAmount: number; taxAmount: number; total: number } {
  const subtotal = Number(input.subtotal) || 0;
  const discountAmount = Number(input.discountAmount) || 0;
  const taxRate = Number(input.taxRate) || 0;

  const taxableBase = Math.max(subtotal - discountAmount, 0);
  const taxAmount = +(taxableBase * (taxRate / 100)).toFixed(3);
  const total = +(taxableBase + taxAmount).toFixed(3);

  return { subtotal, discountAmount, taxAmount, total };
}

/**
 * Round a number to a currency's allowed decimal places.
 */
export function roundToCurrency(amount: number, currency?: Currency | null): number {
  const decimals = currency?.decimal_places ?? 2;
  const factor = Math.pow(10, decimals);
  return Math.round((amount || 0) * factor) / factor;
}
