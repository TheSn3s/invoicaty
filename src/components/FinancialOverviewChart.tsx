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

function getCoordinates(values: number[], width: number, height: number, maxValue: number) {
  if (!values.length) return [] as Array<{ x: number; y: number }>;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  return values.map((value, index) => ({
    x: index * stepX,
    y: height - (value / maxValue) * height,
  }));
}

function buildLinePath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function buildAreaPath(points: Array<{ x: number; y: number }>, height: number) {
  if (!points.length) return "";
  const line = buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${height} L ${first.x} ${height} Z`;
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
        <div className="h-28 rounded-2xl border border-dashed border-slate-700/60 flex items-center justify-center text-center px-6">
          <div>
            <div className="text-2xl mb-2">📈</div>
            <p className="text-sm text-slate-300 font-bold">{t("dashboard.chartEmpty")}</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.flatMap((d) => [d.income, d.expenses]), 1);
  const chartWidth = 100;
  const chartHeight = 82;
  const incomePoints = getCoordinates(chartData.map((d) => d.income), chartWidth, chartHeight, maxValue);
  const expensePoints = getCoordinates(chartData.map((d) => d.expenses), chartWidth, chartHeight, maxValue);
  const incomeLine = buildLinePath(incomePoints);
  const incomeArea = buildAreaPath(incomePoints, chartHeight);
  const expenseLine = buildLinePath(expensePoints);

  const format = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });

  return (
    <div className="glass rounded-2xl p-4 mt-5 mb-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm md:text-base font-black text-white">{t("dashboard.chartTitle")}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{t("dashboard.chartSubtitle")}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />{t("dashboard.totalIncome")}</div>
          <div className="flex items-center gap-1.5 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" />{t("dashboard.totalExpenses")}</div>
        </div>
      </div>

      <div className="flex gap-3 items-stretch">
        <div className="w-10 shrink-0 flex flex-col justify-between text-[10px] text-slate-500 py-1 font-inter">
          <span>{format(maxValue)}</span>
          <span>0</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative h-24">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-slate-700/30" />
              <div className="border-t border-slate-700/20" />
              <div className="border-t border-slate-700/30" />
            </div>

            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="incomeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(52,211,153,0.26)" />
                  <stop offset="100%" stopColor="rgba(52,211,153,0.02)" />
                </linearGradient>
              </defs>

              <path d={incomeArea} fill="url(#incomeAreaGradient)" />
              <path d={incomeLine} fill="none" stroke="rgba(52,211,153,0.95)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={expenseLine} fill="none" stroke="rgba(253,224,71,0.95)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0" />
            </svg>
          </div>

          <div className="grid mt-2 text-[10px] text-slate-500" style={{ gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))` }}>
            {chartData.map((point) => (
              <div key={point.label} className="text-center truncate px-0.5" title={`${point.label} | ${t("dashboard.totalIncome")}: ${format(point.income)} ${symbol} | ${t("dashboard.totalExpenses")}: ${format(point.expenses)} ${symbol}`}>
                {point.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
