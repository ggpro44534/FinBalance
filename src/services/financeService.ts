import { db } from "../db/appDatabase";

import { Account, type AccountProps } from "../models/Account";
import { Category, type CategoryProps } from "../models/Category";
import { Transaction, type TransactionProps } from "../models/Transaction";
import { UserSettings, type SettingsProps } from "../models/Settings";
import { SavingsGoal, type SavingsGoalProps } from "../models/SavingsGoal";

import { createId, toISODate } from "../lib/utils";
import {
  getDefaultCategoryPresets,
  normalizeCategoryRecord,
  sortCategories,
} from "../lib/categoryUtils";

export class FinanceService {
  private getDefaultSettings(): SettingsProps {
    return {
      id: "settings",
      firstDayOfWeek: 1,
      theme: "light",
      language: "uk",
      baseCurrency: "UAH",
      dateFormat: "dd.MM.yyyy",
      showDecimals: false,
      confirmBeforeDelete: true,
      startPage: "dashboard",
    };
  }

  private async ensureDefaultCategories(): Promise<void> {
    const existingCategories = await db.categories.toArray();
    const existingIds = new Set(existingCategories.map((category) => category.id));
    const missingCategories = getDefaultCategoryPresets().filter(
      (category) => !existingIds.has(category.id)
    );

    if (missingCategories.length > 0) {
      await db.categories.bulkPut(missingCategories);
    }

    const legacyCategories = existingCategories.filter((category) => !category.kind);
    if (legacyCategories.length > 0) {
      await db.categories.bulkPut(legacyCategories.map(normalizeCategoryRecord));
    }
  }

  public async ensureDefaults(): Promise<void> {
    const settings = await db.settings.get("settings");
    const defaultSettings = this.getDefaultSettings();

    if (!settings) {
      await db.settings.put(defaultSettings);
    } else {
      await db.settings.put({
        ...defaultSettings,
        ...settings,
      });
    }

    const accountsCount = await db.accounts.count();

    if (accountsCount === 0) {
      const now = new Date().toISOString();

      await db.accounts.bulkPut([
        {
          id: createId("acc"),
          name: "Готівка",
          type: "cash",
          currency: "UAH",
          createdAt: now,
        },
        {
          id: createId("acc"),
          name: "Картка",
          type: "card",
          currency: "UAH",
          createdAt: now,
        },
      ]);
    }

    await this.ensureDefaultCategories();
  }

  public async getAll() {
    const [accountsRaw, categoriesRaw, transactionsRaw, settingsArr, savingsRaw] =
      await Promise.all([
        db.accounts.toArray(),
        db.categories.toArray(),
        db.transactions.orderBy("date").reverse().toArray(),
        db.settings.toArray(),
        db.savingsGoals.orderBy("updatedAt").reverse().toArray(),
      ]);

    const accounts = accountsRaw.map((account) => new Account(account));
    const categories = sortCategories(
      categoriesRaw.map((category) => new Category(normalizeCategoryRecord(category)))
    );
    const transactions = transactionsRaw.map((transaction) => new Transaction(transaction));
    const savingsGoals = savingsRaw.map((goal) => new SavingsGoal(goal));

    const settingsRaw = {
      ...this.getDefaultSettings(),
      ...(settingsArr[0] ?? {}),
    };

    const settings = new UserSettings(settingsRaw);

    return { accounts, categories, transactions, settings, savingsGoals };
  }

  public async addAccount(input: Omit<AccountProps, "id" | "createdAt">) {
    const account: AccountProps = {
      id: createId("acc"),
      createdAt: new Date().toISOString(),
      ...input,
    };

    await db.accounts.put(account);
    return new Account(account);
  }

  public async updateAccount(id: string, patch: Partial<Omit<AccountProps, "id">>) {
    await db.accounts.update(id, patch);
  }

  public async deleteAccount(id: string) {
    await db.transaction("rw", db.accounts, db.transactions, async () => {
      await db.transactions.where("accountId").equals(id).delete();
      await db.transactions.where("fromAccountId").equals(id).delete();
      await db.transactions.where("toAccountId").equals(id).delete();
      await db.accounts.delete(id);
    });
  }

  public async addCategory(input: Omit<CategoryProps, "id">) {
    const category: CategoryProps = {
      id: createId("cat"),
      emoji: "🏷️",
      color: "#94a3b8",
      isSystem: false,
      sortOrder: Date.now(),
      ...input,
    };

    await db.categories.put(category);
    return new Category(category);
  }

  public async updateCategory(id: string, patch: Partial<Omit<CategoryProps, "id">>) {
    const current = await db.categories.get(id);
    if (!current) return;

    const safePatch =
      current.isSystem && current.kind === "group"
        ? {
            emoji: patch.emoji ?? current.emoji,
            color: patch.color ?? current.color,
          }
        : patch;

    await db.categories.update(id, safePatch);
  }

  public async deleteCategory(id: string) {
    await db.transaction("rw", db.categories, db.transactions, async () => {
      const target = await db.categories.get(id);
      if (!target || target.isSystem) return;

      const childCategories = await db.categories.where("parentId").equals(id).toArray();
      const idsToDelete = [id, ...childCategories.map((category) => category.id)];

      await db.transactions.where("categoryId").anyOf(idsToDelete).modify({
        categoryId: undefined,
      });

      await db.categories.bulkDelete(idsToDelete);
    });
  }

  public async addTransaction(
    input: Omit<TransactionProps, "id" | "createdAt" | "date"> & {
      date?: string;
    }
  ) {
    const transaction: TransactionProps = {
      id: createId("tx"),
      createdAt: new Date().toISOString(),
      date: input.date ?? toISODate(),
      ...input,
    };

    await db.transactions.put(transaction);
    return new Transaction(transaction);
  }

  public async deleteTransaction(id: string) {
    await db.transactions.delete(id);
  }

  public async addSavingsGoal(
    input: Omit<SavingsGoalProps, "id" | "createdAt" | "updatedAt">
  ) {
    const now = new Date().toISOString();
    const goal: SavingsGoalProps = {
      id: createId("goal"),
      createdAt: now,
      updatedAt: now,
      isArchived: false,
      emoji: "🎯",
      color: "#6366f1",
      ...input,
    };

    await db.savingsGoals.put(goal);
    return new SavingsGoal(goal);
  }

  public async updateSavingsGoal(
    id: string,
    patch: Partial<Omit<SavingsGoalProps, "id" | "createdAt">>
  ) {
    await db.savingsGoals.update(id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  }

  public async contributeToSavingsGoal(id: string, amountDelta: number) {
    const goal = await db.savingsGoals.get(id);
    if (!goal) return;

    const nextAmount = Math.max(0, goal.currentAmount + amountDelta);
    await this.updateSavingsGoal(id, { currentAmount: nextAmount });
  }

  public async deleteSavingsGoal(id: string) {
    await db.savingsGoals.delete(id);
  }

  public async updateSettings(patch: Partial<SettingsProps>) {
    const current = await db.settings.get("settings");

    await db.settings.put({
      ...this.getDefaultSettings(),
      ...(current ?? {}),
      ...patch,
    });
  }

  public async resetToFirstLaunch(): Promise<void> {
    await db.transaction(
      "rw",
      [db.accounts, db.categories, db.transactions, db.settings, db.savingsGoals],
      async () => {
        await Promise.all([
          db.accounts.clear(),
          db.categories.clear(),
          db.transactions.clear(),
          db.settings.clear(),
          db.savingsGoals.clear(),
        ]);
      }
    );

    await this.ensureDefaults();
  }
}

export const financeService = new FinanceService();
