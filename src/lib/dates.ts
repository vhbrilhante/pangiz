// Datas como strings: "yyyy-mm-dd" para dias e "yyyy-mm" para meses.
// Assim evitamos surpresas de fuso horário com objetos Date.

const pad = (n: number) => String(n).padStart(2, "0");

export function todayISO(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function monthOf(dateISO: string): string {
  return dateISO.slice(0, 7);
}

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`;
}

/** Quantos meses de `a` até `b` (b - a). */
export function monthDiff(a: string, b: string): number {
  const [ya, ma] = a.split("-").map(Number);
  const [yb, mb] = b.split("-").map(Number);
  return yb * 12 + mb - (ya * 12 + ma);
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/** Dia `day` dentro de `month`, limitado ao último dia do mês. */
export function dayIn(month: string, day: number): string {
  return `${month}-${pad(Math.min(day, daysInMonth(month)))}`;
}

export function addDays(dateISO: string, n: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  return todayISO(new Date(y, m - 1, d + n));
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTHS_LONG = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function monthShort(month: string): string {
  return MONTHS[Number(month.slice(5, 7)) - 1];
}

export function monthLong(month: string): string {
  return MONTHS_LONG[Number(month.slice(5, 7)) - 1];
}

/** "nov 2026" */
export function monthLabel(month: string): string {
  return `${monthShort(month)} ${month.slice(0, 4)}`;
}

/** "12 nov" */
export function dayLabel(dateISO: string): string {
  return `${Number(dateISO.slice(8, 10))} ${MONTHS[Number(dateISO.slice(5, 7)) - 1]}`;
}

export function relativeDay(dateISO: string, today = todayISO()): string {
  if (dateISO === today) return "hoje";
  if (dateISO === addDays(today, -1)) return "ontem";
  if (dateISO === addDays(today, 1)) return "amanhã";
  return dayLabel(dateISO);
}
