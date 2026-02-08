import Dexie from "dexie";
import type { Table } from "dexie";

import type { Account } from "../types/account";
import type { Category } from "../types/category";
import type { Transaction } from "../types/transaction";
import type { Settings } from "../types/settings";

class FinBalanceDb extends Dexie {
  accounts!: Table<Account, string>;
  categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super("FinBalanceDB");
    this.version(1).stores({
      accounts: "id, name, type, currency, createdAt",
      categories: "id, name, type",
      transactions: "id, type, date, amount, accountId, categoryId, fromAccountId, toAccountId, createdAt",
      settings: "id",
    });
  }
}

export const db = new FinBalanceDb();
