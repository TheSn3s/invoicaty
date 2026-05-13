"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

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
  const chartData = data.slice(-12);

  const maxValue = useMemo(
    () => Math.max(...chartData.flatMap((d) => [d.income, d.expenses]), 0),
    [chartData]
  );

  const format = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });

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

  const tooltipStyle = {
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  };

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

      <div className="h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid stroke="rgba(148,163,184,0.10)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(148,163,184,0.85)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={14}
            />
            <YAxis
              tick={{ fill: "rgba(148,163,184,0.85)", fontSize: 10 }}
              tickFormatter={(value) => format(Number(value))}
              tickLine={false}
              axisLine={false}
              width={44}
              domain={[0, Math.max(maxValue, 1)]}
              ticks={[0, Math.max(maxValue, 1)]}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "#e2e8f0", fontWeight: 700, marginBottom: 6 }}
              formatter={(value: number, name: string) => [
                `${format(Number(value))} ${symbol}`,
                name === "income" ? t("dashboard.totalIncome") : t("dashboard.totalExpenses"),
              ]}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="rgba(52,211,153,0.98)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "rgba(52,211,153,1)", strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="rgba(253,224,71,0.95)"
              strokeWidth={1.9}
              dot={false}
              activeDot={{ r: 3.5, fill: "rgba(253,224,71,1)", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
