import type { ITransaction } from "./ITransaction.js";

export interface IAccount {
  readonly id: string;
  name: string;
  addTransaction(transaction: ITransaction): void;
  removeTransactionById(transactionId: string): boolean;
  getTransactions(): ITransaction[];
}
