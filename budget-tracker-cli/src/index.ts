import { Account } from "./classes/Account.js";
import { Transaction } from "./classes/Transaction.js";
import { AccountManager } from "./classes/AccountManager.js";
import type {
  AccountInfo, CategoryLimits, CompleteTransaction, NullableDescription,
  TransactionConstructorParams, TransactionInstance, TransactionPreview,
  TransactionWithoutDescription
} from "./interfaces/utility-types.js";

console.log("🚀 Budget Tracker CLI");

const personalAccount = new Account( "Личный бюджет");
personalAccount.addTransaction(new Transaction(1000, "income", "2023-01-01T00:00:00Z", "Зарплата"));
personalAccount.addTransaction(new Transaction(200, "expense", "2023-01-05T00:00:00Z", "Продукты"));
personalAccount.addTransaction(new Transaction(150, "expense", "2023-01-10T00:00:00Z", "Коммунальные услуги"));

const lastTransactionId = personalAccount.getTransactions()[2].id;

personalAccount.getTransactions()[0].update({ amount: 1200 });
personalAccount.update({ name: "Основной счёт" });

const complete: CompleteTransaction = personalAccount.getTransactions()[0];
const preview: TransactionPreview = {
  id: complete.id, amount: complete.amount, type: complete.type, date: complete.date
};
const withoutDescription: TransactionWithoutDescription = { ...preview };
const info: AccountInfo = { id: personalAccount.id, name: personalAccount.name };
const limits: CategoryLimits = { income: 10000, expense: 5000 };
const nullable: NullableDescription = { ...preview, description: null };
const transactionParams: TransactionConstructorParams = [500, "expense", "2023-02-01T00:00:00Z", "Покупка"];
const newTransaction: TransactionInstance = new Transaction(...transactionParams);
console.log("Полная транзакция:", complete);
console.log("Предпросмотр:", preview);
console.log("Без описания:", withoutDescription);
console.log("Информация о счёте:", info);
console.log("Лимит пополнений:", limits.income, "Лимит трат:", limits.expense);
console.log("Nullable description:", nullable.description);
console.log("Типизированные параметры конструктора:", newTransaction.toString());

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
