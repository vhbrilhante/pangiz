// O coração do pangiz: projetar o saldo mês a mês e responder
// "quanto posso investir, e em que mês?".
//
// Regras simples (e explícitas, para o usuário entender o número):
// - O saldo das contas hoje é o ponto de partida. Ele já inclui tudo que passou.
// - Contas fixas e parcelas em boleto caem no dia delas.
// - Compras no cartão de um mês viram a fatura do mês seguinte, no dia de vencimento.
// - Parcelas no cartão entram na fatura do mês da parcela.
// - "Pode investir" = quanto dá para tirar no fim do mês sem que o saldo
//   fique abaixo da reserva em nenhum momento depois (até o fim do horizonte).

import { addDays, addMonths, dayIn, monthDiff, monthOf, todayISO } from "./dates";
import type { AppData, Card, CategoryId } from "./types";

export type EventKind = "income" | "expense" | "installment" | "card";

export interface CashEvent {
  date: string;
  description: string;
  amount: number;
  kind: EventKind;
  category: CategoryId | "cartao";
  /** "3/12" para parcelas. */
  detail?: string;
  cardId?: string;
}

export interface MonthProjection {
  month: string;
  startBalance: number;
  income: number;
  expenses: number;
  installments: number;
  cardBills: number;
  endBalance: number;
  /** Menor saldo em algum dia do mês. */
  lowest: number;
  /** Quanto dá para investir no fim deste mês. */
  investable: number;
  /** Saldo no fim do mês se o usuário investir tudo o que foi sugerido até aqui. */
  afterInvesting: number;
  events: CashEvent[];
}

export interface Projection {
  months: MonthProjection[];
  totalInvestable: number;
  /** Primeiro mês em que dá para investir algo. */
  firstInvestMonth: MonthProjection | null;
  /** O saldo fica abaixo de zero em algum momento? */
  goesNegative: { date: string; balance: number } | null;
}

function isActive(month: string, start: string, end?: string) {
  return monthDiff(start, month) >= 0 && (!end || monthDiff(month, end) >= 0);
}

/** Valor da fatura de um cartão que será paga em `payMonth`. */
export function cardBillFor(data: AppData, card: Card, payMonth: string): { total: number; parts: CashEvent[] } {
  const buyMonth = addMonths(payMonth, -1);
  const parts: CashEvent[] = [];

  for (const t of data.transactions) {
    if (t.cardId === card.id && monthOf(t.date) === buyMonth) {
      parts.push({ date: t.date, description: t.description, amount: t.amount, kind: "expense", category: t.category });
    }
  }
  for (const r of data.recurring) {
    if (r.cardId === card.id && isActive(buyMonth, r.startMonth, r.endMonth)) {
      parts.push({ date: dayIn(buyMonth, r.day), description: r.description, amount: r.amount, kind: "expense", category: r.category });
    }
  }
  for (const p of data.installments) {
    if (p.cardId !== card.id) continue;
    const i = monthDiff(p.firstMonth, payMonth);
    if (i >= 0 && i < p.count) {
      parts.push({
        date: dayIn(payMonth, card.dueDay),
        description: p.description,
        amount: -p.installmentAmount,
        kind: "installment",
        category: p.category,
        detail: `${i + 1}/${p.count}`,
      });
    }
  }
  return { total: parts.reduce((s, e) => s + e.amount, 0), parts };
}

