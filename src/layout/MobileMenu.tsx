import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { useUiStore } from "../store/uiStore";

type NavigationItem = {
  label: string;
  to: string;
};

const navigationItems: NavigationItem[] = [
  { label: "Огляд", to: "/" },
  { label: "Транзакції", to: "/transactions" },
  { label: "Рахунки", to: "/accounts" },
  { label: "Категорії", to: "/categories" },
  { label: "Налаштування", to: "/settings" },
  { label: "Резервна копія", to: "/backup" },
];

export default function MobileMenu() {
  const location = useLocation();

  const isMobileMenuOpen = useUiStore((state) => state.isMobileMenuOpen);
  const closeMobileMenu = useUiStore((state) => state.closeMobileMenu);

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  if (!isMobileMenuOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Закрити мобільне меню"
        className="absolute inset-0 bg-slate-900/40"
        onClick={closeMobileMenu}
      />

      <div className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-lg font-semibold text-slate-900">
              FinBalance
            </div>
            <div className="text-xs text-slate-500">Меню навігації</div>
          </div>

          <button
            type="button"
            aria-label="Закрити меню"
            onClick={closeMobileMenu}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}