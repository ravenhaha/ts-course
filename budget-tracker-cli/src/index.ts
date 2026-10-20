import { Account } from "./classes/Account.js";
import { Transaction } from "./classes/Transaction.js";
import { AccountManager } from "./classes/AccountManager.js";

console.log("🚀 Budget Tracker CLI");

const personalAccount = new Account( "Личный бюджет");
personalAccount.addTransaction(new Transaction(1000, "income", "2023-01-01T00:00:00Z", "Зарплата"));
personalAccount.addTransaction(new Transaction(200, "expense", "2023-01-05T00:00:00Z", "Продукты"));
personalAccount.addTransaction(new Transaction(150, "expense", "2023-01-10T00:00:00Z", "Коммунальные услуги"));

const lastTransactionId = personalAccount.getTransactions()[2].id;

const manager = new AccountManager();
manager.addAccount(personalAccount);

console.log(String(personalAccount));
console.log("Сводка счёта:", personalAccount.getSummary());
console.log(personalAccount.getSummaryString());
console.log("Все счета:", manager.getAllAccounts());
console.log("Счета через интерфейс:", manager.getAccounts());
console.log("Поиск счёта:", manager.getAccountById(personalAccount.id)?.name);
console.log("Сводка бюджета:", manager.getSummary());
console.log(manager.getSummaryString());
console.log(String(manager));
console.log("Транзакции:");
personalAccount.getTransactions().forEach(transaction => console.log(transaction.toString()));
console.log("Удаление транзакции:", personalAccount.removeTransactionById(lastTransactionId));
console.log("Повторное удаление транзакции:", personalAccount.removeTransactionById(lastTransactionId));
console.log("Баланс после удаления:", manager.balance);
console.log("Удаление счёта:", manager.removeAccountById(personalAccount.id));
console.log("Повторное удаление счёта:", manager.removeAccountById(personalAccount.id));
console.log("Итоговая сводка:", manager.getSummary());