/** Todos os eventos que mexem no saldo das contas dentro de um mês. */
function monthEvents(data: AppData, month: string, today: string): CashEvent[] {
  const events: CashEvent[] = [];
  const future = (date: string) => date > today;

  for (const r of data.recurring) {
    if (r.cardId || !isActive(month, r.startMonth, r.endMonth)) continue;
    const date = dayIn(month, r.day);
    if (!future(date)) continue;
    events.push({
      date,
      description: r.description,
      amount: r.amount,
      kind: r.amount >= 0 ? "income" : "expense",
      category: r.category,
    });
  }

  for (const p of data.installments) {
    if (p.cardId) continue;
    const i = monthDiff(p.firstMonth, month);
    if (i < 0 || i >= p.count) continue;
    const date = dayIn(month, p.day ?? 10);
    if (!future(date)) continue;
    events.push({
      date,
      description: p.description,
      amount: -p.installmentAmount,
      kind: "installment",
      category: p.category,
      detail: `${i + 1}/${p.count}`,
    });
  }

  for (const card of data.cards) {
    const date = dayIn(month, card.dueDay);
    if (!future(date)) continue;
    const bill = cardBillFor(data, card, month);
    if (bill.total === 0) continue;
    events.push({
      date,
      description: `Fatura ${card.name}`,
      amount: bill.total,
      kind: "card",
      category: "cartao",
      cardId: card.id,
    });
  }

  // Lançamentos avulsos com data futura (ex.: um pix agendado).
  for (const t of data.transactions) {
    if (t.cardId || monthOf(t.date) !== month || !future(t.date)) continue;
    events.push({
      date: t.date,
      description: t.description,
      amount: t.amount,
      kind: t.amount >= 0 ? "income" : "expense",
      category: t.category,
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date) || b.amount - a.amount);
}

export function currentBalance(data: AppData): number {
  return data.accounts.reduce((s, a) => s + a.balance, 0);
}

export function project(data: AppData, opts: { months?: number; today?: string } = {}): Projection {
  const today = opts.today ?? todayISO();
  const horizon = opts.months ?? data.settings.horizon;
  const first = monthOf(today);

  let balance = currentBalance(data);
  let goesNegative: Projection["goesNegative"] = null;
  const months: MonthProjection[] = [];

  for (let i = 0; i < horizon; i++) {
    const month = addMonths(first, i);
    const events = monthEvents(data, month, today);
    const start = balance;
    let lowest = balance;
    const m: MonthProjection = {
      month, startBalance: start, income: 0, expenses: 0, installments: 0, cardBills: 0,
      endBalance: 0, lowest: 0, investable: 0, afterInvesting: 0, events,
    };
    for (const e of events) {
      balance += e.amount;
      lowest = Math.min(lowest, balance);
      if (balance < 0 && !goesNegative) goesNegative = { date: e.date, balance };
      if (e.kind === "income") m.income += e.amount;
      else if (e.kind === "expense") m.expenses += e.amount;
      else if (e.kind === "installment") m.installments += e.amount;
      else m.cardBills += e.amount;
    }
    m.endBalance = balance;
    m.lowest = lowest;
    months.push(m);
  }

  // Quanto dá para investir: guloso, do primeiro mês para o último.
  // Investir X no fim do mês i reduz todos os saldos seguintes em X.
  const reserve = data.settings.reserve;
  let allocated = 0;
  for (let i = 0; i < months.length; i++) {
    let floor = months[i].endBalance;
    for (let k = i + 1; k < months.length; k++) floor = Math.min(floor, months[k].lowest);
    const can = Math.max(0, floor - reserve - allocated);
    months[i].investable = Math.floor(can / 10) * 10; // arredonda para baixo, de 10 em 10
    allocated += months[i].investable;
    months[i].afterInvesting = months[i].endBalance - allocated;
  }

  return {
    months,
    totalInvestable: allocated,
    firstInvestMonth: months.find((m) => m.investable > 0) ?? null,
    goesNegative,
  };
}

/** Próximos pagamentos (só saídas) nos próximos `days` dias. */
export function upcoming(data: AppData, days = 30, today = todayISO()): CashEvent[] {
  const end = addDays(today, days);
  const p = project(data, { months: 3, today });
  return p.months
    .flatMap((m) => m.events)
    .filter((e) => e.amount < 0 && e.date <= end);
}

/** Fatura em aberto (a que será paga no próximo vencimento). */
export function openBill(data: AppData, card: Card, today = todayISO()) {
  const month = monthOf(today);
  const dueThisMonth = dayIn(month, card.dueDay) > today;
  const payMonth = dueThisMonth ? month : addMonths(month, 1);
  const bill = cardBillFor(data, card, payMonth);
  // Limite usado: esta fatura + as próximas (compras recentes e parcelas que faltam).
  let used = 0;
  for (let i = 0; i < 48; i++) {
    const { parts } = cardBillFor(data, card, addMonths(payMonth, i));
    // Assinaturas futuras ainda não foram cobradas, então não ocupam limite.
    for (const e of parts) if (i <= 1 || e.kind === "installment") used -= e.amount;
  }
  return { payMonth, dueDate: dayIn(payMonth, card.dueDay), total: -bill.total, used, parts: bill.parts };
}
