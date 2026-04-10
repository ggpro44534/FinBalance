import { useEffect, useMemo, useState } from "react";

import Card from "../components/ui/Card";
import { useFinanceStore } from "../store/financeStore";
import { statisticsService } from "../services/StatisticsService";
import { convertCurrency, formatCurrency, formatDate } from "../lib/utils";
import { useI18n } from "../i18n";

import SummaryCard from "../components/dashboard/SummaryCards";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import PeriodFilter, {
  type PeriodType,
} from "../components/dashboard/PeriodFilter";
import DashboardAccountFilter, {
  type DashboardAccountFilterType,
} from "../components/dashboard/DashboardAccountFilter";

import MonthlySummaryChart from "../components/charts/MonthlySummaryChart";
import IncomeExpenseChart from "../components/charts/IncomeExpenseChart";
import ExpenseByCategoryChart from "../components/charts/ExpenseByCategoryChart";
import { getCategoryDisplayLabel, getCategoryGroup } from "../lib/categoryUtils";

function transactionTouchesAccounts(
  transaction: {
    accountId?: string;
    fromAccountId?: string;
    toAccountId?: string;
  },
  accountIds: Set<string>
): boolean {
  return Boolean(
    (transaction.accountId && accountIds.has(transaction.accountId)) ||
      (transaction.fromAccountId && accountIds.has(transaction.fromAccountId)) ||
      (transaction.toAccountId && accountIds.has(transaction.toAccountId))
  );
}

