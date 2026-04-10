import { Outlet, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Tags,
  DatabaseBackup,
  Settings,
  X,
} from "lucide-react";

import { useI18n } from "../i18n";

function MobileMenu({ onClose }: { onClose: () => void }) {
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
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 top-0 w-[min(20rem,calc(100vw-1rem))] overflow-y-auto border-r border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="font-bold text-lg">{t("common.appName")}</div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  ].join(" ")
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? "hidden" : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />

          <main className="p-3 pb-6 sm:p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </div>
  );
}
