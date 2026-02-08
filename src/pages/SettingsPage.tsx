import type { ChangeEvent } from "react";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import { useFinanceStore } from "../store/financeStore";
import { updateSettings } from "../services/financeService";
import type { Settings } from "../types/settings";

export default function SettingsPage() {
  const { settings } = useFinanceStore();

  const onCurrencyChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ mainCurrency: e.target.value } as Partial<Settings>);
  };

  const onFirstDayChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ firstDayOfWeek: Number(e.target.value) as Settings["firstDayOfWeek"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Налаштування</h1>
        <p className="text-sm text-slate-500">Валюта та параметри інтерфейсу</p>
      </div>

      <Card className="p-5 space-y-4">
        <div>
          <div className="text-sm text-slate-600">Основна валюта</div>
          <div className="mt-2 max-w-xs">
            <Select value={settings.mainCurrency} onChange={onCurrencyChange}>
              <option value="UAH">UAH (₴)</option>
              <option value="CZK">CZK (Kč)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </Select>
          </div>
        </div>

        <div>
          <div className="text-sm text-slate-600">Перший день тижня</div>
          <div className="mt-2 max-w-xs">
            <Select value={String(settings.firstDayOfWeek)} onChange={onFirstDayChange}>
              <option value="1">Понеділок</option>
              <option value="7">Неділя</option>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
}
