import type { PrintableDoc, Profile, DocType, TemplateId, LineItem } from "./print-templates/types";
import { renderModern } from "./print-templates/modern";
import { renderClassic } from "./print-templates/classic";
import { renderMinimal } from "./print-templates/minimal";

// Re-export types for consumers that imported from here previously
export type { PrintableDoc, Profile, LineItem, TemplateId, DocType };

function resolveTemplate(profile: Profile | null): TemplateId {
  const t = profile?.invoice_template;
  if (t === "classic" || t === "minimal" || t === "modern") return t;
  return "modern";
}

export function buildInvoiceHtml(
  doc: PrintableDoc,
  profile: Profile | null,
  type: DocType,
  templateOverride?: TemplateId,
): string {
  const template = templateOverride || resolveTemplate(profile);
  switch (template) {
    case "classic": return renderClassic(doc, profile, type);
    case "minimal": return renderMinimal(doc, profile, type);
    case "modern":
    default:        return renderModern(doc, profile, type);
  }
}

function openPrintWindow(html: string) {
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}

export function printInvoice(inv: PrintableDoc, profile: Profile | null, templateOverride?: TemplateId) {
  openPrintWindow(buildInvoiceHtml(inv, profile, 'invoice', templateOverride));
}

export function printQuotation(q: PrintableDoc, profile: Profile | null, templateOverride?: TemplateId) {
  openPrintWindow(buildInvoiceHtml(q, profile, 'quotation', templateOverride));
}
