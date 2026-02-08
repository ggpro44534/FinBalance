export type TransactionType = "income" | "expense" | "transfer";

export type Transaction = {
  id: string;
  type: TransactionType;

  amount: number;
  date: string;      // YYYY-MM-DD
  note?: string;

  accountId?: string;     // для income/expense
  categoryId?: string;    // для income/expense

  fromAccountId?: string; // для transfer
  toAccountId?: string;   // для transfer

  createdAt: string;
};
