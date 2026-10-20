let enabled: boolean = true;

export function setDecoratorLogging(value: boolean): void {
  enabled = value;
}

export function logDecorator(message: string, ...values: unknown[]): void {
  if (enabled) console.log(message, ...values);
}
