export type AccountType = "cash" | "card" | "bank";

export type AccountProps = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  createdAt: string;
};

export class Account {
  public readonly id: string;
  public readonly name: string;
  public readonly type: AccountType;
  public readonly currency: string;
  public readonly createdAt: string;

  public constructor(props: AccountProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.currency = props.currency;
    this.createdAt = props.createdAt;
  }

  public isCash(): boolean {
    return this.type === "cash";
  }

  public isCard(): boolean {
    return this.type === "card";
  }

  public isBank(): boolean {
    return this.type === "bank";
  }
}