const income: number = 60000;
const expenses: number = 35000;
const savings: number = 10000;
const netIncome: number = income - expenses;
const remaining: number = netIncome - savings;

console.log("Доход:", income);
console.log("Расходы:", expenses);
console.log("Сбережения:", savings);
console.log("Чистый доход:", netIncome);
console.log("Остаток после сбережений:", remaining);
