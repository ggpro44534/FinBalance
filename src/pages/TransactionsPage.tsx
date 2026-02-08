import { useMemo, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import { useFinanceStore } from "../store/financeStore";
import { addTransaction, deleteTransaction } from "../services/financeService";
import { formatCurrency, toISODate } from "../lib/utils";

type TxType = "" | "income" | "expense" | "transfer";
type FormType = "income" | "expense" | "transfer";

export default function TransactionsPage() {
  const { accounts, categories, transactions, settings } = useFinanceStore();

  const [open, setOpen] = useState(false);

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<TxType>("");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter && t.type !== typeFilter) return false;

      if (q.trim()) {
        const s = q.toLowerCase();
        const note = (t.note ?? "").toLowerCase();
        if (!note.includes(s) && !String(t.amount).includes(s) && !t.date.includes(s)) return false;
      }
      return true;
    });
  }, [transactions, q, typeFilter]);

  const [formType, setFormType] = useState<FormType>("expense");
  const [amount, setAmount] = useState<string>("0");
  const [date, setDate] = useState<string>(toISODate());
  const [note, setNote] = useState<string>("");

  const expenseCats = useMemo(() => categories.filter((c) => c.type === "expense"), [categories]);
  const incomeCats = useMemo(() => categories.filter((c) => c.type === "income"), [categories]);

  const defaultExpenseCat = expenseCats[0]?.id ?? "";
  const defaultIncomeCat = incomeCats[0]?.id ?? "";
  const defaultAccount = accounts[0]?.id ?? "";
  const secondAccount = accounts[1]?.id ?? defaultAccount;

  const [accountId, setAccountId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");

  useEffect(() => {
    if (!accountId && defaultAccount) setAccountId(defaultAccount);
    if (!fromAccountId && defaultAccount) setFromAccountId(defaultAccount);
    if (!toAccountId && secondAccount) setToAccountId(secondAccount);

    if (!categoryId) {
      setCategoryId(formType === "income" ? defaultIncomeCat : defaultExpenseCat);
    }
  }, [
    accountId,
    categoryId,
    fromAccountId,
    toAccountId,
    defaultAccount,
    secondAccount,
    defaultExpenseCat,
    defaultIncomeCat,
    formType,
  ]);

  const onCreate = async () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;

    if (formType === "transfer") {
      if (!fromAccountId || !toAccountId || fromAccountId === toAccountId) return;
      await addTransaction({
        type: "transfer",
        amount: n,
        date,
        note,
        fromAccountId,
        toAccountId,
      });
    } else {
      if (!accountId || !categoryId) return;
      await addTransaction({
        type: formType,
        amount: n,
        date,
        note,
        accountId,
        categoryId,
      });
    }

    setOpen(false);
    setAmount("0");
    setNote("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Транзакції</h1>
          <p className="text-sm text-slate-500">Дохід, витрати та перекази</p>
        </div>
        <Button onClick={() => setOpen(true)}>Додати транзакцію</Button>
      </div>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Пошук (нотатка, сума, дата)..."
            value={q}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
          />

          <Select
            value={typeFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value as TxType)}
          >
            <option value="">Усі типи</option>
            <option value="expense">Витрати</option>
            <option value="income">Дохід</option>
            <option value="transfer">Переказ</option>
          </Select>

          <Button
            variant="secondary"
            onClick={() => {
              setQ("");
              setTypeFilter("");
            }}
          >
            Очистити
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Список</h2>

        <div className="mt-4 space-y-2">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border px-3 py-2">
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900">
                  {t.type === "income" ? "Дохід" : t.type === "expense" ? "Витрата" : "Переказ"}
                  <span className="text-slate-500 font-normal"> • {t.date}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{t.note || "Без нотатки"}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold">
                  {formatCurrency(t.amount, settings.mainCurrency)}
                </div>
                <button
                  className="text-xs text-rose-600 hover:underline"
                  onClick={() => deleteTransaction(t.id)}
                >
                  видалити
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-sm text-slate-500">Немає транзакцій за цими фільтрами.</div>
          )}
        </div>
      </Card>

      <Modal open={open} title="Додати транзакцію" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={formType === "expense" ? "primary" : "secondary"}
              onClick={() => {
                setFormType("expense");
                setCategoryId(defaultExpenseCat);
              }}
            >
              Витрата
            </Button>

            <Button
              variant={formType === "income" ? "primary" : "secondary"}
              onClick={() => {
                setFormType("income");
                setCategoryId(defaultIncomeCat);
              }}
            >
              Дохід
            </Button>

            <Button
              variant={formType === "transfer" ? "primary" : "secondary"}
              onClick={() => setFormType("transfer")}
            >
              Переказ
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-slate-600">Сума</div>
              <Input
                value={amount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                inputMode="decimal"
              />
            </div>

            <div>
              <div className="text-sm text-slate-600">Дата</div>
              <Input
                type="date"
                value={date}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
              />
            </div>
          </div>

          {formType !== "transfer" ? (
            <>
              <div>
                <div className="text-sm text-slate-600">Рахунок</div>
                <Select
                  value={accountId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setAccountId(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="text-sm text-slate-600">Категорія</div>
                <Select
                  value={categoryId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value)}
                >
                  {(formType === "expense" ? expenseCats : incomeCats).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-slate-600">З рахунку</div>
                <Select
                  value={fromAccountId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFromAccountId(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="text-sm text-slate-600">На рахунок</div>
                <Select
                  value={toAccountId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setToAccountId(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          <div>
            <div className="text-sm text-slate-600">Нотатка</div>
            <Input
              value={note}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
              placeholder="Напр. обід"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={onCreate}>Зберегти</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
