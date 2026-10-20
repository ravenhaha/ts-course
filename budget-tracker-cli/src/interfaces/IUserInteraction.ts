export interface MenuChoice<T extends string> {
  readonly name: string;
  readonly value: T;
}

export type InputValidator = (value: string) => true | string;

export interface InputOptions {
  readonly defaultValue?: string;
  readonly validate?: InputValidator;
}

export interface IUserInteraction {
  select<T extends string>(message: string, choices: readonly MenuChoice<T>[]): Promise<T>;
  input(message: string, options?: InputOptions): Promise<string>;
  confirm(message: string): Promise<boolean>;
}
