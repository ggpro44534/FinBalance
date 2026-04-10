import Card from "../ui/Card";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

import { useI18n } from "../../i18n";

type MonthlySummaryChartProps = {
  income: number;
  expense: number;
  balance: number;
  formatAmount: (value: number) => string;
  isDark: boolean;
};

export default function MonthlySummaryChart({
  income,
  expense,
  balance,
  formatAmount,
  isDark,
}: MonthlySummaryChartProps) {
  const { t } = useI18n();
  const tickColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark ? "rgba(148,163,184,0.18)" : "rgba(148,163,184,0.2)";

  const data = {
    labels: [
      t("dashboard.income"),
      t("dashboard.expense"),
      t("chart.balance"),
    ],
    datasets: [
      {
        label: t("chart.sum"),
        data: [income, expense, balance],
        backgroundColor: ["#10b981", "#f43f5e", "#3b82f6"],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => formatAmount(ctx.raw),
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

  const hasData = income !== 0 || expense !== 0;

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {t("chart.monthlySummary")}
      </h3>

      {hasData ? (
        <div className="mt-4 h-[300px]">
          <Bar data={data} options={options} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t("common.noData")}
        </p>
      )}
    </Card>
  );
}
