// Google Ads conversion tracking helpers
// Usage: trackSignup() after successful user registration

// Type the gtag global function
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Google Ads account ID
export const GOOGLE_ADS_ID = "AW-18117219196";

// Conversion labels — fill these in once you create Conversion Actions in Google Ads
// Format: "AW-XXXXXXXXXXX/YYYYYYYYYYY"
export const CONVERSION_IDS = {
  signup:     process.env.NEXT_PUBLIC_GADS_SIGNUP_CONVERSION_ID || "",
  // Future conversions — ready to wire up when needed
  firstInvoice: process.env.NEXT_PUBLIC_GADS_FIRST_INVOICE_CONVERSION_ID || "",
  upgrade:      process.env.NEXT_PUBLIC_GADS_UPGRADE_CONVERSION_ID || "",
} as const;

/**
 * Fire a Google Ads conversion event.
 * Safe to call anywhere — no-ops on server and when gtag is missing.
 */
export function trackConversion(
  conversionId: string,
  value?: number,
  currency: string = "USD",
) {
  if (typeof window === "undefined") return;
  if (!window.gtag) {
    console.warn("[gtag] Not loaded yet — conversion skipped:", conversionId);
    return;
  }
  if (!conversionId) {
    console.warn("[gtag] Conversion ID missing — check env vars");
    return;
  }

  const params: Record<string, unknown> = { send_to: conversionId };
  if (value !== undefined) {
    params.value = value;
    params.currency = currency;
  }

  window.gtag("event", "conversion", params);
  console.log("[gtag] Conversion fired:", conversionId, params);
}

/** Track a successful signup. Call right after auth.signUp() succeeds. */
export function trackSignup() {
  trackConversion(CONVERSION_IDS.signup);
}

/** Track when a user creates their first invoice. */
export function trackFirstInvoice() {
  trackConversion(CONVERSION_IDS.firstInvoice);
}

/** Track when a user upgrades to a paid plan. Supply the plan price. */
export function trackUpgrade(valueUSD: number) {
  trackConversion(CONVERSION_IDS.upgrade, valueUSD, "USD");
}
