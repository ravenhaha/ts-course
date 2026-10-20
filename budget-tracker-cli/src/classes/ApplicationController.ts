import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import moment from "moment";
import { Account } from "./Account.js";
import { AccountManager } from "./AccountManager.js";
import { InquirerInteraction } from "./InquirerInteraction.js";
import { Transaction } from "./Transaction.js";
import { AccountMenuAction, MainMenuAction } from "../interfaces/MenuAction.js";
import type { IUserInteraction, MenuChoice } from "../interfaces/IUserInteraction.js";
import type { TransactionType } from "../interfaces/TransactionType.js";
import { formatCurrency } from "../lib/budget-utils.js";
import { getErrorMessage, isPromptCancellation } from "../utils/errors.js";
import {
  parseAmount, validateAmount, validateCsvFilename, validateDate, validateRequiredText
} from "../utils/validation.js";

export class ApplicationController {
  constructor(
    private readonly manager: AccountManager = new AccountManager(),
    private readonly interaction: IUserInteraction = new InquirerInteraction(),
    private readonly output: Pick<Console, "clear" | "log"> = console
  ) {}

  async run(): Promise<void> {
    let notice: string = "";
    try {
      while (true) {
        this.output.clear();
        this.output.log("Budget Tracker | Личные финансы");
        const accounts: Account[] = this.manager.getAccounts();
        this.output.log(`Счетов: ${accounts.length} | Общий баланс: ${formatCurrency(this.manager.balance)}`);
        if (accounts.length === 0) this.output.log("Счетов пока нет. Создайте первый счёт.");
        if (notice) this.output.log(`\n${notice}\n`);
        notice = "";

        const choices: MenuChoice<string>[] = accounts.map((account: Account): MenuChoice<string> => ({
          name: `${account.name} — ${formatCurrency(account.balance)} [${account.id.slice(0, 8)}]`,
          value: account.id
        }));
        choices.push(
          { name: "Создать счёт", value: MainMenuAction.CreateAccount },
          { name: "Выход", value: MainMenuAction.Exit }
        );
        const action: string = await this.interaction.select("Выберите счёт или действие:", choices);
        if (action === MainMenuAction.Exit) {
          this.output.log("До свидания!");
          return;
        }

        try {
          if (action === MainMenuAction.CreateAccount) {
            const name: string = await this.interaction.input("Название нового счёта:", {
              validate: validateRequiredText
            });
            const account: Account = new Account(name.trim());
            this.manager.addAccount(account);
            notice = await this.showAccount(account, "Счёт создан.");
          } else {
            const account: Account | undefined = this.manager.getAccountById(action);
            if (!account) throw new Error("Выбранный счёт не найден.");
            notice = await this.showAccount(account);
          }
        } catch (error: unknown) {
          if (isPromptCancellation(error)) throw error;
          notice = `Ошибка: ${getErrorMessage(error)}`;
        }
      }
    } catch (error: unknown) {
      if (!isPromptCancellation(error)) throw error;
      this.output.log("\nРабота завершена. До свидания!");
    }
  }

