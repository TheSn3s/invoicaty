import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Tajawal, Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://invoicaty.com"),
  title: "Invoicaty — Professional Invoices & Quotations for Freelancers and Small Businesses",
  description: "Create professional invoices and quotations in minutes with Invoicaty. Support for countries, currencies, taxes, Arabic & English, and print-ready PDF documents.",
  keywords: [
    "Invoicaty",
    "invoicing app",
    "quotation software",
    "invoice and quotation generator",
    "freelancer invoices",
    "small business invoicing",
    "PDF invoice generator",
    "multi currency invoicing",
    "Arabic invoicing software",
    "انفويساتي",
    "برنامج فواتير",
    "برنامج عروض أسعار",
    "فواتير وعروض أسعار"
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "Invoicaty — Professional Invoices & Quotations",
    description: "Create invoices and quotations with support for currencies, taxes, Arabic & English, and print-ready PDF output.",
    url: "https://invoicaty.com",
    siteName: "Invoicaty",
    locale: "en_US",
    alternateLocale: ["ar_KW"],
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Invoicaty — فواتير وعروض أسعار احترافية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoicaty — Professional Invoices & Quotations",
    description: "Invoices, quotations, currencies, taxes, Arabic & English — all in one clean workflow.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://invoicaty.com",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Invoicaty",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Invoicaty is a professional invoicing and quotation platform for freelancers and small businesses.",
    "featureList": [
      "Create invoices",
      "Create quotations",
      "Convert quotations to invoices",
      "Multi-country support",
      "Multi-currency and tax support",
      "Arabic and English interface",
      "Print-ready PDF documents"
    ],
    "url": "https://invoicaty.com"
  };

  return (
    <html lang="en" dir="ltr" className={`${tajawal.variable} ${inter.variable}`}>
      <head>
        {/* Google tag (gtag.js) — Google Ads conversion tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18117219196"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18117219196');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-inter bg-slate-950 text-slate-200 min-h-screen antialiased">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
