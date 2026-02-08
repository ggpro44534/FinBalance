import Card from "../components/ui/Card";
import { useFinanceStore } from "../store/financeStore";
import { computeTotals } from "../services/financeService";
import { formatCurrency } from "../lib/utils";

export default function DashboardPage() {
  const { transactions, settings } = useFinanceStore();

  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthTx = transactions.filter((t) => t.date.startsWith(month));
  const totals = computeTotals(monthTx);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Огляд</h1>
        <p className="text-sm text-slate-500">Поточний місяць: {month}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Баланс (місяць)</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatCurrency(totals.balance, settings.mainCurrency)}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-slate-500">Дохід</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">
            {formatCurrency(totals.income, settings.mainCurrency)}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-slate-500">Витрати</p>
          <p className="mt-1 text-2xl font-semibold text-rose-600">
            {formatCurrency(totals.expense, settings.mainCurrency)}
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Останні транзакції</h2>
        <div className="mt-3 space-y-2">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border px-3 py-2">
              <div className="text-sm text-slate-700">
                {t.type === "income" ? "Дохід" : t.type === "expense" ? "Витрата" : "Переказ"} • {t.date}
              </div>
              <div className="text-sm font-semibold">
                {formatCurrency(t.amount, settings.mainCurrency)}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-sm text-slate-500">Поки що немає транзакцій.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
