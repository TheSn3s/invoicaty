export const CURRENCY_BY_COUNTRY: Record<string, string> = {
  KW: "KWD",
  SA: "SAR",
  AE: "AED",
  QA: "QAR",
  BH: "BHD",
  OM: "OMR",
  US: "USD",
  GB: "GBP",
  EU: "EUR",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
  JP: "JPY",
  IN: "INR",
  TR: "TRY",
  EG: "EGP",
};

export function getCountryFromHeaders(headers: Headers | Record<string, string | null | undefined>) {
  const get = (key: string) => {
    if (headers instanceof Headers) return headers.get(key);
    return headers[key] ?? headers[key.toLowerCase()] ?? null;
  };

  const candidates = [
    get("x-vercel-ip-country"),
    get("x-country-code"),
    get("x-country"),
  ];

  return candidates.find((v) => typeof v === "string" && v.trim())?.trim().toUpperCase() || null;
}

export function detectCurrencyFromCountry(countryCode?: string | null) {
  if (!countryCode) return null;
  return CURRENCY_BY_COUNTRY[countryCode.toUpperCase()] || null;
}

export function resolveDefaultCurrency(params: {
  manualCurrency?: string | null;
  workspaceCurrency?: string | null;
  countryCode?: string | null;
  fallback?: string;
}) {
  return params.manualCurrency || params.workspaceCurrency || detectCurrencyFromCountry(params.countryCode) || params.fallback || "USD";
}
