import "reflect-metadata";
import { logDecorator } from "../utils/decoratorLogging.js";

type Constructor = new (...args: never[]) => object;

export function LogClass<T extends Constructor>(constructor: T): T {
  const logged: T = new Proxy(constructor, {
    construct(target, args: unknown[], newTarget): object {
      const instance: object = Reflect.construct(target, args, newTarget) as object;
      logDecorator(`Создан экземпляр класса ${constructor.name} с аргументами:`, ...args);
      return instance;
    }
  });
  for (const key of Reflect.getOwnMetadataKeys(constructor) as unknown[]) {
    const value: unknown = Reflect.getOwnMetadata(key, constructor);
    Reflect.defineMetadata(key, value, logged);
  }
  return logged;
}
