import type { ChangeEvent } from "react";
import { Account } from "../../models/Account";
import { useI18n } from "../../i18n";

export type DashboardAccountFilterType =
  | "all"
  | "cash"
  | "card"
  | "bank"
  | `account:${string}`;

type DashboardAccountFilterProps = {
  value: DashboardAccountFilterType;
  onChange: (value: DashboardAccountFilterType) => void;
  accounts: Account[];
};

export default function DashboardAccountFilter({
  value,
  onChange,
  accounts,
}: DashboardAccountFilterProps) {
  const { t } = useI18n();

  return (
    <div className="relative w-full md:w-[320px]">
      <select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          onChange(e.target.value as DashboardAccountFilterType)
        }
        className="w-full appearance-none rounded-full border-2 border-slate-300 bg-slate-50 px-5 py-3 pr-12 text-base text-slate-900 shadow-sm outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
      >
        <option value="all">{t("dashboard.filter.accounts.all")}</option>
        <option value="cash">{t("dashboard.filter.accounts.cash")}</option>
        <option value="card">{t("dashboard.filter.accounts.card")}</option>
        <option value="bank">{t("dashboard.filter.accounts.bank")}</option>

        {accounts.map((account) => (
          <option key={account.id} value={`account:${account.id}`}>
            {account.name}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500 dark:text-slate-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </div>
  );
}
