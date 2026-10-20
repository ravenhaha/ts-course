import assert from "node:assert/strict";
import { mkdtemp, readFile, rmdir, unlink, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Account } from "../dist/classes/Account.js";
import { AccountManager } from "../dist/classes/AccountManager.js";
import { ApplicationController } from "../dist/classes/ApplicationController.js";
import { InquirerInteraction } from "../dist/classes/InquirerInteraction.js";
import { Transaction } from "../dist/classes/Transaction.js";
import { setDecoratorLogging } from "../dist/utils/decoratorLogging.js";
import {
  parseAmount, validateAmount, validateCsvFilename, validateDate, validateRequiredText
} from "../dist/utils/validation.js";

setDecoratorLogging(false);

class ScriptedInteraction {
  constructor(steps) {
    this.steps = [...steps];
    this.validationErrors = [];
    this.confirmations = [];
  }

  next(kind) {
    assert.ok(this.steps.length > 0, `Неожиданный запрос ${kind}`);
    const step = this.steps.shift();
    assert.equal(step.kind, kind);
    step.check?.();
    if (step.error) throw step.error;
    return step;
  }

  async select(message, choices) {
    const step = this.next("select");
    const value = typeof step.value === "function" ? step.value(choices) : step.value;
    assert.ok(choices.some(choice => choice.value === value), `Нет варианта ${value} в «${message}»`);
    return value;
  }

  async input(message, options = {}) {
    const step = this.next("input");
    if (step.checkOptions) step.checkOptions(options);
    const attempts = step.attempts ?? [step.value ?? options.defaultValue ?? ""];
    for (let index = 0; index < attempts.length; index++) {
      const value = attempts[index];
      const result = options.validate?.(value) ?? true;
      if (index < attempts.length - 1) {
        assert.equal(typeof result, "string", `Некорректный ввод принят: ${value}`);
        this.validationErrors.push(result);
      } else {
        assert.equal(result, true, `Корректный ввод отклонён в «${message}»: ${result}`);
        return value;
      }
    }
    throw new Error("Пустая последовательность ввода");
  }

  async confirm(message) {
    const step = this.next("confirm");
    this.confirmations.push(message);
    return step.value;
  }

  assertFinished() {
    assert.equal(this.steps.length, 0, "Не все шаги сценария выполнены");
  }
}

function createOutput() {
  return {
    messages: [], clears: 0,
    clear() { this.clears++; },
    log(...values) { this.messages.push(values.join(" ")); }
  };
}

test("Валидация суммы, календарной даты, обязательного текста и CSV-пути", () => {
  for (const value of ["100", "0.01", "1500,50", " 12.25 "]) assert.equal(validateAmount(value), true);
  for (const value of ["", " ", "0", "-1", "NaN", "Infinity", "1e3", "0x10", "1.234", "90071992547410"]) {
    assert.equal(typeof validateAmount(value), "string", value);
    assert.throws(() => parseAmount(value));
  }
  assert.equal(parseAmount(" 1500,50 "), 1500.5);
  for (const value of ["2024-02-29", "2000-02-29", "2026-10-20", " 2026-01-01 "]) assert.equal(validateDate(value), true);
  for (const value of ["", "2023-02-29", "1900-02-29", "2026-04-31", "2026-13-01", "2026-00-10", "2026-01-00", "0000-01-01", "20.10.2026", "2026-1-1"]) {
    assert.equal(typeof validateDate(value), "string", value);
  }
  assert.equal(typeof validateRequiredText(" \n "), "string");
  assert.equal(validateRequiredText("Счёт"), true);
  assert.equal(validateCsvFilename("report.CSV"), true);
  for (const value of ["", "file.txt", "a\0.csv"]) assert.equal(typeof validateCsvFilename(value), "string");
});

test("Пустое главное меню и корректный выход", async () => {
  const interaction = new ScriptedInteraction([{ kind: "select", value: "exit" }]);
  const output = createOutput();
  await new ApplicationController(new AccountManager(), interaction, output).run();
  interaction.assertFinished();
  assert.equal(output.clears, 1);
  assert.ok(output.messages.some(message => message.includes("Счетов пока нет")));
  assert.equal(output.messages.at(-1), "До свидания!");
});

