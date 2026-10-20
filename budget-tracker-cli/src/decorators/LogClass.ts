type Constructor = new (...args: any[]) => object;

export function LogClass<T extends Constructor>(constructor: T): T {
  const LoggedClass = class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      console.log(`Создан экземпляр класса ${constructor.name} с аргументами:`, ...args);
    }
  };
  Object.defineProperty(LoggedClass, "name", { value: constructor.name });
  return LoggedClass;
}
