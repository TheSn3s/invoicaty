"use client";

interface Props {
  serial: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteModal({ serial, onConfirm, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 px-5" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-sm p-8 text-center fade-in" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center text-2xl">🗑️</div>
        <h3 className="text-lg font-bold text-white mb-2">ح��ف الفاتورة</h3>
        <p className="text-slate-400 text-sm mb-6">هل أنت متأكد من حذف الفاتورة رقم #{serial}؟</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
            إلغاء
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95">
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
