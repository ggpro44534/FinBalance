import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";

import { useFinanceStore } from "../store/financeStore";
import { financeService } from "../services/FinanceService";
import {
  transactionQueryService,
  type TransactionQueryParams,
} from "../services/TransactionQueryService";
import type { TransactionType } from "../models/Transaction";
import { formatCurrency, formatDate, toISODate } from "../lib/utils";
import { useI18n } from "../i18n";
import {
  getCategoryChildren,
  getCategoryDisplayLabel,
  getCategoryGroupsByType,
  getCategoryPathLabel,
} from "../lib/categoryUtils";

type TransactionFilterType = "" | TransactionType;
type TransactionFormType = "income" | "expense" | "transfer";

export default function TransactionsPage() {
  const { accounts, categories, transactions, settings } = useFinanceStore();
  const { t, language } = useI18n();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionFilterType>("");

  const transactionQueryParams = useMemo<TransactionQueryParams>(
    () => ({
      searchText: searchQuery,
      type: typeFilter,
      sortDirection: "desc",
    }),
    [searchQuery, typeFilter]
  );

  const filteredTransactions = useMemo(
    () => transactionQueryService.execute(transactions, transactionQueryParams),
    [transactions, transactionQueryParams]
  );

  const accountCurrencyById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.currency])),
    [accounts]
  );

  const expenseGroups = useMemo(
    () => getCategoryGroupsByType(categories, "expense"),
    [categories]
  );
  const incomeGroups = useMemo(
    () => getCategoryGroupsByType(categories, "income"),
    [categories]
  );

  const [formType, setFormType] = useState<TransactionFormType>("expense");
  const [amount, setAmount] = useState("0");
  const [date, setDate] = useState(toISODate());
  const [note, setNote] = useState("");

  const defaultExpenseGroupId = expenseGroups[0]?.id ?? "";
  const defaultIncomeGroupId = incomeGroups[0]?.id ?? "";
  const defaultAccountId = accounts[0]?.id ?? "";
  const secondAccountId = accounts[1]?.id ?? defaultAccountId;

  const [accountId, setAccountId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");

  const activeGroups = formType === "income" ? incomeGroups : expenseGroups;
  const activeDefaultGroupId = formType === "income" ? defaultIncomeGroupId : defaultExpenseGroupId;
  const activeSubcategories = useMemo(
    () => (groupId ? getCategoryChildren(groupId, categories) : []),
    [groupId, categories]
  );

  useEffect(() => {
    if (!accountId && defaultAccountId) setAccountId(defaultAccountId);
    if (!fromAccountId && defaultAccountId) setFromAccountId(defaultAccountId);
    if (!toAccountId && secondAccountId) setToAccountId(secondAccountId);
  }, [accountId, fromAccountId, toAccountId, defaultAccountId, secondAccountId]);

  useEffect(() => {
    if (formType === "transfer") {
      setCategoryId("");
      setGroupId("");
      return;
    }

    if (!groupId || !activeGroups.some((group) => group.id === groupId)) {
      setGroupId(activeDefaultGroupId);
    }
  }, [formType, groupId, activeGroups, activeDefaultGroupId]);

  useEffect(() => {
    if (formType === "transfer") {
      return;
    }

    if (categoryId && activeSubcategories.some((category) => category.id === categoryId)) {
      return;
    }

    setCategoryId("");
  }, [categoryId, activeSubcategories, formType]);

  const resetForm = () => {
    setAmount("0");
    setDate(toISODate());
    setNote("");
    setAccountId(defaultAccountId);
    setFromAccountId(defaultAccountId);
    setToAccountId(secondAccountId);
    setGroupId(formType === "income" ? defaultIncomeGroupId : defaultExpenseGroupId);
    setCategoryId("");
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const onCreateTransaction = async () => {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    if (formType === "transfer") {
      if (!fromAccountId || !toAccountId || fromAccountId === toAccountId) return;

      await financeService.addTransaction({
        type: "transfer",
        amount: parsedAmount,
        date,
        note,
        fromAccountId,
        toAccountId,
      });

      closeModal();
      return;
    }

    if (!accountId || !groupId) return;

    await financeService.addTransaction({
      type: formType,
      amount: parsedAmount,
      date,
      note,
      accountId,
      categoryId: categoryId || groupId,
    });

    closeModal();
  };

  const onDeleteTransaction = async (transactionId: string) => {
    if (settings.confirmBeforeDelete) {
      const shouldDelete = window.confirm(t("transactions.confirmDelete"));
      if (!shouldDelete) return;
    }

    await financeService.deleteTransaction(transactionId);
  };

  const getTransactionCurrency = (
    accountIdValue?: string,
    fromAccountIdValue?: string,
    toAccountIdValue?: string
  ) => {
    if (accountIdValue) return accountCurrencyById.get(accountIdValue) ?? "UAH";
    if (fromAccountIdValue) return accountCurrencyById.get(fromAccountIdValue) ?? "UAH";
    if (toAccountIdValue) return accountCurrencyById.get(toAccountIdValue) ?? "UAH";
    return "UAH";
  };

  const getTransactionTypeLabel = (transactionType: TransactionFormType): string => {
    if (transactionType === "income") return t("dashboard.transaction.income");
    if (transactionType === "expense") return t("dashboard.transaction.expense");
    return t("dashboard.transaction.transfer");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("transactions.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("transactions.subtitle")}
          </p>
        </div>

        <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
          {t("transactions.add")}
        </Button>
      </div>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder={t("transactions.search")}
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />

          <Select
            value={typeFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setTypeFilter(e.target.value as TransactionFilterType)
            }
          >
            <option value="">{t("transactions.allTypes")}</option>
            <option value="expense">{t("categories.expense")}</option>
            <option value="income">{t("categories.income")}</option>
            <option value="transfer">{t("dashboard.transaction.transfer")}</option>
          </Select>

          <Button
            variant="secondary"
            className="w-full md:w-auto"
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("");
            }}
          >
            {t("transactions.clear")}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t("transactions.list")}
        </h2>

        <div className="mt-4 space-y-2">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {getTransactionTypeLabel(transaction.type)}
                  <span className="font-normal text-slate-500 dark:text-slate-400">
                    {" "}
                    · {formatDate(transaction.date, settings.dateFormat, settings.language)}
                  </span>
                </div>

                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {transaction.note || t("transactions.noNote")}
                </div>

                {!transaction.isTransfer() && transaction.categoryId && (
                  <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {getCategoryPathLabel(transaction.categoryId, categories, language)}
                  </div>
                )}
              </div>

              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-right">
                  {formatCurrency(
                    transaction.amount,
                    getTransactionCurrency(
                      transaction.accountId,
                      transaction.fromAccountId,
                      transaction.toAccountId
                    ),
                    {
                      showDecimals: settings.showDecimals,
                      language: settings.language,
                    }
                  )}
                </div>

                <button
                  className="text-xs text-rose-600 hover:underline dark:text-rose-400"
                  onClick={() => onDeleteTransaction(transaction.id)}
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t("transactions.empty")}
            </div>
          )}
        </div>
      </Card>

      <Modal open={open} title={t("transactions.new")} onClose={closeModal}>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              variant={formType === "expense" ? "primary" : "secondary"}
              onClick={() => setFormType("expense")}
            >
              {t("categories.expense")}
            </Button>

            <Button
              variant={formType === "income" ? "primary" : "secondary"}
              onClick={() => setFormType("income")}
            >
              {t("categories.income")}
            </Button>

            <Button
              variant={formType === "transfer" ? "primary" : "secondary"}
              onClick={() => setFormType("transfer")}
            >
              {t("dashboard.transaction.transfer")}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t("transactions.amount")}
              </div>
              <Input
                value={amount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                inputMode="decimal"
              />
            </div>

            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t("transactions.date")}
              </div>
              <Input
                type="date"
                value={date}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
              />
            </div>
          </div>

          {formType !== "transfer" ? (
            <>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {t("transactions.account")}
                </div>
                <Select
                  value={accountId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setAccountId(e.target.value)}
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {t("transactions.baseCategory")}
                </div>
                <Select
                  value={groupId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setGroupId(e.target.value);
                    setCategoryId("");
                  }}
                >
                  {activeGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {getCategoryDisplayLabel(group, language)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {t("transactions.subcategory")}
                </div>
                <Select
                  value={categoryId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value)}
                  disabled={!groupId}
                >
                  <option value="">{t("transactions.noSubcategory")}</option>
                  {activeSubcategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getCategoryDisplayLabel(category, language)}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {t("transactions.fromAccount")}
                </div>
                <Select
                  value={fromAccountId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setFromAccountId(e.target.value)
                  }
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {t("transactions.toAccount")}
                </div>
                <Select
                  value={toAccountId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setToAccountId(e.target.value)}
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t("transactions.note")}
            </div>
            <Input
              value={note}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
              placeholder={t("transactions.notePlaceholder")}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={closeModal}>
              {t("common.cancel")}
            </Button>
            <Button className="w-full sm:w-auto" onClick={onCreateTransaction}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
