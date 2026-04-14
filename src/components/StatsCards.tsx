"use client";

interface Props {
  total: number;
  month: number;
  year: number;
  outstanding: number;
  outstandingCount: number;
}

function AnimatedNumber({ value }: { value: number }) {
  return <span className="font-inter">{value.toLocaleString()}</span>;
}

export default function StatsCards({ total, month, year, outstanding, outstandingCount }: Props) {
  const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const now = new Date();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg">💰</div>
          <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">إجمالي</span>
        </div>
        <div className="text-xl md:text-2xl font-black text-white"><AnimatedNumber value={total} /></div>
        <div className="text-slate-400 text-[10px] mt-0.5">إجمالي الدخل (د.ك)</div>
      </div>

      <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-lg">📆</div>
          <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">{monthNames[now.getMonth()]}</span>
        </div>
        <div className="text-xl md:text-2xl font-black text-white"><AnimatedNumber value={month} /></div>
        <div className="text-slate-400 text-[10px] mt-0.5">مدخول الشهر (د.ك)</div>
      </div>

      <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center text-lg">📈</div>
          <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">{now.getFullYear()}</span>
        </div>
        <div className="text-xl md:text-2xl font-black text-white"><AnimatedNumber value={year} /></div>
        <div className="text-slate-400 text-[10px] mt-0.5">دخل السنة (د.ك)</div>
      </div>

      <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center text-lg">🚩</div>
          <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full">{outstandingCount} فواتير</span>
        </div>
        <div className="text-xl md:text-2xl font-black text-red-400"><AnimatedNumber value={outstanding} /></div>
        <div className="text-slate-400 text-[10px] mt-0.5">مبالغ معلقة (د.ك)</div>
      </div>
    </div>
  );
}
