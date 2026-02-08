export type AccountType = "cash" | "card" | "bank";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  createdAt: string;
};
