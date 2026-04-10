export type SavingsGoalProps = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: string;
  note?: string;
  emoji?: string;
  color?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
};

export class SavingsGoal {
  public readonly id: string;
  public readonly name: string;
  public readonly targetAmount: number;
  public readonly currentAmount: number;
  public readonly currency: string;
  public readonly targetDate?: string;
  public readonly note?: string;
  public readonly emoji?: string;
  public readonly color?: string;
  public readonly isArchived: boolean;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  public constructor(props: SavingsGoalProps) {
    this.id = props.id;
    this.name = props.name;
    this.targetAmount = props.targetAmount;
    this.currentAmount = props.currentAmount;
    this.currency = props.currency;
    this.targetDate = props.targetDate;
    this.note = props.note;
    this.emoji = props.emoji;
    this.color = props.color;
    this.isArchived = props.isArchived ?? false;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public getProgressPercentage(): number {
    if (this.targetAmount <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, (this.currentAmount / this.targetAmount) * 100));
  }

  public getRemainingAmount(): number {
    return Math.max(0, this.targetAmount - this.currentAmount);
  }

  public isCompleted(): boolean {
    return this.currentAmount >= this.targetAmount;
  }
}
