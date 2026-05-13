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

function buildPath(values: number[], width: number, height: number, maxValue: number) {
  if (!values.length) return "";
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  return values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / maxValue) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function FinancialOverviewChart({ data, currencySymbol }: Props) {
  const { t, lang } = useI18n();
  const symbol = currencySymbol || (lang === "ar" ? "د.ك" : "KWD");
  const chartData = data.slice(-12);

  if (!chartData.length) {
    return (
      <div className="glass rounded-2xl p-4 mt-5 mb-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm md:text-base font-black text-white">{t("dashboard.chartTitle")}</h3>
            <p className="text-[11px] text-slate-400 mt-1">{t("dashboard.chartSubtitle")}</p>
          </div>
        </div>
        <div className="h-32 rounded-2xl border border-dashed border-slate-700/60 flex items-center justify-center text-center px-6">
          <div>
            <div className="text-3xl mb-2">📈</div>
            <p className="text-sm text-slate-300 font-bold">{t("dashboard.chartEmpty")}</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.flatMap((d) => [d.income, d.expenses]), 1);
  const chartWidth = 100;
  const chartHeight = 96;
  const incomeValues = chartData.map((d) => d.income);
  const expenseValues = chartData.map((d) => d.expenses);
  const incomePath = buildPath(incomeValues, chartWidth, chartHeight, maxValue);
  const expensePath = buildPath(expenseValues, chartWidth, chartHeight, maxValue);

  const format = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });

  const topLabel = format(maxValue);

  return (
    <div className="glass rounded-2xl p-4 mt-5 mb-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm md:text-base font-black text-white">{t("dashboard.chartTitle")}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{t("dashboard.chartSubtitle")}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />{t("dashboard.totalIncome")}</div>
          <div className="flex items-center gap-1.5 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />{t("dashboard.totalExpenses")}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/20 border border-slate-700/30 p-3">
        <div className="flex gap-3">
          <div className="w-10 flex flex-col justify-between text-[10px] text-slate-500 shrink-0 py-1">
            <span className="font-inter">{topLabel}</span>
            <span className="font-inter">0</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="relative h-28">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-slate-700/40" />
                <div className="border-t border-slate-700/30 border-dashed" />
                <div className="border-t border-slate-700/40" />
              </div>

              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                <path d={incomePath} fill="none" stroke="rgba(52, 211, 153, 0.95)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={expensePath} fill="none" stroke="rgba(251, 191, 36, 0.95)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {chartData.map((point, index) => {
                  const x = chartData.length > 1 ? (index * chartWidth) / (chartData.length - 1) : chartWidth / 2;
                  const incomeY = chartHeight - (point.income / maxValue) * chartHeight;
                  const expenseY = chartHeight - (point.expenses / maxValue) * chartHeight;
                  return (
                    <g key={point.label}>
                      <title>{`${point.label}\n${t("dashboard.totalIncome")}: ${format(point.income)} ${symbol}\n${t("dashboard.totalExpenses")}: ${format(point.expenses)} ${symbol}`}</title>
                      <circle cx={x} cy={incomeY} r="2.5" fill="rgba(52, 211, 153, 1)" />
                      <circle cx={x} cy={expenseY} r="2.5" fill="rgba(251, 191, 36, 1)" />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="grid mt-2 text-[10px] text-slate-400" style={{ gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))` }}>
              {chartData.map((point) => (
                <div key={point.label} className="text-center truncate px-0.5">{point.label}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
