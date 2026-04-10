import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "../layout/AppShell";

import DashboardPage from "../pages/DashboardPage";
import TransactionsPage from "../pages/TransactionsPage";
import AccountsPage from "../pages/AccountsPage";
import CategoriesPage from "../pages/CategoriesPage";
import BackupPage from "../pages/BackupPage";
import SettingsPage from "../pages/SettingsPage";
import SavingsPage from "../pages/SavingsPage";
import { useFinanceStore } from "../store/financeStore";

export default function AppRouter() {
  const startPage = useFinanceStore((state) => state.settings.startPage);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to={startPage} replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="savings" element={<SavingsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="backup" element={<BackupPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
