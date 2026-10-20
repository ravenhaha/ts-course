function calculateTotal(values: number[]): number {
  return values.reduce((total: number, value: number): number => total + value, 0);
}

function calculateAverage(values: number[]): number {
  return values.length === 0 ? 0 : calculateTotal(values) / values.length;
}

function formatCurrency(amount: number, symbol: string): string {
  return `${amount} ${symbol}`;
}

function getTopValues(values: number[], count: number): number[] {
  return [...values].sort((a: number, b: number): number => b - a).slice(0, Math.max(0, count));
}

function printSummary(values: number[]): void {
  console.log("Всего записей:", values.length);
  console.log("Сумма:", calculateTotal(values));
  console.log("Среднее:", calculateAverage(values));
}

console.log("Сумма:", calculateTotal([1000, 2000, 3000]));
console.log("Среднее:", calculateAverage([1000, 2000, 3000]));
console.log("Среднее пустого массива:", calculateAverage([]));
console.log("Валюта:", formatCurrency(1000, "₽"));
console.log("Наибольшие значения:", getTopValues([100, 500, 200, 800], 2));
printSummary([100, 500, 1000, 2000, 800]);
