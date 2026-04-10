import Dexie from "dexie";
import type { Table } from "dexie";

import type { AccountProps } from "../models/Account";
import type { CategoryProps } from "../models/Category";
import type { TransactionProps } from "../models/Transaction";
import type { SettingsProps } from "../models/Settings";
import type { SavingsGoalProps } from "../models/SavingsGoal";
import {
  getDefaultCategoryPresets,
  normalizeCategoryRecord,
} from "../lib/categoryUtils";

class AppDatabase extends Dexie {
  public accounts!: Table<AccountProps, string>;
  public categories!: Table<CategoryProps, string>;
  public transactions!: Table<TransactionProps, string>;
  public settings!: Table<SettingsProps, string>;
  public savingsGoals!: Table<SavingsGoalProps, string>;

  public constructor() {
    super("FinBalanceDB");

    this.version(1).stores({
      accounts: "id, name, type, currency, createdAt",
      categories: "id, name, type",
      transactions:
        "id, type, date, amount, accountId, categoryId, fromAccountId, toAccountId, createdAt",
      settings: "id",
    });

    this.version(2)
      .stores({
        accounts: "id, name, type, currency, createdAt",
        categories: "id, name, type",
        transactions:
          "id, type, date, amount, accountId, categoryId, fromAccountId, toAccountId, createdAt",
        settings: "id",
      })
      .upgrade(async (tx) => {
        const settings = await tx.table("settings").get("settings");
        if (settings) {
          await tx.table("settings").put({
            id: "settings",
            firstDayOfWeek: settings.firstDayOfWeek ?? 1,
            theme: settings.theme ?? "light",
            language: settings.language ?? "uk",
            baseCurrency: settings.baseCurrency ?? "UAH",
            dateFormat: settings.dateFormat ?? "dd.MM.yyyy",
            showDecimals: settings.showDecimals ?? false,
            confirmBeforeDelete: settings.confirmBeforeDelete ?? true,
            startPage: settings.startPage ?? "dashboard",
          });
        }
      });

    this.version(3)
      .stores({
        accounts: "id, name, type, currency, createdAt",
        categories: "id, name, type",
        transactions:
          "id, type, date, amount, accountId, categoryId, fromAccountId, toAccountId, createdAt",
        settings: "id",
      })
      .upgrade(async (tx) => {
        const settings = await tx.table("settings").get("settings");

        await tx.table("settings").put({
          id: "settings",
          firstDayOfWeek: settings?.firstDayOfWeek ?? 1,
          theme: settings?.theme ?? "light",
          language: settings?.language ?? "uk",
          baseCurrency: settings?.baseCurrency ?? "UAH",
          dateFormat: settings?.dateFormat ?? "dd.MM.yyyy",
          showDecimals: settings?.showDecimals ?? false,
          confirmBeforeDelete: settings?.confirmBeforeDelete ?? true,
          startPage: settings?.startPage ?? "dashboard",
        });
      });

    this.version(4)
      .stores({
        accounts: "id, name, type, currency, createdAt",
        categories: "id, type, kind, parentId, isSystem, sortOrder, name",
        transactions:
          "id, type, date, amount, accountId, categoryId, fromAccountId, toAccountId, createdAt",
        settings: "id",
      })
      .upgrade(async (tx) => {
        const categoryTable = tx.table<CategoryProps>("categories");
        const existingCategories = await categoryTable.toArray();
        const existingById = new Set(existingCategories.map((category) => category.id));
        const defaults = getDefaultCategoryPresets();

        for (const preset of defaults) {
          if (!existingById.has(preset.id)) {
            await categoryTable.put(preset);
          }
        }

        for (const category of existingCategories) {
          await categoryTable.put(normalizeCategoryRecord(category));
        }
      });

    this.version(5)
      .stores({
        accounts: "id, name, type, currency, createdAt",
        categories: "id, type, kind, parentId, isSystem, sortOrder, name",
        transactions:
          "id, type, date, amount, accountId, categoryId, fromAccountId, toAccountId, createdAt",
        settings: "id",
        savingsGoals: "id, name, currency, isArchived, targetDate, createdAt, updatedAt",
      })
      .upgrade(async (tx) => {
        const settings = await tx.table("settings").get("settings");

        await tx.table("settings").put({
          id: "settings",
          firstDayOfWeek: settings?.firstDayOfWeek ?? 1,
          theme: settings?.theme ?? "light",
          language: settings?.language ?? "uk",
          baseCurrency: settings?.baseCurrency ?? "UAH",
          dateFormat: settings?.dateFormat ?? "dd.MM.yyyy",
          showDecimals: settings?.showDecimals ?? false,
          confirmBeforeDelete: settings?.confirmBeforeDelete ?? true,
          startPage:
            settings?.startPage === "dashboard" ||
            settings?.startPage === "transactions" ||
            settings?.startPage === "accounts" ||
            settings?.startPage === "savings"
              ? settings.startPage
              : "dashboard",
        });
      });

    this.version(6)
      .stores({
        accounts: "id, name, type, currency, createdAt",
        categories: "id, type, kind, parentId, isSystem, sortOrder, name",
        transactions:
          "id, type, date, amount, accountId, categoryId, fromAccountId, toAccountId, createdAt",
        settings: "id",
        savingsGoals: "id, name, currency, isArchived, targetDate, createdAt, updatedAt",
      })
      .upgrade(async (tx) => {
        const settings = await tx.table("settings").get("settings");

        await tx.table("settings").put({
          id: "settings",
          firstDayOfWeek: settings?.firstDayOfWeek ?? 1,
          theme: settings?.theme ?? "light",
          language: settings?.language ?? "uk",
          baseCurrency: settings?.baseCurrency ?? "UAH",
          dateFormat: settings?.dateFormat ?? "dd.MM.yyyy",
          showDecimals: settings?.showDecimals ?? false,
          confirmBeforeDelete: settings?.confirmBeforeDelete ?? true,
          startPage:
            settings?.startPage === "dashboard" ||
            settings?.startPage === "transactions" ||
            settings?.startPage === "accounts" ||
            settings?.startPage === "savings"
              ? settings.startPage
              : "dashboard",
        });
      });
  }
}

export const db = new AppDatabase();
