import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Tags,
  DatabaseBackup,
  Settings,
} from "lucide-react";

import { useI18n } from "../i18n";

export default function Sidebar() {
  const { t } = useI18n();

  const nav = [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/transactions", label: t("nav.transactions"), icon: ArrowLeftRight },
    { to: "/accounts", label: t("nav.accounts"), icon: Wallet },
    { to: "/savings", label: t("nav.savings"), icon: PiggyBank },
    { to: "/categories", label: t("nav.categories"), icon: Tags },
    { to: "/backup", label: t("nav.backup"), icon: DatabaseBackup },
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <aside className="hidden border-r border-slate-200 bg-white text-slate-900 md:flex md:w-72 md:flex-col dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
        <div className="text-xl font-bold">{t("common.appName")}</div>
        <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          {t("common.personalFinanceTracker")}
        </div>
      </div>

      <nav className="p-3">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-gray-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800",
                ].join(" ")
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto p-4 text-xs text-gray-400 dark:text-slate-500">
        © {new Date().getFullYear()} {t("common.appName")}
      </div>
    </aside>
  );
}
