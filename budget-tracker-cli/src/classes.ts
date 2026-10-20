import { IAccount, IAccountManager, ISummary, ITransaction, TransactionType } from "./types";

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

export class Account implements IAccount, ISummary {
  private transactions: Transaction[] = [];

  constructor(public id: number, public name: string) {}

  get income(): number {
    return this.transactions.filter(item => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
  }

  get expenses(): number {
    return this.transactions.filter(item => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
  }

  get balance(): number {
    return this.income - this.expenses;
  }

  addTransaction(transaction: Transaction): void {
    if (this.transactions.some(item => item.id === transaction.id)) {
      throw new Error(`Транзакция ${transaction.id} уже существует`);
    }
    this.transactions.push(transaction);
  }

  removeTransactionById(transactionId: number): boolean {
    const index = this.transactions.findIndex(item => item.id === transactionId);
    if (index === -1) return false;
    this.transactions.splice(index, 1);
    return true;
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getSummary(): ISummary {
    return { income: this.income, expenses: this.expenses, balance: this.balance };
  }

  getSummaryString(): string {
    return `${this.name}: баланс ${this.balance} ₽, транзакций: ${this.transactions.length}`;
  }

  toString(): string {
    return `${this.id}) ${this.name}\nСписок транзакций:\n${this.transactions.map(item => item.toString()).join("\n") || "Нет транзакций"}`;
  }
}

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

  removeAccountById(accountId: number): boolean {
    const index = this.accounts.findIndex(account => account.id === accountId);
    if (index === -1) return false;
    this.accounts.splice(index, 1);
    return true;
  }

  getAccountById(id: number): Account | undefined {
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
    return `${this.accounts.map(account => account.toString()).join("\n\n") || "Нет счетов"}\nОбщий баланс: ${this.balance} ₽`;
  }
}
