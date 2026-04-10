import { Transaction } from "../models/Transaction";

export type TransactionSortDirection = "asc" | "desc";

export type TransactionQueryParams = {
  searchText?: string;
  type?: "income" | "expense" | "transfer" | "";
  accountId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortDirection?: TransactionSortDirection;
  limit?: number;
};

export class TransactionQueryService {
  public filter(
    transactions: Transaction[],
    params: TransactionQueryParams
  ): Transaction[] {
    const {
      searchText = "",
      type = "",
      accountId,
      categoryId,
      dateFrom,
      dateTo,
    } = params;

    const normalizedSearchText = searchText.trim().toLowerCase();

    return transactions.filter((transaction) => {
      if (type && transaction.type !== type) {
        return false;
      }

      if (accountId) {
        const belongsToAccount =
          transaction.accountId === accountId ||
          transaction.fromAccountId === accountId ||
          transaction.toAccountId === accountId;

        if (!belongsToAccount) {
          return false;
        }
      }

      if (categoryId && transaction.categoryId !== categoryId) {
        return false;
      }

      if (dateFrom && transaction.date < dateFrom) {
        return false;
      }

      if (dateTo && transaction.date > dateTo) {
        return false;
      }

      if (normalizedSearchText) {
        const searchableValues = [
          transaction.note ?? "",
          transaction.date,
          String(transaction.amount),
          transaction.type,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableValues.includes(normalizedSearchText)) {
          return false;
        }
      }

      return true;
    });
  }

  public sortByDate(
    transactions: Transaction[],
    direction: TransactionSortDirection = "desc"
  ): Transaction[] {
    return [...transactions].sort((first, second) => {
      const result = first.date.localeCompare(second.date);

      return direction === "asc" ? result : -result;
    });
  }

  public limit(transactions: Transaction[], count: number): Transaction[] {
    return transactions.slice(0, count);
  }

  public execute(
    transactions: Transaction[],
    params: TransactionQueryParams
  ): Transaction[] {
    const filteredTransactions = this.filter(transactions, params);
    const sortedTransactions = this.sortByDate(
      filteredTransactions,
      params.sortDirection ?? "desc"
    );

    if (!params.limit) {
      return sortedTransactions;
    }

    return this.limit(sortedTransactions, params.limit);
  }

  public getRecentTransactions(
    transactions: Transaction[],
    count: number = 5
  ): Transaction[] {
    return this.execute(transactions, {
      sortDirection: "desc",
      limit: count,
    });
  }
}

export const transactionQueryService = new TransactionQueryService();