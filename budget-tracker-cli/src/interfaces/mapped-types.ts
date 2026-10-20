import type { ITransaction } from "./ITransaction.js";

export type TransactionFieldType<TField> = TField extends keyof ITransaction
  ? ITransaction[TField]
  : never;

export type OptionalTransaction<TFields extends keyof ITransaction> = {
  [K in keyof ITransaction as K extends TFields ? K : never]?: ITransaction[K];
} & {
  [K in keyof ITransaction as K extends TFields ? never : K]: ITransaction[K];
};

export type ReadonlyTransactionFields<TFields extends keyof ITransaction> = {
  readonly [K in keyof ITransaction as K extends TFields ? K : never]: ITransaction[K];
} & {
  [K in keyof ITransaction as K extends TFields ? never : K]: ITransaction[K];
};

export type IsIncome<T> = T extends { type: "income" } ? true : false;
