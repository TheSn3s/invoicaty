import type { Metadata, Viewport } from "next";
import { Tajawal, Inter } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "انفويساتي (Invoicaty) — أسهل برنامج فواتير للفريلانسرز والمستقلين",
  description: "أنشئ فواتير احترافية في دقائق مع انفويساتي. نظام فواتير متكامل يدعم اللغة العربية، العملات الخليجية، وتحميل PDF. الخيار الأول للمصممين والمبرمجين.",
  keywords: ["انفويساتي", "Invoicaty", "برنامج فواتير", "فواتير فريلانسرز", "نظام فواتير عربي", "إنشاء فاتورة PDF", "فواتير المصممين"],
  manifest: "/manifest.json",
  openGraph: {
    title: "Invoicaty — نظام الفواتير الأسهل للمستقلين",
    description: "ابدأ بإدارة فواتيرك وتحصيل مدفوعاتك باحترافية وسهولة.",
    url: "https://invoicaty.com",
    siteName: "Invoicaty",
    locale: "ar_KW",
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
    "name": "انفويساتي — Invoicaty",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KWD"
    },
    "description": "نظام انفويساتي لإنشاء وإدارة الفواتير الاحترافية للمستقلين وأصحاب المشاريع الصغيرة."
  };

  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-tajawal bg-slate-950 text-slate-200 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
