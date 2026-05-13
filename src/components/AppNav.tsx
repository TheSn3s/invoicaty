"use client";

import NavigationMenu from "@/components/NavigationMenu";
import { useI18n } from "@/lib/i18n";

interface Props {
  deletedCount?: number;
}

export default function AppNav({ deletedCount = 0 }: Props) {
  const { t, lang } = useI18n();

  const items = [
    { href: "/expenses", label: t("expense.title") || (lang === "ar" ? "المصروفات" : "Expenses"), icon: "💸" },
    { href: "/quotations", label: t("quotation.title") || (lang === "ar" ? "عروض الأسعار" : "Quotations"), icon: "📋" },
    { href: "/drafts", label: t("nav.drafts") || (lang === "ar" ? "المسودات" : "Drafts"), icon: "📝" },
    { href: "/trash", label: lang === "ar" ? "سلة المهملات" : "Trash", icon: "🗑️", badge: deletedCount },
  ];

  return <NavigationMenu items={items} align={lang === "ar" ? "left" : "right"} />;
}