test("Создание счёта, валидация ввода, доход и расход, экспорт и повторный выбор счёта", async () => {
  const directory = await mkdtemp(join(tmpdir(), "budget-controller-"));
  const filename = join(directory, "account.csv");
  const manager = new AccountManager();
  const interaction = new ScriptedInteraction([
    { kind: "select", value: "create-account" },
    { kind: "input", attempts: ["   ", " Личный бюджет "] },
    { kind: "select", value: "add-transaction" },
    { kind: "select", value: "income" },
    { kind: "input", attempts: ["abc", "0", "-1", "1000,50"] },
    { kind: "input", attempts: ["2023-02-29", "2024-02-29"], checkOptions: options => assert.match(options.defaultValue, /^\d{4}-\d{2}-\d{2}$/) },
    { kind: "input", attempts: ["", " Зарплата "] },
    { kind: "select", value: "add-transaction" },
    { kind: "select", value: "expense" },
    { kind: "input", value: "100.25" },
    { kind: "input", value: "2024-03-01" },
    { kind: "input", value: "Продукты" },
    { kind: "select", value: "export" },
    { kind: "input", attempts: ["report.txt", filename] },
    { kind: "select", value: "back" },
    { kind: "select", value: choices => choices.find(choice => choice.value === manager.getAccounts()[0].id).value },
    { kind: "select", value: "back" },
    { kind: "select", value: "exit" }
  ]);
  const output = createOutput();
  try {
    await new ApplicationController(manager, interaction, output).run();
    interaction.assertFinished();
    assert.equal(interaction.validationErrors.length, 7);
    assert.equal(manager.getAccounts().length, 1);
    const account = manager.getAccounts()[0];
    assert.equal(account.name, "Личный бюджет");
    assert.deepEqual(account.getSummary(), { income: 1000.5, expenses: 100.25, balance: 900.25 });
    assert.equal(account.getTransactions()[0].date, "2024-02-29");
    assert.equal(account.getTransactions()[0].description, "Зарплата");
    const csv = await readFile(filename, "utf8");
    assert.match(csv, /^id,amount,type,date,description\n/);
    assert.match(csv, /1000.5,income,2024-02-29,Зарплата/);
    assert.match(csv, /100.25,expense,2024-03-01,Продукты/);
    assert.ok(output.messages.some(message => message.includes(`CSV сохранён: ${filename}`)));
    assert.ok(output.messages.some(message => message.includes("900.25")));
    assert.ok(output.clears >= 7);
  } finally {
    await unlink(filename).catch(() => {});
    await rmdir(directory);
  }
});

test("Удаление транзакции: отмена выбора, отказ, подтверждение и пустой список", async () => {
  const manager = new AccountManager();
  const account = new Account("Удаление");
  const first = new Transaction(100, "income", "2026-10-20", "Первая");
  const second = new Transaction(20, "expense", "2026-10-20", "Вторая");
  account.addTransaction(first);
  account.addTransaction(second);
  manager.addAccount(account);
  const interaction = new ScriptedInteraction([
    { kind: "select", value: account.id },
    { kind: "select", value: "remove-transaction" },
    { kind: "select", value: "cancel" },
    { kind: "select", value: "remove-transaction" },
    { kind: "select", value: first.id },
    { kind: "confirm", value: false },
    { kind: "select", value: "remove-transaction", check: () => assert.equal(account.getTransactions().length, 2) },
    { kind: "select", value: first.id },
    { kind: "confirm", value: true },
    { kind: "select", value: "remove-transaction", check: () => assert.equal(account.getTransactions().length, 1) },
    { kind: "select", value: second.id },
    { kind: "confirm", value: true },
    { kind: "select", value: "remove-transaction" },
    { kind: "select", value: "back" },
    { kind: "select", value: "exit" }
  ]);
  const output = createOutput();
  await new ApplicationController(manager, interaction, output).run();
  interaction.assertFinished();
  assert.equal(account.getTransactions().length, 0);
  assert.ok(output.messages.some(message => message.includes("нет транзакций для удаления")));
  assert.equal(interaction.confirmations.length, 3);
});

