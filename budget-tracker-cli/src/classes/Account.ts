namespace BudgetTracker {
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
}
