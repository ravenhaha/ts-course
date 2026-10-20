import type { ITransaction } from "../src/interfaces/ITransaction.js";
import type {
  IsIncome, OptionalTransaction, ReadonlyTransactionFields, TransactionFieldType
} from "../src/interfaces/mapped-types.js";
import type {
  AccountInfo, CategoryLimits, CompleteTransaction, NullableDescription,
  TransactionConstructorParams, TransactionInstance, TransactionPreview,
  TransactionUpdate, TransactionWithoutDescription
} from "../src/interfaces/utility-types.js";
import { Transaction } from "../src/classes/Transaction.js";
import { formatCurrency } from "../src/lib/formatCurrency.js";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;

type AmountIsNumber = Assert<Equal<TransactionFieldType<"amount">, number>>;
type UnknownIsNever = Assert<Equal<TransactionFieldType<"unknown">, never>>;
type IncomeIsTrue = Assert<Equal<IsIncome<{ type: "income" }>, true>>;
type ExpenseIsFalse = Assert<Equal<IsIncome<{ type: "expense" }>, false>>;
type MixedTransactionIsFalse = Assert<Equal<IsIncome<ITransaction>, false>>;

const optional: OptionalTransaction<"description" | "date"> = {
  id: "1", amount: 100, type: "income"
};
optional.amount = 200;
// @ts-expect-error amount остаётся обязательным.
const missingAmount: OptionalTransaction<"description" | "date"> = { id: "1", type: "income" };
// @ts-expect-error Неизвестные ключи запрещены.
type InvalidOptionalField = OptionalTransaction<"unknown">;
// @ts-expect-error Неизвестные ключи запрещены.
type InvalidReadonlyField = ReadonlyTransactionFields<"unknown">;

const protectedFields: ReadonlyTransactionFields<"id" | "type"> = {
  id: "1", amount: 100, type: "income", date: "2023-01-01", description: "Example"
};
protectedFields.amount = 0;
protectedFields.description = "Changed";
// @ts-expect-error Выбранное поле type доступно только для чтения.
protectedFields.type = "expense";
// @ts-expect-error Выбранное поле id доступно только для чтения.
protectedFields.id = "2";

const preview: TransactionPreview = { id: "1", amount: 10, type: "income", date: "2023-01-01" };
const withoutDescription: TransactionWithoutDescription = preview;
const nullable: NullableDescription = { ...preview, description: null };
// @ts-expect-error У CompleteTransaction обязательно description.
const incomplete: CompleteTransaction = preview;
const info: AccountInfo = { id: "1", name: "Account" };
const update: TransactionUpdate = { amount: 0 };
const limits: CategoryLimits = { income: 100, expense: 50 };
// @ts-expect-error Обязательны оба лимита.
const incompleteLimits: CategoryLimits = { income: 100 };
const params: TransactionConstructorParams = [10, "expense", "2023-01-01", "Example"];
const instance: TransactionInstance = new Transaction(...params);
// @ts-expect-error Сумма транзакции должна быть числом.
const invalidParams: TransactionConstructorParams = ["10", "expense", "2023-01-01", "Example"];
formatCurrency(10, "$ ");
// @ts-expect-error Собственный declaration file запрещает строковую сумму.
formatCurrency("10");
