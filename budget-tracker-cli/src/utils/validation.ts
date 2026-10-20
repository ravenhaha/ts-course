export function validateRequiredText(value: string): true | string {
  return value.trim().length > 0 || "Введите непустой текст.";
}

export function validateAmount(value: string): true | string {
  const normalized: string = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return "Введите положительную сумму, например 1500 или 1500,50 (до двух знаков после запятой).";
  }
  const amount: number = Number(normalized);
  return (amount > 0 && Number.isFinite(amount) && Number.isSafeInteger(Math.round(amount * 100)))
    || "Сумма должна быть больше нуля и находиться в допустимом диапазоне.";
}

export function parseAmount(value: string): number {
  const result: true | string = validateAmount(value);
  if (result !== true) throw new Error(result);
  return Number(value.trim().replace(",", "."));
}

export function validateDate(value: string): true | string {
  const text: string = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || text.startsWith("0000")) {
    return "Введите дату в формате ГГГГ-ММ-ДД, например 2026-10-20.";
  }
  const date: Date = new Date(`${text}T00:00:00.000Z`);
  return (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text)
    || "Такой даты не существует. Проверьте день, месяц и год.";
}

export function validateCsvFilename(value: string): true | string {
  return (value.trim().length > 0 && !value.includes("\0") && /\.csv$/i.test(value.trim()))
    || "Введите путь к CSV-файлу с расширением .csv, например account.csv.";
}
