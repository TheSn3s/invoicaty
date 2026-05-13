"use client";

import { useI18n } from "@/lib/i18n";

interface ChartPoint {
  label: string;
  income: number;
  expenses: number;
}

interface Props {
  data: ChartPoint[];
  currencySymbol?: string;
}

export default function FinancialOverviewChart({ data, currencySymbol }: Props) {
  const { t, lang } = useI18n();
  const symbol = currencySymbol || (lang === "ar" ? "د.ك" : "KWD");
  const compactData = data.slice(-8);

  if (!compactData.length) {
    return (
      <div className="glass rounded-2xl p-4 mt-5 mb-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm md:text-base font-black text-white">{t("dashboard.chartTitle") || (lang === "ar" ? "حركة الدخل والمصروف" : "Income vs Expenses")}</h3>
            <p className="text-[11px] text-slate-400 mt-1">{t("dashboard.chartSubtitle") || (lang === "ar" ? "من بداية استخدامك للنظام حتى اليوم" : "From your first activity until today")}</p>
          </div>
        </div>
        <div className="h-32 rounded-2xl border border-dashed border-slate-700/60 flex items-center justify-center text-center px-6">
          <div>
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-slate-300 font-bold">{t("dashboard.chartEmpty") || (lang === "ar" ? "لا توجد بيانات كافية للرسم البياني بعد" : "Not enough data for the chart yet")}</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...compactData.flatMap(d => [d.income, d.expenses]), 1);

  const format = (n: number) => n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });

  return (
    <div className="glass rounded-2xl p-4 mt-5 mb-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm md:text-base font-black text-white">{t("dashboard.chartTitle") || (lang === "ar" ? "حركة الدخل والمصروف" : "Income vs Expenses")}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{t("dashboard.chartSubtitle") || (lang === "ar" ? "آخر 8 أشهر من النشاط" : "Last 8 months of activity")}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />{t("dashboard.totalIncome")}</div>
          <div className="flex items-center gap-1.5 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />{t("dashboard.totalExpenses")}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/20 border border-slate-700/30 px-3 py-4">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 items-end">
          {compactData.map((point) => {
            const incomeHeight = Math.max((point.income / maxValue) * 72, point.income > 0 ? 6 : 0);
            const expenseHeight = Math.max((point.expenses / maxValue) * 72, point.expenses > 0 ? 6 : 0);
            return (
              <div key={point.label} className="min-w-0">
                <div className="h-20 flex items-end justify-center gap-1.5" title={`${point.label} | ${t("dashboard.totalIncome")}: ${format(point.income)} ${symbol} | ${t("dashboard.totalExpenses")}: ${format(point.expenses)} ${symbol}`}>
                  <div className="w-3 rounded-full bg-emerald-400/95" style={{ height: `${incomeHeight}px` }} />
                  <div className="w-3 rounded-full bg-amber-400/95" style={{ height: `${expenseHeight}px` }} />
                </div>
                <div className="mt-2 text-[10px] text-slate-400 text-center truncate">{point.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
