import { db } from "../db/finbalanceDb";
import type { Account } from "../types/account";
import type { Category } from "../types/category";
import type { Transaction } from "../types/transaction";
import type { Settings } from "../types/settings";
import { createId, toISODate } from "../lib/utils";

export async function ensureDefaults() {
  const settings = await db.settings.get("settings");
  if (!settings) {
    await db.settings.put({ id: "settings", mainCurrency: "UAH", firstDayOfWeek: 1 });
  }

  const accCount = await db.accounts.count();
  if (accCount === 0) {
    const now = new Date().toISOString();
    await db.accounts.bulkPut([
      { id: createId("acc"), name: "Готівка", type: "cash", currency: "UAH", createdAt: now },
      { id: createId("acc"), name: "Картка", type: "card", currency: "UAH", createdAt: now },
    ]);
  }

  const catCount = await db.categories.count();
  if (catCount === 0) {
    await db.categories.bulkPut([
      { id: createId("cat"), name: "Зарплата", type: "income", color: "#16a34a" },
      { id: createId("cat"), name: "Їжа", type: "expense", color: "#f97316" },
      { id: createId("cat"), name: "Транспорт", type: "expense", color: "#0ea5e9" },
      { id: createId("cat"), name: "Дім", type: "expense", color: "#a855f7" },
    ]);
  }
}

export async function getAll() {
  const [accounts, categories, transactions, settingsArr] = await Promise.all([
    db.accounts.toArray(),
    db.categories.toArray(),
    db.transactions.orderBy("date").reverse().toArray(),
    db.settings.toArray(),
  ]);

  const settings = settingsArr[0] ?? { id: "settings", mainCurrency: "UAH", firstDayOfWeek: 1 };
  return { accounts, categories, transactions, settings };
}

export async function addAccount(input: Omit<Account, "id" | "createdAt">) {
  const account: Account = { id: createId("acc"), createdAt: new Date().toISOString(), ...input };
  await db.accounts.put(account);
  return account;
}

export async function updateAccount(id: string, patch: Partial<Omit<Account, "id">>) {
  await db.accounts.update(id, patch);
}

export async function deleteAccount(id: string) {
  await db.transaction("rw", db.accounts, db.transactions, async () => {
    await db.transactions.where("accountId").equals(id).delete();
    await db.transactions.where("fromAccountId").equals(id).delete();
    await db.transactions.where("toAccountId").equals(id).delete();
    await db.accounts.delete(id);
  });
}

export async function addCategory(input: Omit<Category, "id">) {
  const category: Category = { id: createId("cat"), ...input };
  await db.categories.put(category);
  return category;
}

export async function deleteCategory(id: string) {
  await db.transaction("rw", db.categories, db.transactions, async () => {
    await db.transactions.where("categoryId").equals(id).modify({ categoryId: undefined });
    await db.categories.delete(id);
  });
}

export async function addTransaction(
  input: Omit<Transaction, "id" | "createdAt" | "date"> & { date?: string }
) {
  const tx: Transaction = {
    id: createId("tx"),
    createdAt: new Date().toISOString(),
    date: input.date ?? toISODate(),
    ...input,
  };

  await db.transactions.put(tx);
  return tx;
}

export async function deleteTransaction(id: string) {
  await db.transactions.delete(id);
}

export async function updateSettings(patch: Partial<Settings>) {
  await db.settings.put({ id: "settings", mainCurrency: "UAH", firstDayOfWeek: 1, ...patch });
}

export function computeTotals(transactions: Transaction[]) {
  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    if (t.type === "expense") expense += t.amount;
  }

  return { income, expense, balance: income - expense };
}

export function computeAccountBalances(accounts: Account[], transactions: Transaction[]) {
  const map = new Map<string, number>();
  for (const a of accounts) map.set(a.id, 0);

  for (const t of transactions) {
    if (t.type === "income" && t.accountId) {
      map.set(t.accountId, (map.get(t.accountId) ?? 0) + t.amount);
    }
    if (t.type === "expense" && t.accountId) {
      map.set(t.accountId, (map.get(t.accountId) ?? 0) - t.amount);
    }
    if (t.type === "transfer" && t.fromAccountId && t.toAccountId) {
      map.set(t.fromAccountId, (map.get(t.fromAccountId) ?? 0) - t.amount);
      map.set(t.toAccountId, (map.get(t.toAccountId) ?? 0) + t.amount);
    }
  }

  return map;
}
