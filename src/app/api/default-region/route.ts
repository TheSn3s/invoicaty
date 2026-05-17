import { NextResponse } from "next/server";
import { getCountryFromHeaders, resolveDefaultCurrency } from "@/lib/currency-detection";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const countryCode = getCountryFromHeaders(request.headers);
  const currency = resolveDefaultCurrency({ countryCode, fallback: "USD" });

  return NextResponse.json({
    countryCode,
    currency,
    source: countryCode ? "geo" : "fallback",
  });
}
