import { Menu } from "lucide-react";

export default function Topbar({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu: () => void;
}) {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b bg-white">
      <button
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100"
        onClick={onOpenMobileMenu}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="font-semibold">FinBalance</div>

      <div className="text-sm text-gray-500">Local (IndexedDB)</div>
    </header>
  );
}
