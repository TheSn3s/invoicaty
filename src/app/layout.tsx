import type { Metadata, Viewport } from "next";
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
  title: "Invoicaty — The Easiest Invoicing App for Freelancers & Small Businesses",
  description: "Create professional invoices in minutes with Invoicaty. A complete invoicing system supporting multiple currencies, Arabic & English, and PDF export. The #1 choice for designers and developers.",
  keywords: ["Invoicaty", "invoicing app", "freelancer invoices", "invoice software", "PDF invoice generator", "small business invoicing", "انفويساتي", "برنامج فواتير"],
  manifest: "/manifest.json",
  openGraph: {
    title: "Invoicaty — Effortless Invoicing for Freelancers",
    description: "Start managing your invoices and collecting payments professionally and easily.",
    url: "https://invoicaty.com",
    siteName: "Invoicaty",
    locale: "en_US",
    alternateLocale: ["ar_KW"],
    type: "website",
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
    "description": "Invoicaty is a professional invoicing platform for freelancers and small business owners."
  };

  return (
    <html lang="en" dir="ltr" className={`${tajawal.variable} ${inter.variable}`}>
      <head>
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