  private async showAccount(account: Account, notice: string = ""): Promise<string> {
    while (this.manager.getAccountById(account.id)) {
      this.output.clear();
      this.output.log(account.toString());
      this.output.log(`\nДоходы: ${formatCurrency(account.income)} | Расходы: ${formatCurrency(account.expenses)} | Баланс: ${formatCurrency(account.balance)}`);
      if (notice) this.output.log(`\n${notice}\n`);
      notice = "";

      const action: AccountMenuAction = await this.interaction.select<AccountMenuAction>("Действие со счётом:", [
        { name: "Добавить транзакцию", value: AccountMenuAction.AddTransaction },
        { name: "Удалить транзакцию", value: AccountMenuAction.RemoveTransaction },
        { name: "Экспортировать в CSV", value: AccountMenuAction.Export },
        { name: "Удалить счёт", value: AccountMenuAction.DeleteAccount },
        { name: "Назад к списку счетов", value: AccountMenuAction.Back }
      ]);

      try {
        switch (action) {
          case AccountMenuAction.AddTransaction:
            notice = await this.addTransaction(account);
            break;
          case AccountMenuAction.RemoveTransaction:
            notice = await this.removeTransaction(account);
            break;
          case AccountMenuAction.Export:
            notice = await this.exportAccount(account);
            break;
          case AccountMenuAction.DeleteAccount:
            if (await this.interaction.confirm(`Удалить счёт «${account.name}» и все его транзакции (${account.getTransactions().length})?`)) {
              if (!this.manager.removeAccountById(account.id)) throw new Error("Счёт уже удалён.");
              return `Счёт «${account.name}» и все его транзакции удалены.`;
            }
            notice = "Удаление счёта отменено.";
            break;
          case AccountMenuAction.Back:
            return "";
        }
      } catch (error: unknown) {
        if (isPromptCancellation(error)) throw error;
        notice = `Ошибка: ${getErrorMessage(error)}`;
      }
    }
    return "Счёт больше не существует.";
  }

  private async addTransaction(account: Account): Promise<string> {
    const type: TransactionType = await this.interaction.select<TransactionType>("Тип транзакции:", [
      { name: "Доход", value: "income" },
      { name: "Расход", value: "expense" }
    ]);
    const amount: string = await this.interaction.input("Сумма (например, 1500,50):", { validate: validateAmount });
    const date: string = await this.interaction.input("Дата (ГГГГ-ММ-ДД):", {
      defaultValue: moment().format("YYYY-MM-DD"), validate: validateDate
    });
    const description: string = await this.interaction.input("Описание транзакции:", {
      validate: validateRequiredText
    });
    account.addTransaction(new Transaction(parseAmount(amount), type, date.trim(), description.trim()));
    return "Транзакция добавлена.";
  }

  private async removeTransaction(account: Account): Promise<string> {
    const transactions: Transaction[] = account.getTransactions();
    if (transactions.length === 0) return "На счёте нет транзакций для удаления.";
    const choices: MenuChoice<string>[] = transactions.map((transaction: Transaction): MenuChoice<string> => ({
      name: transaction.toString(), value: transaction.id
    }));
    choices.push({ name: "Отмена", value: "cancel" });
    const id: string = await this.interaction.select("Выберите транзакцию для удаления:", choices);
    if (id === "cancel") return "Удаление транзакции отменено.";
    const transaction: Transaction | undefined = transactions.find((item: Transaction): boolean => item.id === id);
    if (!transaction) throw new Error("Транзакция не найдена.");
    if (!await this.interaction.confirm(`Удалить транзакцию «${transaction.description}» на ${formatCurrency(transaction.amount)}?`)) {
      return "Удаление транзакции отменено.";
    }
    if (!account.removeTransactionById(id)) throw new Error("Транзакция уже удалена.");
    return "Транзакция удалена.";
  }

  private async exportAccount(account: Account): Promise<string> {
    const filename: string = await this.interaction.input("Путь к CSV-файлу:", {
      defaultValue: `account-${account.id}.csv`, validate: validateCsvFilename
    });
    const path: string = resolve(filename.trim());
    let exists: boolean = false;
    try {
      const info = await stat(path);
      if (!info.isFile()) throw new Error("Выберите путь к файлу, а не к каталогу.");
      exists = true;
    } catch (error: unknown) {
      if (typeof error !== "object" || error === null || !("code" in error) || error.code !== "ENOENT") throw error;
    }
    if (exists && !await this.interaction.confirm(`Файл «${path}» уже существует. Перезаписать?`)) {
      return "Экспорт отменён. Существующий файл сохранён.";
    }
    await account.exportTransactionsToCSV(path);
    return `CSV сохранён: ${path}`;
  }
}
