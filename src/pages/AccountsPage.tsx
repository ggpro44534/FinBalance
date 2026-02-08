import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import { useFinanceStore } from "../store/financeStore";
import { computeAccountBalances, deleteAccount, addAccount } from "../services/financeService";
import { formatCurrency } from "../lib/utils";
import type { AccountType } from "../types/account";

export default function AccountsPage() {
  const { accounts, transactions, settings } = useFinanceStore();
  const balances = useMemo(() => computeAccountBalances(accounts, transactions), [accounts, transactions]);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("cash");
  const [currency, setCurrency] = useState(settings.mainCurrency);

  const onCreate = async () => {
    if (!name.trim()) return;
    await addAccount({ name: name.trim(), type, currency });
    setOpen(false);
    setName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Рахунки</h1>
          <p className="text-sm text-slate-500">Керуй готівкою, картками та банками</p>
        </div>
        <Button onClick={() => setOpen(true)}>Додати рахунок</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{a.name}</div>
                <div className="text-sm text-slate-500">
                  {a.type === "cash" ? "Готівка" : a.type === "card" ? "Картка" : "Банк"} • {a.currency}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(balances.get(a.id) ?? 0, a.currency)}
                </div>
                <button
                  className="mt-2 text-xs text-rose-600 hover:underline"
                  onClick={() => deleteAccount(a.id)}
                >
                  Видалити
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} title="Новий рахунок" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-slate-600">Назва</div>
            <Input
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Напр. Monobank"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-slate-600">Тип</div>
              <Select
                value={type}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setType(e.target.value as AccountType)}
              >
                <option value="cash">Готівка</option>
                <option value="card">Картка</option>
                <option value="bank">Банк</option>
              </Select>
            </div>

            <div>
              <div className="text-sm text-slate-600">Валюта</div>
              <Select
                value={currency}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value)}
              >
                <option value="UAH">UAH (₴)</option>
                <option value="CZK">CZK (Kč)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={onCreate}>Створити</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
