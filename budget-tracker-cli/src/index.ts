import { Account } from "./classes/Account.js";
import { Transaction } from "./classes/Transaction.js";
import { AccountManager } from "./classes/AccountManager.js";
import type {
  AccountInfo, CategoryLimits, CompleteTransaction, NullableDescription,
  TransactionConstructorParams, TransactionInstance, TransactionPreview,
  TransactionWithoutDescription
} from "./interfaces/utility-types.js";
import type {
  IsIncome, OptionalTransaction, ReadonlyTransactionFields, TransactionFieldType
} from "./interfaces/mapped-types.js";
import type { ITransaction } from "./interfaces/ITransaction.js";

type AmountType = TransactionFieldType<"amount">;
type UnknownType = TransactionFieldType<"unknown">; // never: такого поля нет.
type TransactionWithOptionalDescAndDate = OptionalTransaction<"description" | "date">;
type TransactionReadonlyIdAndType = ReadonlyTransactionFields<"id" | "type">;
type CheckIncome1 = IsIncome<{ type: "income"; amount: number }>;
type CheckIncome2 = IsIncome<{ type: "expense"; amount: number }>;
type CheckIncome3 = IsIncome<ITransaction>;

async function main(): Promise<void> {
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

  const amount: AmountType = complete.amount;
  const optional: TransactionWithOptionalDescAndDate = {
    id: complete.id, amount, type: complete.type
  };
  const protectedTransaction: TransactionReadonlyIdAndType = {
    ...preview, description: "Предпросмотр с неизменяемыми id и type"
  };
  protectedTransaction.description = "Остальные поля можно менять";
  const checks: [CheckIncome1, CheckIncome2, CheckIncome3] = [true, false, false];
  console.log("Тип поля amount:", amount);
  console.log("Опциональные date и description:", optional);
  console.log("Readonly-поля id и type:", protectedTransaction);
  console.log("Условные типы IsIncome:", checks);
  
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
  await personalAccount.exportTransactionsToCSV("main_account.csv");
  console.log("CSV сохранён: main_account.csv");
  console.log("Удаление транзакции:", personalAccount.removeTransactionById(lastTransactionId));
  console.log("Повторное удаление транзакции:", personalAccount.removeTransactionById(lastTransactionId));
  console.log("Баланс после удаления:", manager.balance);
  console.log("Удаление счёта:", manager.removeAccountById(personalAccount.id));
  console.log("Повторное удаление счёта:", manager.removeAccountById(personalAccount.id));
  console.log("Итоговая сводка:", manager.getSummary());
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
