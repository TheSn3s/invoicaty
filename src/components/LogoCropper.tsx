"use client";
import { useCallback, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { useI18n } from "@/lib/i18n";

interface Props {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
  busy?: boolean;
}

/**
 * LogoCropper — modal that lets the user zoom, drag, rotate, and crop the
 * uploaded logo before it's saved. Exports a square PNG blob (max 512×512)
 * which prints cleanly on all invoice templates.
 */
export default function LogoCropper({ imageSrc, onCancel, onConfirm, busy }: Props) {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  // Lock body scroll while the modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, rotation);
      if (blob) onConfirm(blob);
    } finally {
      setProcessing(false);
    }
  };

  const isBusy = processing || busy;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] px-4 py-6">
      <div className="bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-md overflow-hidden flex flex-col fade-in" style={{ maxHeight: "calc(100vh - 48px)" }}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">✂️</span>
            <h3 className="text-sm font-bold text-white">
              {isAr ? "تعديل الشعار" : "Adjust your logo"}
            </h3>
          </div>
          <button onClick={onCancel} disabled={isBusy}
            className="text-slate-400 hover:text-white text-xl leading-none px-2 disabled:opacity-50">×</button>
        </div>

        {/* Cropper */}
        <div className="relative w-full bg-slate-950 shrink-0" style={{ height: 320 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="rect"
            showGrid
            objectFit="contain"
            restrictPosition={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-400">
                {isAr ? "🔍 التكبير" : "🔍 Zoom"}
              </label>
              <span className="text-[11px] text-slate-500 tabular-nums">{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range" min={1} max={4} step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-blue-500"
              disabled={isBusy}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-400">
                {isAr ? "🔄 الدوران" : "🔄 Rotation"}
              </label>
              <span className="text-[11px] text-slate-500 tabular-nums">{rotation}°</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range" min={-180} max={180} step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1 accent-blue-500"
                disabled={isBusy}
              />
              <button type="button" onClick={() => setRotation(0)} disabled={isBusy}
                className="text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700/40 rounded-lg px-2 py-1 disabled:opacity-50">
                {isAr ? "صفر" : "Reset"}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            {isAr
              ? "اسحب الشعار لتحريكه، استخدم الشريط للتكبير أو التصغير، ثم احفظ."
              : "Drag to reposition, use the slider to zoom, then save."}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700/40 flex gap-3 shrink-0">
          <button onClick={onCancel} disabled={isBusy}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-50">
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button onClick={handleConfirm} disabled={isBusy || !croppedAreaPixels}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
            {isBusy
              ? (isAr ? "⏳ جارٍ الحفظ…" : "⏳ Saving…")
              : (isAr ? "✓ حفظ" : "✓ Save")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const MAX_OUTPUT = 512; // px — final logo size cap

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

async function getCroppedBlob(
  imageSrc: string,
  area: Area,
  rotation: number
): Promise<Blob | null> {
  const image = await loadImage(imageSrc);
  const radians = (rotation * Math.PI) / 180;

  // Bounding box of the rotated image
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const bBoxWidth = image.width * cos + image.height * sin;
  const bBoxHeight = image.width * sin + image.height * cos;

  // Render rotated image onto an offscreen canvas
  const rotated = document.createElement("canvas");
  rotated.width = bBoxWidth;
  rotated.height = bBoxHeight;
  const rctx = rotated.getContext("2d");
  if (!rctx) return null;
  rctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  rctx.rotate(radians);
  rctx.drawImage(image, -image.width / 2, -image.height / 2);

  // Crop the requested area, downscaled to MAX_OUTPUT for storage efficiency
  const scale = Math.min(1, MAX_OUTPUT / Math.max(area.width, area.height));
  const outW = Math.round(area.width * scale);
  const outH = Math.round(area.height * scale);

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const octx = out.getContext("2d");
  if (!octx) return null;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(rotated, area.x, area.y, area.width, area.height, 0, 0, outW, outH);

  return new Promise((resolve) => {
    out.toBlob((b) => resolve(b), "image/png", 0.95);
  });
}
