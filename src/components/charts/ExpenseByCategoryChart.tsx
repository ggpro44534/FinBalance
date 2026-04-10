import Card from "../ui/Card";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";

import { useI18n } from "../../i18n";

type ExpenseByCategoryChartProps = {
  labels: string[];
  values: number[];
  colors?: string[];
  formatAmount: (value: number) => string;
  isDark: boolean;
};

export default function ExpenseByCategoryChart({
  labels,
  values,
  colors = ["#f97316", "#0ea5e9", "#a855f7", "#10b981", "#eab308", "#ef4444"],
  formatAmount,
  isDark,
}: ExpenseByCategoryChartProps) {
  const { t } = useI18n();
  const textColor = isDark ? "#cbd5e1" : "#475569";

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: isDark ? "#0f172a" : "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: textColor },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.label}: ${formatAmount(ctx.raw)}`,
        },
      },
    },
  };

  const hasData = values.some((value) => value !== 0);

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {t("chart.expenseByCategory")}
      </h3>

      {hasData ? (
        <div className="mt-4 flex h-[320px] items-center justify-center">
          <Doughnut data={data} options={options} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t("common.noData")}
        </p>
      )}
    </Card>
  );
}
