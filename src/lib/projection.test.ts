import { describe, expect, it } from "vitest";
import { EMPTY } from "./store";
import { openBill, project } from "./projection";
import type { AppData } from "./types";

const TODAY = "2026-10-26";

function base(over: Partial<AppData> = {}): AppData {
  return {
    ...EMPTY,
    accounts: [{ id: "a", bank: "nubank", name: "Conta", balance: 1000, checkedAt: TODAY }],
    settings: { ...EMPTY.settings, reserve: 500, horizon: 3 },
    ...over,
  };
}

describe("project", () => {
  it("parte do saldo atual e soma salário e contas fixas que ainda vão cair", () => {
    const data = base({
      recurring: [
        { id: "s", description: "Salário", amount: 3000, day: 5, category: "salario", accountId: "a", startMonth: "2026-10" },
        { id: "r", description: "Aluguel", amount: -1000, day: 8, category: "moradia", accountId: "a", startMonth: "2026-10" },
      ],
    });
    const p = project(data, { today: TODAY });
    // Outubro: salário e aluguel já passaram.
    expect(p.months[0].endBalance).toBe(1000);
    expect(p.months[1].endBalance).toBe(3000);
    expect(p.months[2].endBalance).toBe(5000);
  });

  it("não sugere investir algo que faria o saldo cair abaixo da reserva depois", () => {
    const data = base({
      installments: [
        { id: "p", description: "Curso", installmentAmount: 400, count: 1, firstMonth: "2026-11", category: "educacao", day: 10 },
      ],
    });
    const p = project(data, { today: TODAY });
    // 1000 hoje, -400 em novembro: só 100 ficam acima da reserva de 500.
    expect(p.months[0].investable).toBe(100);
    expect(p.totalInvestable).toBe(100);
    expect(Math.min(...p.months.map((m) => m.afterInvesting))).toBeGreaterThanOrEqual(500);
  });

  it("compras no cartão viram a fatura do mês seguinte, com as parcelas do mês", () => {
    const data = base({
      cards: [{ id: "c", bank: "nubank", name: "Nubank", last4: "1234", limit: 5000, dueDay: 10 }],
      transactions: [{ id: "t", date: "2026-10-20", description: "Mercado", amount: -200, category: "mercado", cardId: "c" }],
      installments: [{ id: "i", description: "Celular", installmentAmount: 300, count: 3, firstMonth: "2026-11", category: "compras", cardId: "c" }],
    });
    const p = project(data, { today: TODAY });
    const nov = p.months[1];
    expect(nov.cardBills).toBe(-500);
    expect(p.months[2].cardBills).toBe(-300);
    const bill = openBill(data, data.cards[0], TODAY);
    expect(bill.total).toBe(500);
    expect(bill.used).toBe(200 + 900);
  });

  it("avisa quando o saldo fica negativo", () => {
    const data = base({
      recurring: [{ id: "r", description: "Aluguel", amount: -1500, day: 8, category: "moradia", accountId: "a", startMonth: "2026-10" }],
    });
    const p = project(data, { today: TODAY });
    expect(p.goesNegative?.date).toBe("2026-11-08");
    expect(p.totalInvestable).toBe(0);
  });
});
