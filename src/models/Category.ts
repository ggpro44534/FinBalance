export type CategoryType = "income" | "expense";
export type CategoryKind = "group" | "subcategory";

export type CategoryProps = {
  id: string;
  name: string;
  type: CategoryType;
  kind: CategoryKind;
  parentId?: string;
  color?: string;
  emoji?: string;
  isSystem?: boolean;
  sortOrder?: number;
};

export class Category {
  public readonly id: string;
  public readonly name: string;
  public readonly type: CategoryType;
  public readonly kind: CategoryKind;
  public readonly parentId?: string;
  public readonly color?: string;
  public readonly emoji?: string;
  public readonly isSystem: boolean;
  public readonly sortOrder: number;

  public constructor(props: CategoryProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.kind = props.kind;
    this.parentId = props.parentId;
    this.color = props.color;
    this.emoji = props.emoji;
    this.isSystem = props.isSystem ?? false;
    this.sortOrder = props.sortOrder ?? 0;
  }

  public isIncome(): boolean {
    return this.type === "income";
  }

  public isExpense(): boolean {
    return this.type === "expense";
  }

  public isGroup(): boolean {
    return this.kind === "group";
  }

  public isSubcategory(): boolean {
    return this.kind === "subcategory";
  }

  public isDeletable(): boolean {
    return !this.isSystem;
  }
}
