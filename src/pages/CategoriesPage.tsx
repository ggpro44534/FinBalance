import { useState } from "react";
import type { ChangeEvent } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import { useFinanceStore } from "../store/financeStore";
import { addCategory, deleteCategory } from "../services/financeService";
import type { CategoryType } from "../types/category";

export default function CategoriesPage() {
  const { categories } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  const onCreate = async () => {
    if (!name.trim()) return;
    await addCategory({ name: name.trim(), type });
    setOpen(false);
    setName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Категорії</h1>
          <p className="text-sm text-slate-500">Доходи та витрати</p>
        </div>
        <Button onClick={() => setOpen(true)}>Додати категорію</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="font-semibold">Витрати</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {expense.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1 text-sm">
                {c.name}
                <button className="text-rose-600 hover:underline text-xs" onClick={() => deleteCategory(c.id)}>
                  видалити
                </button>
              </span>
            ))}
            {expense.length === 0 && <div className="text-sm text-slate-500">Немає категорій витрат.</div>}
          </div>
        </Card>

        <Card className="p-5">
          <div className="font-semibold">Доходи</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {income.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1 text-sm">
                {c.name}
                <button className="text-rose-600 hover:underline text-xs" onClick={() => deleteCategory(c.id)}>
                  видалити
                </button>
              </span>
            ))}
            {income.length === 0 && <div className="text-sm text-slate-500">Немає категорій доходу.</div>}
          </div>
        </Card>
      </div>

      <Modal open={open} title="Нова категорія" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-slate-600">Назва</div>
            <Input
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Напр. Здоров'я"
            />
          </div>

          <div>
            <div className="text-sm text-slate-600">Тип</div>
            <Select
              value={type}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setType(e.target.value as CategoryType)}
            >
              <option value="expense">Витрати</option>
              <option value="income">Дохід</option>
            </Select>
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
