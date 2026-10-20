import { logDecorator } from "../utils/decoratorLogging.js";

export function LogMethod(
  _target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const method = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
    logDecorator(`Вызов метода ${String(propertyKey)} с аргументами:`, ...args);
    const result = method.apply(this, args);
    logDecorator(`Метод ${String(propertyKey)} вернул:`, result);
    return result;
  };
}
