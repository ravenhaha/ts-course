/// <reference path="./interfaces/TransactionType.ts" />
/// <reference path="./interfaces/ITransaction.ts" />
/// <reference path="./interfaces/IAccount.ts" />
/// <reference path="./interfaces/ISummary.ts" />
/// <reference path="./interfaces/IAccountManager.ts" />
/// <reference path="./classes/Transaction.ts" />
/// <reference path="./classes/Account.ts" />
/// <reference path="./classes/AccountManager.ts" />

console.log("🚀 Budget Tracker CLI");

const personalAccount = new BudgetTracker.Account(1, "Личный бюджет");
personalAccount.addTransaction(new BudgetTracker.Transaction(1, 1000, "income", "2023-01-01T00:00:00Z", "Зарплата"));
personalAccount.addTransaction(new BudgetTracker.Transaction(2, 200, "expense", "2023-01-05T00:00:00Z", "Продукты"));
personalAccount.addTransaction(new BudgetTracker.Transaction(3, 150, "expense", "2023-01-10T00:00:00Z", "Коммунальные услуги"));

const manager = new BudgetTracker.AccountManager();
manager.addAccount(personalAccount);

console.log(String(personalAccount));
console.log("Сводка счёта:", personalAccount.getSummary());
console.log(personalAccount.getSummaryString());
console.log("Все счета:", manager.getAllAccounts());
console.log("Счета через интерфейс:", manager.getAccounts());
console.log("Поиск счёта:", manager.getAccountById(1)?.name);
console.log("Сводка бюджета:", manager.getSummary());
console.log(manager.getSummaryString());
console.log(String(manager));
console.log("Транзакции:");
personalAccount.getTransactions().forEach(transaction => console.log(transaction.toString()));
console.log("Удаление транзакции:", personalAccount.removeTransactionById(3));
console.log("Повторное удаление транзакции:", personalAccount.removeTransactionById(3));
console.log("Баланс после удаления:", manager.balance);
console.log("Удаление счёта:", manager.removeAccountById(1));
console.log("Повторное удаление счёта:", manager.removeAccountById(1));
console.log("Итоговая сводка:", manager.getSummary());