test("Удаление счёта: отказ сохраняет данные, подтверждение очищает все его транзакции", async () => {
  const manager = new AccountManager();
  const account = new Account("Первый");
  const second = new Account("Второй");
  account.addTransaction(new Transaction(100, "income", "2026-10-20", "Доход"));
  account.addTransaction(new Transaction(20, "expense", "2026-10-20", "Расход"));
  second.addTransaction(new Transaction(5, "income", "2026-10-20", "Резерв"));
  manager.addAccount(account);
  manager.addAccount(second);
  const interaction = new ScriptedInteraction([
    { kind: "select", value: account.id },
    { kind: "select", value: "delete-account" },
    { kind: "confirm", value: false },
    { kind: "select", value: "delete-account", check: () => assert.equal(account.getTransactions().length, 2) },
    { kind: "confirm", value: true },
    { kind: "select", value: "exit" }
  ]);
  const output = createOutput();
  await new ApplicationController(manager, interaction, output).run();
  interaction.assertFinished();
  assert.equal(manager.getAccountById(account.id), undefined);
  assert.deepEqual(account.getTransactions(), []);
  assert.equal(account.balance, 0);
  assert.equal(manager.getAccounts().length, 1);
  assert.equal(second.getTransactions().length, 1);
  assert.equal(manager.balance, 5);
  assert.ok(output.messages.some(message => message.includes("и все его транзакции удалены")));
});

test("Экспорт: ошибка записи возвращает к счёту; существующий файл сохраняется при отказе", async () => {
  const directory = await mkdtemp(join(tmpdir(), "budget-export-"));
  const filename = join(directory, "existing.csv");
  const manager = new AccountManager();
  const account = new Account("Экспорт");
  manager.addAccount(account);
  await writeFile(filename, "original", "utf8");
  const interaction = new ScriptedInteraction([
    { kind: "select", value: account.id },
    { kind: "select", value: "export" },
    { kind: "input", value: join(directory, "missing", "file.csv") },
    { kind: "select", value: "export" },
    { kind: "input", value: filename },
    { kind: "confirm", value: false },
    { kind: "select", value: "export", check: () => assert.equal(readFileSync(filename, "utf8"), "original") },
    { kind: "input", value: filename },
    { kind: "confirm", value: true },
    { kind: "select", value: "back" },
    { kind: "select", value: "exit" }
  ]);
  const output = createOutput();
  try {
    await new ApplicationController(manager, interaction, output).run();
    interaction.assertFinished();
    assert.equal(await readFile(filename, "utf8"), "id,amount,type,date,description\n");
    assert.ok(output.messages.some(message => message.includes("Ошибка:") && message.includes("ENOENT")));
    assert.ok(output.messages.some(message => message.includes("Существующий файл сохранён")));
    assert.equal(manager.getAccounts().length, 1);
  } finally {
    await unlink(filename);
    await rmdir(directory);
  }
});

test("Ctrl+C завершает приложение без стека ошибки и частично добавленной транзакции", async () => {
  const error = new Error("User force closed the prompt");
  error.name = "ExitPromptError";
  const manager = new AccountManager();
  const account = new Account("Отмена");
  manager.addAccount(account);
  const interaction = new ScriptedInteraction([
    { kind: "select", value: account.id },
    { kind: "select", value: "add-transaction" },
    { kind: "select", value: "income" },
    { kind: "input", error }
  ]);
  const output = createOutput();
  await new ApplicationController(manager, interaction, output).run();
  interaction.assertFinished();
  assert.equal(account.getTransactions().length, 0);
  assert.ok(output.messages.at(-1).includes("До свидания"));
});

test("Все виды взаимодействия используют inquirer; подтверждение по умолчанию отрицательное", async () => {
  const questions = [];
  const answers = ["income", "100", false];
  const interaction = new InquirerInteraction(async question => {
    questions.push(question);
    return { value: answers.shift() };
  });
  assert.equal(await interaction.select("Тип", [{ name: "Доход", value: "income" }]), "income");
  assert.equal(await interaction.input("Сумма", { defaultValue: "10", validate: validateAmount }), "100");
  assert.equal(await interaction.confirm("Удалить?"), false);
  assert.deepEqual(questions.map(question => question.type), ["list", "input", "confirm"]);
  assert.equal(questions[1].validate("100"), true);
  assert.equal(typeof questions[1].validate("-1"), "string");
  assert.equal(questions[2].default, false);
});
