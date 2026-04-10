import { Account } from "../models/Account";
import type { AppCurrency } from "../models/Settings";
import { Transaction } from "../models/Transaction";
import { convertCurrency } from "../lib/utils";

export class StatisticsService {
  private getTransactionCurrency(
    transaction: Transaction,
    accountCurrencyMap: Map<string, AppCurrency>
  ): AppCurrency {
    if (transaction.accountId) {
      return accountCurrencyMap.get(transaction.accountId) ?? "UAH";
    }

    if (transaction.fromAccountId) {
      return accountCurrencyMap.get(transaction.fromAccountId) ?? "UAH";
    }

    if (transaction.toAccountId) {
      return accountCurrencyMap.get(transaction.toAccountId) ?? "UAH";
    }

    return "UAH";
  }

  public calculateTotals(transactions: Transaction[]) {
    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      if (t.isIncome()) income += t.amount;
      if (t.isExpense()) expense += t.amount;
    }

    return {
      income,
      expense,
      balance: income - expense,
    };
  }

  public calculateTotalsInCurrency(
    transactions: Transaction[],
    accounts: Account[],
    targetCurrency: AppCurrency
  ) {
    const accountCurrencyMap = new Map<string, AppCurrency>();

    for (const account of accounts) {
      accountCurrencyMap.set(account.id, account.currency as AppCurrency);
    }

    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      const transactionCurrency = this.getTransactionCurrency(
        t,
        accountCurrencyMap
      );
      const convertedAmount = convertCurrency(
        t.amount,
        transactionCurrency,
        targetCurrency
      );

      if (t.isIncome()) income += convertedAmount;
      if (t.isExpense()) expense += convertedAmount;
    }

    return {
      income,
      expense,
      balance: income - expense,
    };
  }

  public calculateAccountBalances(
    accounts: Account[],
    transactions: Transaction[]
  ) {
    const map = new Map<string, number>();

    for (const account of accounts) {
      map.set(account.id, 0);
    }

    for (const t of transactions) {
      if (t.isIncome() && t.accountId) {
        map.set(t.accountId, (map.get(t.accountId) ?? 0) + t.amount);
      }

      if (t.isExpense() && t.accountId) {
        map.set(t.accountId, (map.get(t.accountId) ?? 0) - t.amount);
      }

      if (t.isTransfer() && t.fromAccountId && t.toAccountId) {
        map.set(t.fromAccountId, (map.get(t.fromAccountId) ?? 0) - t.amount);
        map.set(t.toAccountId, (map.get(t.toAccountId) ?? 0) + t.amount);
      }
    }

    return map;
  }
}

export const statisticsService = new StatisticsService();
