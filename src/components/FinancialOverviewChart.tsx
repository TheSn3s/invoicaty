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

  if (!data.length) {
    return (
      <div className="glass rounded-2xl p-6 mt-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm md:text-base font-black text-white">{t("dashboard.chartTitle") || (lang === "ar" ? "حركة الدخل والمصروف" : "Income vs Expenses")}</h3>
            <p className="text-[11px] text-slate-400 mt-1">{t("dashboard.chartSubtitle") || (lang === "ar" ? "من بداية استخدامك للنظام حتى اليوم" : "From your first activity until today")}</p>
          </div>
        </div>
        <div className="h-56 rounded-2xl border border-dashed border-slate-700/60 flex items-center justify-center text-center px-6">
          <div>
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm text-slate-300 font-bold">{t("dashboard.chartEmpty") || (lang === "ar" ? "لا توجد بيانات كافية للرسم البياني بعد" : "Not enough data for the chart yet")}</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expenses]), 1);
  const chartHeight = 180;
  const barWidth = data.length > 10 ? 12 : 18;
  const gap = data.length > 10 ? 8 : 14;
  const pairWidth = barWidth * 2 + gap;
  const chartWidth = Math.max(data.length * (pairWidth + 10), 520);

  const format = (n: number) => n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });

  return (
    <div className="glass rounded-2xl p-5 mt-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm md:text-base font-black text-white">{t("dashboard.chartTitle") || (lang === "ar" ? "حركة الدخل والمصروف" : "Income vs Expenses")}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{t("dashboard.chartSubtitle") || (lang === "ar" ? "من بداية استخدامك للنظام حتى اليوم" : "From your first activity until today")}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />{t("dashboard.totalIncome")}</div>
          <div className="flex items-center gap-1.5 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />{t("dashboard.totalExpenses")}</div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <svg width={chartWidth} height="260" viewBox={`0 0 ${chartWidth} 260`} className="min-w-full">
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = 20 + chartHeight - chartHeight * r;
            const value = maxValue * r;
            return (
              <g key={i}>
                <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4" />
                <text x="4" y={y - 4} fill="rgba(148,163,184,0.75)" fontSize="10">{format(value)}</text>
              </g>
            );
          })}

          {data.map((point, index) => {
            const baseX = 40 + index * (pairWidth + 10);
            const incomeHeight = (point.income / maxValue) * chartHeight;
            const expenseHeight = (point.expenses / maxValue) * chartHeight;
            const yBase = 20 + chartHeight;
            return (
              <g key={point.label}>
                <title>{`${point.label}\n${t("dashboard.totalIncome")}: ${format(point.income)} ${symbol}\n${t("dashboard.totalExpenses")}: ${format(point.expenses)} ${symbol}`}</title>
                <rect x={baseX} y={yBase - incomeHeight} width={barWidth} height={incomeHeight} rx="6" fill="rgba(52, 211, 153, 0.95)" />
                <rect x={baseX + barWidth + gap} y={yBase - expenseHeight} width={barWidth} height={expenseHeight} rx="6" fill="rgba(251, 191, 36, 0.95)" />
                <text x={baseX + pairWidth / 2} y="228" textAnchor="middle" fill="rgba(203,213,225,0.85)" fontSize="10">{point.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
