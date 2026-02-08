import { db } from "../db/finbalanceDb";
import type { Account } from "../types/account";
import type { Category } from "../types/category";
import type { Transaction } from "../types/transaction";
import type { Settings } from "../types/settings";

export type BackupPayload = {
  meta: {
    app: "FinBalance";
    dbName: "FinBalanceDB";
    version: 1;
    exportedAt: string;
  };
  data: {
    accounts: Account[];
    categories: Category[];
    transactions: Transaction[];
    settings: Settings[];
  };
};

export async function exportBackup(): Promise<BackupPayload> {
  const [accounts, categories, transactions, settings] = await Promise.all([
    db.accounts.toArray(),
    db.categories.toArray(),
    db.transactions.toArray(),
    db.settings.toArray(),
  ]);

  return {
    meta: {
      app: "FinBalance",
      dbName: "FinBalanceDB",
      version: 1,
      exportedAt: new Date().toISOString(),
    },
    data: { accounts, categories, transactions, settings },
  };
}

export function isBackupPayload(x: unknown): x is BackupPayload {
  const v = x as any;
  return (
    v &&
    v.meta?.app === "FinBalance" &&
    v.meta?.dbName === "FinBalanceDB" &&
    v.meta?.version === 1 &&
    typeof v.meta?.exportedAt === "string" &&
    v.data &&
    Array.isArray(v.data.accounts) &&
    Array.isArray(v.data.categories) &&
    Array.isArray(v.data.transactions) &&
    Array.isArray(v.data.settings)
  );
}

export async function restoreBackup(payload: BackupPayload) {
  await db.transaction("rw", db.accounts, db.categories, db.transactions, db.settings, async () => {
    await Promise.all([
      db.accounts.clear(),
      db.categories.clear(),
      db.transactions.clear(),
      db.settings.clear(),
    ]);

    await Promise.all([
      db.accounts.bulkPut(payload.data.accounts),
      db.categories.bulkPut(payload.data.categories),
      db.transactions.bulkPut(payload.data.transactions),
      db.settings.bulkPut(payload.data.settings),
    ]);
  });
}
