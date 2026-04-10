import { Menu } from "lucide-react";

import { useI18n } from "../i18n";

export default function Topbar({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu: () => void;
}) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-3 text-slate-900 backdrop-blur md:px-6 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100">
      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 md:hidden"
        onClick={onOpenMobileMenu}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="truncate px-3 font-semibold">{t("common.appName")}</div>
      <div className="h-10 w-10 md:hidden" />
    </header>
  );
}
