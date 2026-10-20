import type { IAccountManager } from "../interfaces/IAccountManager.js";
import type { ISummary } from "../interfaces/ISummary.js";
import { Account } from "./Account.js";
import { formatCurrency } from "../lib/budget-utils.js";

export class AccountManager implements IAccountManager, ISummary {
  private accounts: Account[] = [];

  get income(): number {
    return this.accounts.reduce((sum, account) => sum + account.income, 0);
  }

  get expenses(): number {
    return this.accounts.reduce((sum, account) => sum + account.expenses, 0);
  }

  get balance(): number {
    return this.income - this.expenses;
  }

  addAccount(account: Account): void {
    if (this.getAccountById(account.id)) throw new Error(`Счёт ${account.id} уже существует`);
    this.accounts.push(account);
  }

  removeAccountById(accountId: string): boolean {
    const index = this.accounts.findIndex(account => account.id === accountId);
    if (index === -1) return false;
    this.accounts[index].clearTransactions();
    this.accounts.splice(index, 1);
    return true;
  }

  getAccountById(id: string): Account | undefined {
    return this.accounts.find(account => account.id === id);
  }

  getAccounts(): Account[] {
    return [...this.accounts];
  }

  getAllAccounts(): Account[] {
    return this.getAccounts();
  }

  getSummary(): ISummary {
    return { income: this.income, expenses: this.expenses, balance: this.balance };
  }

  getSummaryString(): string {
    return this.accounts.map(account => account.getSummaryString()).join("\n") || "Нет счетов";
  }

  toString(): string {
    return `${this.accounts.map(account => account.toString()).join("\n\n") || "Нет счетов"}\nОбщий баланс: ${formatCurrency(this.balance)}`;
  }
}
