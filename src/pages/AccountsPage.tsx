import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";

import { useFinanceStore } from "../store/financeStore";
import { financeService } from "../services/financeService";
import { statisticsService } from "../services/StatisticsService";
import { formatCurrency } from "../lib/utils";
import { useI18n } from "../i18n";

import type { AccountType } from "../models/Account";

export default function AccountsPage() {
  const { accounts, transactions, settings } = useFinanceStore();
  const { t } = useI18n();

  const balances = useMemo(
    () => statisticsService.calculateAccountBalances(accounts, transactions),
    [accounts, transactions]
  );

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("cash");
  const [currency, setCurrency] = useState("CZK");

  const onCreate = async () => {
    if (!name.trim()) return;

    await financeService.addAccount({ name: name.trim(), type, currency });
    setOpen(false);
    setName("");
    setType("cash");
    setCurrency("CZK");
  };

  const onDeleteAccount = async (accountId: string) => {
    if (settings.confirmBeforeDelete) {
      const shouldDelete = window.confirm(t("accounts.confirmDelete"));
      if (!shouldDelete) return;
    }

    await financeService.deleteAccount(accountId);
  };

  const getAccountTypeLabel = (accountType: AccountType): string => {
    if (accountType === "cash") return t("dashboard.accountType.cash");
    if (accountType === "card") return t("dashboard.accountType.card");
    if (accountType === "bank") return t("dashboard.accountType.bank");
    return accountType;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("accounts.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("accounts.subtitle")}
          </p>
        </div>

        <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
          {t("accounts.add")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <Card key={account.id} className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-semibold">{account.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {getAccountTypeLabel(account.type)} • {account.currency}
                </div>
              </div>

              <div className="sm:text-right">
                <div className="font-semibold">
                  {formatCurrency(balances.get(account.id) ?? 0, account.currency, {
                    showDecimals: settings.showDecimals,
                    language: settings.language,
                  })}
                </div>

                <button
                  className="mt-2 text-xs text-rose-600 hover:underline dark:text-rose-400"
                  onClick={() => onDeleteAccount(account.id)}
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} title={t("accounts.new")} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t("accounts.name")}
            </div>
            <Input
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder={t("accounts.placeholder")}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t("accounts.type")}
              </div>
              <Select
                value={type}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setType(e.target.value as AccountType)
                }
              >
                <option value="cash">{t("dashboard.accountType.cash")}</option>
                <option value="card">{t("dashboard.accountType.card")}</option>
                <option value="bank">{t("dashboard.accountType.bank")}</option>
              </Select>
            </div>

            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t("accounts.currency")}
              </div>
              <Select
                value={currency}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setCurrency(e.target.value)
                }
              >
                <option value="UAH">UAH (₴)</option>
                <option value="CZK">CZK (Kč)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </Select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button className="w-full sm:w-auto" onClick={onCreate}>
              {t("common.create")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
