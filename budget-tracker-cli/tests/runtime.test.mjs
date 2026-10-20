import assert from "node:assert/strict";
import { mkdtemp, readFile, rmdir, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { Account } from "../dist/classes/Account.js";
import { AccountManager } from "../dist/classes/AccountManager.js";
import { Transaction } from "../dist/classes/Transaction.js";
import { LogMethod } from "../dist/decorators/LogMethod.js";
import { escapeCsvValue } from "../dist/utils/escapeCsvValue.js";
import { formatCurrency } from "../dist/lib/budget-utils.js";

test("Вычисления, функции и generic-хранилище из ранних тем", async () => {
  const context = createContext({ console: { log() {} } });
  for (const file of ["calculation-demo", "functions", "generics"]) {
    runInContext(await readFile(new URL(`../dist/${file}.js`, import.meta.url), "utf8"), context);
  }
  assert.equal(runInContext("netIncome", context), 25000);
  assert.equal(runInContext("remaining", context), 15000);
  assert.equal(runInContext("calculateTotal([])", context), 0);
  assert.equal(runInContext("calculateTotal([1000,2000,3000])", context), 6000);
  assert.equal(runInContext("calculateAverage([])", context), 0);
  assert.equal(runInContext("calculateAverage([1000,2000,3000])", context), 2000);
  assert.equal(runInContext('formatCurrency(1000, "RUB")', context), "1000 RUB");
  assert.deepEqual(Array.from(runInContext("getTopValues([100,500,200,800],2)", context)), [800, 500]);
  assert.equal(runInContext("getTopValues([1,2],0).length", context), 0);
  assert.equal(runInContext("getTopValues([1,2],-1).length", context), 0);
  assert.equal(runInContext("const original = [1,3,2]; getTopValues(original,2); original.join(',')", context), "1,3,2");
  assert.equal(runInContext("const storage = new GenericStorage(); storage.add({id: 1}); const copy = storage.getAll(); copy.pop(); storage.getAll().length", context), 1);
  assert.equal(runInContext("storage.getById(1).id", context), 1);
  assert.equal(runInContext("storage.getById(99)", context), undefined);
  assert.equal(runInContext("storage.removeById(1)", context), true);
  assert.equal(runInContext("storage.removeById(1)", context), false);
});

test("Счета, транзакции, суммарный баланс и частичные обновления", t => {
  t.mock.method(console, "log", () => {});
  const account = new Account("Основной");
  const second = new Account("Резерв");
  const salary = new Transaction(1000, "income", "2023-01-01T00:00:00Z", "Зарплата");
  const expense = new Transaction(200, "expense", "2023-01-02T00:00:00Z", "Продукты");
  assert.match(salary.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.notEqual(account.id, second.id);
  assert.deepEqual(account.getSummary(), { income: 0, expenses: 0, balance: 0 });
  account.addTransaction(salary);
  account.addTransaction(expense);
  assert.throws(() => account.addTransaction(salary), /уже существует/);
  salary.update({ amount: 1200, description: "Бонус" });
  assert.equal(salary.description, "Бонус");
  assert.equal(salary.type, "income");
  assert.equal(salary.date, "2023-01-01T00:00:00Z");
  assert.throws(() => salary.update({ id: "changed" }), /нельзя изменить/);
  assert.deepEqual(account.getSummary(), { income: 1200, expenses: 200, balance: 1000 });
  account.getTransactions().pop();
  assert.equal(account.getTransactions().length, 2);
  second.addTransaction(new Transaction(50, "expense", "2023-01-01", "Резерв"));
  const manager = new AccountManager();
  manager.addAccount(account);
  manager.addAccount(second);
  assert.throws(() => manager.addAccount(account), /уже существует/);
  assert.deepEqual(manager.getSummary(), { income: 1200, expenses: 250, balance: 950 });
  assert.equal(manager.getAccountById(account.id), account);
  assert.equal(manager.getAccountById("missing"), undefined);
  manager.getAllAccounts().pop();
  assert.equal(manager.getAccounts().length, 2);
  assert.equal(account.removeTransactionById(expense.id), true);
  assert.equal(account.removeTransactionById(expense.id), false);
  salary.update({ amount: 0, description: "" });
  assert.equal(account.balance, 0);
  assert.equal(salary.description, "");
  assert.equal(manager.removeAccountById(account.id), true);
  assert.equal(manager.removeAccountById(account.id), false);
  assert.equal(manager.removeAccountById(second.id), true);
  assert.deepEqual(manager.getSummary(), { income: 0, expenses: 0, balance: 0 });
  assert.equal(formatCurrency(10), "10.00 ₽");
  assert.equal(formatCurrency(10, "$"), "10.00 $");
});

test("Декораторы: отдельные readonly-свойства, метаданные и логирование", t => {
  const log = t.mock.method(console, "log", () => {});
  const account = new Account("Первый");
  const second = new Account("Второй");
  const id = account.id;
  assert.equal(account.constructor.name, "Account");
  assert.throws(() => { account.id = "changed"; }, /id.*только для чтения/);
  assert.throws(() => { account.name = "changed"; }, /name.*только для чтения/);
  assert.throws(() => account.update({ name: "changed" }), /name.*только для чтения/);
  assert.throws(() => account.update({ id: "changed" }), /нельзя изменить/);
  assert.throws(() => Object.defineProperty(account, "id", { value: "changed" }), TypeError);
  assert.equal(account.id, id);
  assert.equal(second.name, "Второй");
  assert.equal(Reflect.getMetadata("description", account, "transactions"), "Массив транзакций счета");
  assert.deepEqual(Reflect.getMetadata("design:paramtypes", Account), [String]);
  assert.match(account.getSummaryString(), /Массив транзакций счета/);
  const transaction = new Transaction(5, "income", "2023-01-01", "Пример");
  account.addTransaction(transaction);
  account.getTransactions();
  account.removeTransactionById(transaction.id);
  const messages = log.mock.calls.map(call => call.arguments[0]);
  assert.ok(messages.includes("Создан экземпляр класса Account с аргументами:"));
  for (const method of ["addTransaction", "getTransactions", "removeTransactionById"]) {
    assert.ok(messages.includes(`Вызов метода ${method} с аргументами:`));
    assert.ok(messages.includes(`Метод ${method} вернул:`));
  }
  const calculator = { base: 5, sum(value) { return this.base + value; } };
  const descriptor = Object.getOwnPropertyDescriptor(calculator, "sum");
  LogMethod(calculator, "sum", descriptor);
  Object.defineProperty(calculator, "sum", descriptor);
  assert.equal(calculator.sum(3), 8);
});

test("CSV: экранирование, пустой счёт, ожидание записи и ошибки", async t => {
  t.mock.method(console, "log", () => {});
  assert.equal(escapeCsvValue(10), "10");
  assert.equal(escapeCsvValue("a,b"), '"a,b"');
  assert.equal(escapeCsvValue('a"b'), '"a""b"');
  assert.equal(escapeCsvValue("a'b"), '"a\'b"');
  assert.equal(escapeCsvValue("a\r\nb"), '"a\r\nb"');
  const directory = await mkdtemp(join(tmpdir(), "budget-tracker-test-"));
  const file = join(directory, "transactions.csv");
  try {
    const account = new Account("CSV");
    await account.exportTransactionsToCSV(file);
    assert.equal(await readFile(file, "utf8"), "id,amount,type,date,description\n");
    const transaction = new Transaction(10, "expense", "2023-01-01", 'Продукты, "хлеб"\nМагазин');
    account.addTransaction(transaction);
    await account.exportTransactionsToCSV(file);
    assert.equal(await readFile(file, "utf8"), `id,amount,type,date,description\n${transaction.id},10,expense,2023-01-01,"Продукты, ""хлеб""\nМагазин"\n`);
    await assert.rejects(account.exportTransactionsToCSV(join(directory, "missing", "file.csv")), /Не удалось экспортировать.*ENOENT/);
  } finally {
    await unlink(file).catch(() => {});
    await rmdir(directory);
  }
});
