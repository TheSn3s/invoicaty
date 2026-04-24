"use client";
import type { TemplateId } from "@/lib/print-templates/types";

interface Props {
  id: TemplateId;
  brandColor: string;
}

/**
 * Pure-CSS miniature representation of each invoice template.
 * Not a full render — just gives the user a visual feel of the layout
 * (header position, color usage, table style) at a glance.
 */
export default function TemplateThumb({ id, brandColor }: Props) {
  if (id === "modern") {
    return (
      <div className="relative h-32 bg-white overflow-hidden">
        {/* Brand accent bar on left */}
        <div className="absolute inset-y-0 left-0 w-1" style={{ background: brandColor }} />
        <div className="px-4 py-3 h-full flex flex-col gap-1.5">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded" style={{ background: brandColor }} />
              <div className="space-y-0.5">
                <div className="w-12 h-1.5 bg-slate-700 rounded-sm" />
                <div className="w-8 h-1 bg-slate-300 rounded-sm" />
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <div className="text-[6px] font-bold uppercase" style={{ color: brandColor }}>Invoice</div>
              <div className="text-[8px] font-black text-slate-800">#001</div>
            </div>
          </div>
          {/* Bill to / Details */}
          <div className="grid grid-cols-2 gap-2 mt-0.5">
            <div className="space-y-0.5"><div className="w-6 h-0.5 bg-slate-400" /><div className="w-10 h-1 bg-slate-700" /></div>
            <div className="space-y-0.5"><div className="w-6 h-0.5 bg-slate-400" /><div className="w-12 h-1 bg-slate-500" /></div>
          </div>
          {/* Lines */}
          <div className="space-y-1 mt-1 border-t pt-1" style={{ borderColor: brandColor }}>
            <div className="flex justify-between"><div className="w-16 h-1 bg-slate-300" /><div className="w-6 h-1 bg-slate-700" /></div>
            <div className="flex justify-between"><div className="w-14 h-1 bg-slate-300" /><div className="w-6 h-1 bg-slate-700" /></div>
          </div>
          {/* Total pill */}
          <div className="flex justify-end mt-auto">
            <div className="rounded text-white text-[7px] px-2 py-0.5 font-bold" style={{ background: brandColor }}>Total · 1,250</div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "classic") {
    return (
      <div className="relative h-32 overflow-hidden" style={{ background: "#fffdf8" }}>
        <div className="px-4 py-3 h-full flex flex-col items-center gap-1">
          {/* Top rule */}
          <div className="w-full h-px bg-slate-700" />
          {/* Centered logo */}
          <div className="w-6 h-6 rounded-full mt-1" style={{ background: brandColor, opacity: 0.85 }} />
          <div className="w-14 h-1.5 bg-slate-800 rounded-sm" />
          <div className="w-8 h-0.5 bg-slate-400 rounded-sm" />
          <div className="w-full h-px bg-slate-700 mt-0.5" />
          {/* Big title */}
          <div className="font-serif text-[10px] tracking-[0.3em] text-slate-800 mt-1.5" style={{ fontFamily: "Georgia, serif" }}>INVOICE</div>
          <div className="w-6 h-0.5" style={{ background: brandColor }} />
          {/* Items */}
          <div className="w-full space-y-0.5 mt-auto">
            <div className="flex justify-between"><div className="w-14 h-0.5 bg-slate-400" /><div className="w-6 h-0.5 bg-slate-600" /></div>
            <div className="flex justify-between border-t-2 pt-1" style={{ borderColor: "#1f2937" }}>
              <div className="text-[7px] font-bold tracking-wider text-slate-800" style={{ fontFamily: "Georgia, serif" }}>TOTAL</div>
              <div className="text-[8px] font-bold" style={{ color: brandColor, fontFamily: "Georgia, serif" }}>1,250</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // minimal
  return (
    <div className="relative h-32 bg-white overflow-hidden">
      <div className="px-4 py-3 h-full flex flex-col gap-2">
        {/* Top: tiny logo + date */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-slate-900" />
            <div className="w-8 h-1 bg-slate-700" />
          </div>
          <div className="text-[6px] uppercase tracking-wider text-slate-400">Invoice</div>
        </div>
        {/* Hero serial */}
        <div className="mt-2 inline-block self-start relative">
          <div className="text-[6px] uppercase tracking-wider text-slate-400 mb-0.5">Invoice</div>
          <div className="text-[16px] font-black tracking-tighter text-slate-900 leading-none relative">
            #001
            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5" style={{ background: brandColor, opacity: 0.5 }} />
          </div>
        </div>
        {/* From / To */}
        <div className="grid grid-cols-2 gap-3 border-t pt-1.5 mt-1 border-slate-200">
          <div className="space-y-0.5"><div className="w-4 h-0.5 bg-slate-300" /><div className="w-10 h-1 bg-slate-700" /></div>
          <div className="space-y-0.5"><div className="w-4 h-0.5 bg-slate-300" /><div className="w-10 h-1 bg-slate-700" /></div>
        </div>
        {/* Total */}
        <div className="flex justify-between items-baseline border-t border-slate-900 pt-1 mt-auto">
          <div className="text-[7px] font-bold text-slate-900">Total</div>
          <div className="text-[10px] font-black text-slate-900">1,250</div>
        </div>
      </div>
    </div>
  );
}
