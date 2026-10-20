namespace BudgetTracker {
  export interface ITransaction {
    id: number;
    amount: number;
    type: TransactionType;
    date: string;
    description: string;
  }
}
