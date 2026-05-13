"use client";

import { useI18n } from "@/lib/i18n";

interface Props {
  total: number;
  month: number;
  year: number;
  expensesTotal: number;
  netProfit: number;
  outstanding: number;
  outstandingCount: number;
  currencySymbol?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  return <span className="font-inter">{value.toLocaleString()}</span>;
}

export default function StatsCards({ total, month, year, expensesTotal, netProfit, outstanding, outstandingCount, currencySymbol }: Props) {
  const { t, lang } = useI18n();
  const symbol = currencySymbol || (lang === 'ar' ? 'د.ك' : 'KWD');
  const monthNamesAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const monthNamesEn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthNames = lang === 'ar' ? monthNamesAr : monthNamesEn;
  const now = new Date();

  return (
    <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
      <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg">💰</div>
          <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">{t("dashboard.totalIncome")}</span>
        </div>
        <div className="text-xl md:text-2xl font-black text-white"><AnimatedNumber value={total} /></div>
        <div className="text-slate-400 text-[10px] mt-0.5">{t("dashboard.totalIncome")} ({symbol})</div>
      </div>

      <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-lg">📆</div>
          <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">{monthNames[now.getMonth()]}</span>
        </div>
        <div className="text-xl md:text-2xl font-black text-white"><AnimatedNumber value={month} /></div>
        <div className="text-slate-400 text-[10px] mt-0.5">{t("dashboard.monthIncome")} ({symbol})</div>
      </div>

      <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center text-lg">📈</div>
          <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">{now.getFullYear()}</span>
        </div>
        <div className="text-xl md:text-2xl font-black text-white"><AnimatedNumber value={year} /></div>
        <div className="text-slate-400 text-[10px] mt-0.5">{t("dashboard.yearIncome")} ({symbol})</div>
      </div>

      <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-lg">💸</div>
          <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">{t("dashboard.totalExpenses")}</span>
        </div>
        <div className="text-xl md:text-2xl font-black text-amber-300"><AnimatedNumber value={expensesTotal} /></div>
        <div className="text-slate-400 text-[10px] mt-0.5">{t("dashboard.totalExpenses")} ({symbol})</div>
      </div>

      <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${netProfit >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"}`}>🧮</div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${netProfit >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>{t("dashboard.netProfit")}</span>
        </div>
        <div className={`text-xl md:text-2xl font-black ${netProfit >= 0 ? "text-emerald-300" : "text-red-300"}`}><AnimatedNumber value={netProfit} /></div>
        <div className="text-slate-400 text-[10px] mt-0.5">{t("dashboard.netProfit")} ({symbol})</div>
      </div>

      <div className="glass rounded-2xl p-4 transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center text-lg">🚩</div>
          <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full">{outstandingCount} {t("dashboard.invoiceCount")}</span>
        </div>
        <div className="text-xl md:text-2xl font-black text-red-400"><AnimatedNumber value={outstanding} /></div>
        <div className="text-slate-400 text-[10px] mt-0.5">{t("dashboard.outstanding")} ({symbol})</div>
      </div>
    </div>
  );
}
