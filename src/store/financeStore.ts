import "dexie-observable";
import { create } from "zustand";
import type { Account } from "../types/account";
import type { Category } from "../types/category";
import type { Transaction } from "../types/transaction";
import type { Settings } from "../types/settings";
import { db } from "../db/finbalanceDb";
import { ensureDefaults, getAll } from "../services/financeService";

type State = {
  loading: boolean;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  settings: Settings;

  init: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const useFinanceStore = create<State>((set, get) => ({
  loading: true,
  accounts: [],
  categories: [],
  transactions: [],
  settings: { id: "settings", mainCurrency: "UAH", firstDayOfWeek: 1 },

  init: async () => {
    set({ loading: true });
    await ensureDefaults();
    const all = await getAll();
    set({ ...all, loading: false });

    db.on("changes", async () => {
      await get().refresh();
    });
  },

  refresh: async () => {
    const all = await getAll();
    set({ ...all });
  },
}));