export default function DashboardPage() {
  const { accounts, transactions, categories, settings } = useFinanceStore();
  const { t, locale, language } = useI18n();
  const [period, setPeriod] = useState<PeriodType>("current-month");
  const [accountFilter, setAccountFilter] =
    useState<DashboardAccountFilterType>("all");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      setIsDark(
        settings.theme === "dark" ||
          (settings.theme === "system" && media.matches)
      );
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [settings.theme]);

  const periodFilteredTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const currentYear = String(now.getFullYear());

    if (period === "current-month") {
      return transactions.filter((transaction) =>
        transaction.date.startsWith(currentMonth)
      );
    }

    if (period === "year") {
      return transactions.filter((transaction) =>
        transaction.date.startsWith(currentYear)
      );
    }

    const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate;
    });
  }, [transactions, period]);

  const visibleAccounts = useMemo(() => {
    if (accountFilter === "all") return accounts;
    if (accountFilter === "cash") return accounts.filter((a) => a.isCash());
    if (accountFilter === "card") return accounts.filter((a) => a.isCard());
    if (accountFilter === "bank") return accounts.filter((a) => a.isBank());

    if (accountFilter.startsWith("account:")) {
      const accountId = accountFilter.slice("account:".length);
      return accounts.filter((account) => account.id === accountId);
    }

    return accounts;
  }, [accounts, accountFilter]);

  const visibleAccountIds = useMemo(
    () => new Set(visibleAccounts.map((account) => account.id)),
    [visibleAccounts]
  );

  const accountCurrencyById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.currency])),
    [accounts]
  );

  const displayCurrency = settings.baseCurrency;

  const filteredTransactions = useMemo(() => {
    if (accountFilter === "all") {
      return periodFilteredTransactions;
    }

    return periodFilteredTransactions.filter((transaction) =>
      transactionTouchesAccounts(transaction, visibleAccountIds)
    );
  }, [periodFilteredTransactions, accountFilter, visibleAccountIds]);

  const totals = useMemo(() => {
    return statisticsService.calculateTotalsInCurrency(
      filteredTransactions,
      accounts,
      displayCurrency
    );
  }, [filteredTransactions, displayCurrency, accounts]);

  const accountBalances = useMemo(
    () => statisticsService.calculateAccountBalances(accounts, transactions),
    [accounts, transactions]
  );

  const totalOverallBalance = useMemo(
    () =>
      visibleAccounts.reduce(
        (sum, account) =>
          sum +
          convertCurrency(
            accountBalances.get(account.id) ?? 0,
            account.currency,
            displayCurrency
          ),
        0
      ),
    [visibleAccounts, accountBalances, displayCurrency]
  );

  const expenseByCategory = useMemo(() => {
    const totalsByGroup = new Map<string, number>();

    for (const transaction of filteredTransactions) {
      if (!transaction.isExpense() || !transaction.categoryId) continue;

      const group = getCategoryGroup(transaction.categoryId, categories);
      if (!group) continue;

      const transactionCurrency =
        (transaction.accountId && accountCurrencyById.get(transaction.accountId)) ||
        (transaction.fromAccountId && accountCurrencyById.get(transaction.fromAccountId)) ||
        (transaction.toAccountId && accountCurrencyById.get(transaction.toAccountId)) ||
        "UAH";

      totalsByGroup.set(
        group.id,
        (totalsByGroup.get(group.id) ?? 0) +
          convertCurrency(transaction.amount, transactionCurrency, displayCurrency)
      );
    }

    const items = categories
      .filter((category) => category.isExpense() && category.isGroup())
      .map((category) => ({
        id: category.id,
        label: getCategoryDisplayLabel(category, language),
        value: totalsByGroup.get(category.id) ?? 0,
        color: category.color,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      labels: items.map((item) => item.label),
      values: items.map((item) => item.value),
      colors: items.map((item) => item.color ?? "#94a3b8"),
      topCategory: items[0] ?? null,
    };
  }, [filteredTransactions, categories, language, accountCurrencyById, displayCurrency]);

  const chartData = useMemo(() => {
    const now = new Date();

    if (period === "year") {
      const monthLabels = Array.from({ length: 12 }, (_, index) =>
        new Intl.DateTimeFormat(locale, { month: "short" }).format(
          new Date(now.getFullYear(), index, 1)
        )
      );

      const incomeData = Array(12).fill(0);
      const expenseData = Array(12).fill(0);

      for (const transaction of filteredTransactions) {
        const monthIndex = new Date(transaction.date).getMonth();
        const transactionCurrency =
          (transaction.accountId && accountCurrencyById.get(transaction.accountId)) ||
          (transaction.fromAccountId && accountCurrencyById.get(transaction.fromAccountId)) ||
          (transaction.toAccountId && accountCurrencyById.get(transaction.toAccountId)) ||
          "UAH";
        const convertedAmount = convertCurrency(
          transaction.amount,
          transactionCurrency,
          displayCurrency
        );

        if (transaction.isIncome()) incomeData[monthIndex] += convertedAmount;
        if (transaction.isExpense()) expenseData[monthIndex] += convertedAmount;
      }

      return { labels: monthLabels, incomeData, expenseData };
    }

    if (period === "last-3-months") {
      const labels: string[] = [];
      const incomeData = Array(3).fill(0);
      const expenseData = Array(3).fill(0);

      for (let index = 2; index >= 0; index -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
        labels.push(new Intl.DateTimeFormat(locale, { month: "short" }).format(date));
      }

      for (const transaction of filteredTransactions) {
        const transactionDate = new Date(transaction.date);
        const diff =
          (now.getFullYear() - transactionDate.getFullYear()) * 12 +
          (now.getMonth() - transactionDate.getMonth());

        const arrayIndex = 2 - diff;
        if (arrayIndex < 0 || arrayIndex > 2) continue;
        const transactionCurrency =
          (transaction.accountId && accountCurrencyById.get(transaction.accountId)) ||
          (transaction.fromAccountId && accountCurrencyById.get(transaction.fromAccountId)) ||
          (transaction.toAccountId && accountCurrencyById.get(transaction.toAccountId)) ||
          "UAH";
        const convertedAmount = convertCurrency(
          transaction.amount,
          transactionCurrency,
          displayCurrency
        );

        if (transaction.isIncome()) incomeData[arrayIndex] += convertedAmount;
        if (transaction.isExpense()) expenseData[arrayIndex] += convertedAmount;
      }

      return { labels, incomeData, expenseData };
    }

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, index) =>
      String(index + 1).padStart(2, "0")
    );
    const incomeData = Array(daysInMonth).fill(0);
    const expenseData = Array(daysInMonth).fill(0);

    for (const transaction of filteredTransactions) {
      const dayIndex = Number(transaction.date.slice(8, 10)) - 1;
      if (dayIndex < 0 || dayIndex >= daysInMonth) continue;
      const transactionCurrency =
        (transaction.accountId && accountCurrencyById.get(transaction.accountId)) ||
        (transaction.fromAccountId && accountCurrencyById.get(transaction.fromAccountId)) ||
        (transaction.toAccountId && accountCurrencyById.get(transaction.toAccountId)) ||
        "UAH";
      const convertedAmount = convertCurrency(
        transaction.amount,
        transactionCurrency,
        displayCurrency
      );

      if (transaction.isIncome()) incomeData[dayIndex] += convertedAmount;
      if (transaction.isExpense()) expenseData[dayIndex] += convertedAmount;
    }

    return { labels, incomeData, expenseData };
  }, [filteredTransactions, period, locale, accountCurrencyById, displayCurrency]);

  const recentTransactions = useMemo(
    () =>
      [...filteredTransactions]
        .sort((first, second) => second.date.localeCompare(first.date))
        .slice(0, 5),
    [filteredTransactions]
  );

  const averageExpense = useMemo(() => {
    const expenseTransactions = filteredTransactions.filter((transaction) =>
      transaction.isExpense()
    );

    if (expenseTransactions.length === 0) return 0;
    return totals.expense / expenseTransactions.length;
  }, [filteredTransactions, totals.expense]);

  const formatAmount = (value: number) =>
    formatCurrency(value, displayCurrency, {
      showDecimals: settings.showDecimals,
      language: settings.language,
    });

  const formatTransactionAmount = (transaction: (typeof recentTransactions)[number]) => {
    const transactionCurrency =
      (transaction.accountId && accountCurrencyById.get(transaction.accountId)) ||
      (transaction.fromAccountId && accountCurrencyById.get(transaction.fromAccountId)) ||
      (transaction.toAccountId && accountCurrencyById.get(transaction.toAccountId)) ||
      "UAH";

    return formatAmount(
      convertCurrency(transaction.amount, transactionCurrency, displayCurrency)
    );
  };

  const formatTxDate = (value: string) =>
    formatDate(value, settings.dateFormat, settings.language);

  const currentPeriodLabel = useMemo(() => {
    if (period === "year") {
      return new Intl.DateTimeFormat(locale, { year: "numeric" }).format(new Date());
    }

    if (period === "last-3-months") {
      return t("dashboard.last3months");
    }

    return new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, [period, locale, t]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("dashboard.period")}: {currentPeriodLabel}
          </p>
        </div>

        <div className="grid w-full gap-3 md:w-auto md:grid-cols-2">
          <PeriodFilter value={period} onChange={setPeriod} />
          <DashboardAccountFilter
            value={accountFilter}
            onChange={setAccountFilter}
            accounts={accounts}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <SummaryCard title={t("dashboard.balancePeriod")} value={formatAmount(totals.balance)} />
        <SummaryCard title={t("dashboard.income")} value={formatAmount(totals.income)} tone="positive" />
        <SummaryCard title={t("dashboard.expense")} value={formatAmount(totals.expense)} tone="negative" />
        <SummaryCard title={t("dashboard.totalBalance")} value={formatAmount(totalOverallBalance)} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("dashboard.averageExpense")}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {formatAmount(averageExpense)}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("dashboard.topExpenseCategory")}
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {expenseByCategory.topCategory?.label ?? t("common.none")}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {expenseByCategory.topCategory
              ? formatAmount(expenseByCategory.topCategory.value)
              : "—"}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("dashboard.activeAccounts")}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {visibleAccounts.length}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MonthlySummaryChart
          income={totals.income}
          expense={totals.expense}
          balance={totals.balance}
          formatAmount={formatAmount}
          isDark={isDark}
        />

        <ExpenseByCategoryChart
          labels={expenseByCategory.labels}
          values={expenseByCategory.values}
          colors={expenseByCategory.colors}
          formatAmount={formatAmount}
          isDark={isDark}
        />
      </div>

      <IncomeExpenseChart
        labels={chartData.labels}
        incomeData={chartData.incomeData}
        expenseData={chartData.expenseData}
        formatAmount={formatAmount}
        isDark={isDark}
      />

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t("dashboard.accountBalances")}
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleAccounts.map((account) => (
            <div
              key={account.id}
              className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700"
            >
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {account.name}
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(accountBalances.get(account.id) ?? 0, account.currency, {
                  showDecimals: settings.showDecimals,
                  language: settings.language,
                })}
              </div>
              {account.currency !== displayCurrency && (
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatAmount(
                    convertCurrency(
                      accountBalances.get(account.id) ?? 0,
                      account.currency,
                      displayCurrency
                    )
                  )}
                </div>
              )}
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {account.type === "cash"
                  ? t("dashboard.accountType.cash")
                  : account.type === "card"
                  ? t("dashboard.accountType.card")
                  : t("dashboard.accountType.bank")}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <RecentTransactions
        items={recentTransactions}
        formatAmount={formatTransactionAmount}
        formatDate={formatTxDate}
      />
    </div>
  );
}
