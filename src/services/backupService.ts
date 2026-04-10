import { db } from "../db/appDatabase";

import type { AccountProps } from "../models/Account";
import type { CategoryProps } from "../models/Category";
import type { TransactionProps } from "../models/Transaction";
import type { SettingsProps } from "../models/Settings";
import type { SavingsGoalProps } from "../models/SavingsGoal";
import { normalizeCategoryRecord } from "../lib/categoryUtils";

export type BackupPayload = {
  meta: {
    app: "FinBalance";
    dbName: "FinBalanceDB";
    version: number;
    exportedAt: string;
  };
  data: {
    accounts: AccountProps[];
    categories: CategoryProps[];
    transactions: TransactionProps[];
    settings: SettingsProps[];
    savingsGoals: SavingsGoalProps[];
  };
};

export class BackupService {
  public async exportData(): Promise<BackupPayload> {
    const [accounts, categories, transactions, settings, savingsGoals] = await Promise.all([
      db.accounts.toArray(),
      db.categories.toArray(),
      db.transactions.toArray(),
      db.settings.toArray(),
      db.savingsGoals.toArray(),
    ]);

    return {
      meta: {
        app: "FinBalance",
        dbName: "FinBalanceDB",
        version: 3,
        exportedAt: new Date().toISOString(),
      },
      data: { accounts, categories, transactions, settings, savingsGoals },
    };
  }

  public isValidBackup(payload: unknown): payload is BackupPayload {
    const v = payload as any;

    return (
      v &&
      v.meta?.app === "FinBalance" &&
      v.meta?.dbName === "FinBalanceDB" &&
      typeof v.meta?.version === "number" &&
      typeof v.meta?.exportedAt === "string" &&
      v.data &&
      Array.isArray(v.data.accounts) &&
      Array.isArray(v.data.categories) &&
      Array.isArray(v.data.transactions) &&
      Array.isArray(v.data.settings) &&
      Array.isArray(v.data.savingsGoals ?? [])
    );
  }

  public async restoreData(payload: BackupPayload): Promise<void> {
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

        await Promise.all([
          db.accounts.bulkPut(payload.data.accounts),
          db.categories.bulkPut(payload.data.categories.map(normalizeCategoryRecord)),
          db.transactions.bulkPut(payload.data.transactions),
          db.settings.bulkPut(payload.data.settings),
          db.savingsGoals.bulkPut(payload.data.savingsGoals ?? []),
        ]);
      }
    );
  }
}

export const backupService = new BackupService();
