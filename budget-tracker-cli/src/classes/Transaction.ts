namespace BudgetTracker {
  export class Transaction implements ITransaction {
    constructor(
      public id: number,
      public amount: number,
      public type: TransactionType,
      public date: string,
      public description: string
    ) {}
  
    toString(): string {
      return `Транзакция #${this.id}: ${this.description} (${this.type === "income" ? "доход" : "расход"} ${this.amount} ₽) | ${this.date.slice(0, 10)}`;
    }
  }
}
