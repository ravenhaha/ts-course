namespace BudgetTracker {
  export interface IAccountManager {
    addAccount(account: Account): void;
    removeAccountById(accountId: number): boolean;
    getAccounts(): Account[];
    getAllAccounts(): Account[];
    getAccountById(id: number): Account | undefined;
    getSummary(): ISummary;
  }
}
