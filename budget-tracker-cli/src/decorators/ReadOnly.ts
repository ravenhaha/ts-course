export function ReadOnly(target: object, propertyKey: string | symbol): void {
  Object.defineProperty(target, propertyKey, {
    get(): undefined {
      return undefined;
    },
    set(this: object, value: unknown): void {
      // Первое присваивание инициализирует отдельное свойство экземпляра.
      Object.defineProperty(this, propertyKey, {
        get: () => value,
        set: () => {
          throw new Error(`Свойство ${String(propertyKey)} доступно только для чтения`);
        },
        enumerable: true,
        configurable: false
      });
    },
    enumerable: true,
    configurable: true
  });
}
