import inquirer from "inquirer";
import type { InputOptions, IUserInteraction, MenuChoice } from "../interfaces/IUserInteraction.js";

export class InquirerInteraction implements IUserInteraction {
  constructor(private readonly prompt: typeof inquirer.prompt = inquirer.prompt) {}

  async select<T extends string>(message: string, choices: readonly MenuChoice<T>[]): Promise<T> {
    const answer = await this.prompt<{ value: T }>({
      type: "list", name: "value", message, choices: [...choices], pageSize: 12, loop: false
    });
    return answer.value;
  }

  async input(message: string, options: InputOptions = {}): Promise<string> {
    const answer = await this.prompt<{ value: string }>({
      type: "input", name: "value", message, default: options.defaultValue,
      validate: (value: string): true | string => options.validate?.(value) ?? true
    });
    return answer.value;
  }

  async confirm(message: string): Promise<boolean> {
    const answer = await this.prompt<{ value: boolean }>({
      type: "confirm", name: "value", message, default: false
    });
    return answer.value;
  }
}
