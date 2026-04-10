import Card from "../ui/Card";
import { Transaction } from "../../models/Transaction";
import { useI18n } from "../../i18n";

type RecentTransactionsProps = {
  items: Transaction[];
  formatAmount: (transaction: Transaction) => string;
  formatDate: (value: string) => string;
};

export default function RecentTransactions({
  items,
  formatAmount,
  formatDate,
}: RecentTransactionsProps) {
  const { t } = useI18n();

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {t("dashboard.recentTransactions")}
      </h3>

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:py-2"
          >
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {item.isIncome()
                ? t("dashboard.transaction.income")
                : item.isExpense()
                ? t("dashboard.transaction.expense")
                : t("dashboard.transaction.transfer")}{" "}
              • {formatDate(item.date)}
            </div>

            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-right">
              {formatAmount(item)}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t("dashboard.noTransactions")}
          </div>
        )}
      </div>
    </Card>
  );
}
