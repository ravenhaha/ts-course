import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import type { ITransaction } from "../interfaces/ITransaction.js";
import type { TransactionType } from "../interfaces/TransactionType.js";
import { formatCurrency } from "../lib/budget-utils.js";

export class Transaction implements ITransaction {
  private readonly _id: string;

  get id(): string {
    return this._id;
  }

  constructor(
    public amount: number,
    public type: TransactionType,
    public date: string,
    public description: string
  ) {
    this._id = uuidv4();
  }

  toString(): string {
    return `Транзакция #${this.id}: ${this.description} (${this.type === "income" ? "доход" : "расход"} ${formatCurrency(this.amount)}) | ${moment(this.date).format("DD.MM.YYYY")}`;
  }
}
