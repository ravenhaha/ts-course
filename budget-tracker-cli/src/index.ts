import { IAccount, IAccountManager, ISummary, ITransaction } from "./types";

console.log("🚀 Budget Tracker CLI");

const account: IAccount & { transactions: ITransaction[] } = {
  id: 1,
  name: "Личный бюджет",
  transactions: [],
  addTransaction(transaction: ITransaction): void {
    if (this.transactions.some(item => item.id === transaction.id)) {
      throw new Error(`Транзакция ${transaction.id} уже существует`);
    }
    this.transactions.push(transaction);
  },
  removeTransactionById(transactionId: number): boolean {
    const index = this.transactions.findIndex(item => item.id === transactionId);
    if (index === -1) return false;
    this.transactions.splice(index, 1);
    return true;
  },
  getTransactions(): ITransaction[] {
    return [...this.transactions];
  }
};

const accountManager: IAccountManager & { accounts: IAccount[] } = {
  accounts: [],
  addAccount(newAccount: IAccount): void {
    if (this.accounts.some(item => item.id === newAccount.id)) {
      throw new Error(`Счёт ${newAccount.id} уже существует`);
    }
    this.accounts.push(newAccount);
  },
  removeAccountById(accountId: number): boolean {
    const index = this.accounts.findIndex(item => item.id === accountId);
    if (index === -1) return false;
    this.accounts.splice(index, 1);
    return true;
  },
  getAccounts(): IAccount[] {
    return [...this.accounts];
  },
  getAccountById(id: number): IAccount | undefined {
    return this.accounts.find(item => item.id === id);
  },
  getSummary(accountId: number): ISummary {
    const selected = this.getAccountById(accountId);
    if (!selected) throw new Error(`Счёт ${accountId} не найден`);
    const transactions = selected.getTransactions();
    const income = transactions.filter(item => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const expenses = transactions.filter(item => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    return { income, expenses, balance: income - expenses };
  }
};

account.addTransaction({ id: 1, amount: 1000, type: "income", date: "2023-01-01T00:00:00Z", description: "Зарплата" });
account.addTransaction({ id: 2, amount: 200, type: "expense", date: "2023-01-05T00:00:00Z", description: "Продукты" });
account.addTransaction({ id: 3, amount: 150, type: "expense", date: "2023-01-10T00:00:00Z", description: "Коммунальные услуги" });
console.log("Транзакции:", account.getTransactions());
console.log("Удаление транзакции:", account.removeTransactionById(3));
console.log("Повторное удаление:", account.removeTransactionById(3));
accountManager.addAccount(account);
console.log("Счета:", accountManager.getAccounts());
console.log("Найденный счёт:", accountManager.getAccountById(1));
console.log("Несуществующий счёт:", accountManager.getAccountById(99));
console.log("Сводка:", accountManager.getSummary(1));
console.log("Удаление счёта:", accountManager.removeAccountById(1));
console.log("Повторное удаление счёта:", accountManager.removeAccountById(1));
console.log("Счета после удаления:", accountManager.getAccounts());
