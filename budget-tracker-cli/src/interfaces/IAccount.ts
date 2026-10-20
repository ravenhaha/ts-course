namespace BudgetTracker {
  export interface IAccount {
    id: number;
    name: string;
    addTransaction(transaction: ITransaction): void;
    removeTransactionById(transactionId: number): boolean;
    getTransactions(): ITransaction[];
  }
}
