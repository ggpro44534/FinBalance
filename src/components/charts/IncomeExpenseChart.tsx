import Card from "../ui/Card";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

import { useI18n } from "../../i18n";

type IncomeExpenseChartProps = {
  labels: string[];
  incomeData: number[];
  expenseData: number[];
  formatAmount: (value: number) => string;
  isDark: boolean;
};

export default function IncomeExpenseChart({
  labels,
  incomeData,
  expenseData,
  formatAmount,
  isDark,
}: IncomeExpenseChartProps) {
  const { t } = useI18n();
  const tickColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark ? "rgba(148,163,184,0.18)" : "rgba(148,163,184,0.2)";

  const data = {
    labels,
    datasets: [
      {
        label: t("dashboard.income"),
        data: incomeData,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        fill: true,
        tension: 0.3,
      },
      {
        label: t("dashboard.expense"),
        data: expenseData,
        borderColor: "#f43f5e",
        backgroundColor: "rgba(244, 63, 94, 0.15)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: tickColor },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${formatAmount(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
      y: {
        beginAtZero: true,
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
    },
  };

  const hasData =
    incomeData.some((v) => v !== 0) || expenseData.some((v) => v !== 0);

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {t("chart.incomeExpense")}
      </h3>

      {hasData ? (
        <div className="mt-4 h-[320px]">
          <Line data={data} options={options} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t("common.noData")}
        </p>
      )}
    </Card>
  );
}
