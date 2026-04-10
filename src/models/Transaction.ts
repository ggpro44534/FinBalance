export type TransactionType = "income" | "expense" | "transfer";

export type TransactionProps = {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  note?: string;
  accountId?: string;
  categoryId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  createdAt: string;
};

export class Transaction {
  public readonly id: string;
  public readonly type: TransactionType;
  public readonly amount: number;
  public readonly date: string;
  public readonly note?: string;
  public readonly accountId?: string;
  public readonly categoryId?: string;
  public readonly fromAccountId?: string;
  public readonly toAccountId?: string;
  public readonly createdAt: string;

  public constructor(props: TransactionProps) {
    this.id = props.id;
    this.type = props.type;
    this.amount = props.amount;
    this.date = props.date;
    this.note = props.note;
    this.accountId = props.accountId;
    this.categoryId = props.categoryId;
    this.fromAccountId = props.fromAccountId;
    this.toAccountId = props.toAccountId;
    this.createdAt = props.createdAt;
  }

  public isIncome(): boolean {
    return this.type === "income";
  }

  public isExpense(): boolean {
    return this.type === "expense";
  }

  public isTransfer(): boolean {
    return this.type === "transfer";
  }
}