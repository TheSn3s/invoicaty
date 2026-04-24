// ============================================
// Invoicaty — Developer / Support contact info
// Single source of truth for footer + support links.
// ============================================

export const DEVELOPER_INFO = {
  name_en: "Abdullah Alsane'oosi",
  name_ar: "عبدالله السنعوسي",
  supportEmail: "support@invoicaty.com",
} as const;

export const SUPPORT_LINKS = {
  email: `mailto:${DEVELOPER_INFO.supportEmail}?subject=${encodeURIComponent("Invoicaty Support Request")}`,
} as const;
