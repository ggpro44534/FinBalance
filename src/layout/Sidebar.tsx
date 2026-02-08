import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  DatabaseBackup,
  Settings,
} from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/backup", label: "Backup", icon: DatabaseBackup },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col border-r bg-white">
      <div className="px-6 py-5 border-b">
        <div className="text-xl font-bold">FinBalance</div>
        <div className="text-xs text-gray-500 mt-1">Personal finance tracker</div>
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
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition",
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto p-4 text-xs text-gray-400">
        © {new Date().getFullYear()} FinBalance
      </div>
    </aside>
  );
}
