import "dexie-observable";
import { create } from "zustand";

import { Account } from "../models/Account";
import { Category } from "../models/Category";
import { Transaction } from "../models/Transaction";
import { UserSettings } from "../models/Settings";
import { SavingsGoal } from "../models/SavingsGoal";

import { db } from "../db/appDatabase";
import { financeService } from "../services/financeService";

type State = {
  loading: boolean;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  settings: UserSettings;

  init: () => Promise<void>;
  refresh: () => Promise<void>;
};

let isSubscribedToChanges = false;

export const useFinanceStore = create<State>((set, get) => ({
  loading: true,
  accounts: [],
  categories: [],
  transactions: [],
  savingsGoals: [],
  settings: new UserSettings({
    id: "settings",
    firstDayOfWeek: 1,
    theme: "light",
    language: "uk",
    baseCurrency: "UAH",
    dateFormat: "dd.MM.yyyy",
    showDecimals: false,
    confirmBeforeDelete: true,
    startPage: "dashboard",
  }),

  init: async () => {
    set({ loading: true });

    await financeService.ensureDefaults();

    const all = await financeService.getAll();

    set({
      accounts: all.accounts,
      categories: all.categories,
      transactions: all.transactions,
      savingsGoals: all.savingsGoals,
      settings: all.settings,
      loading: false,
    });

    if (!isSubscribedToChanges) {
      db.on("changes", async () => {
        await get().refresh();
      });
      isSubscribedToChanges = true;
    }
  },

  refresh: async () => {
    const all = await financeService.getAll();

    set({
      accounts: all.accounts,
      categories: all.categories,
      transactions: all.transactions,
      savingsGoals: all.savingsGoals,
      settings: all.settings,
    });
  },
}));
