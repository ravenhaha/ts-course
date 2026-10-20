import type { ITransaction } from "./ITransaction.js";
import type { IAccount } from "./IAccount.js";
import type { TransactionType } from "./TransactionType.js";
import type { Transaction } from "../classes/Transaction.js";

export type TransactionUpdate = Partial<ITransaction>;
export type AccountUpdate = Partial<IAccount>;
export type CompleteTransaction = Required<ITransaction>;
export type TransactionWithoutDescription = Omit<ITransaction, "description">;
export type TransactionPreview = Pick<ITransaction, "id" | "amount" | "type" | "date">;
export type AccountInfo = Pick<IAccount, "id" | "name">;
export type CategoryLimits = Record<TransactionType, number>;
export type TransactionConstructorParams = ConstructorParameters<typeof Transaction>;
export type TransactionInstance = InstanceType<typeof Transaction>;
export type NullableDescription = Omit<ITransaction, "description"> & {
  description: ITransaction["description"] | null;
};
