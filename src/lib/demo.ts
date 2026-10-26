// Dados de exemplo usados quando o usuário "conecta" bancos.
// A conexão real (Open Finance ou importação de extrato) ainda não existe:
// este MVP simula o resultado para dar para testar a projeção de ponta a ponta.

import { addDays, addMonths, monthOf, todayISO } from "./dates";
import { uid } from "./format";
import type { Account, Card, Installment, Recurring, Transaction } from "./types";

export interface Bank {
  id: string;
  name: string;
  short: string;
  color: string;
}

export const BANKS: Bank[] = [
  { id: "nubank", name: "Nubank", short: "nu", color: "#820ad1" },
  { id: "itau", name: "Itaú", short: "itaú", color: "#ec7000" },
  { id: "inter", name: "Banco Inter", short: "in", color: "#ff7a00" },
  { id: "c6", name: "C6 Bank", short: "C6", color: "#1d1d1b" },
  { id: "bb", name: "Banco do Brasil", short: "BB", color: "#f8d117" },
  { id: "caixa", name: "Caixa", short: "cx", color: "#0070af" },
  { id: "santander", name: "Santander", short: "S", color: "#ec0000" },
  { id: "bradesco", name: "Bradesco", short: "B", color: "#cc092f" },
];

export function bankById(id: string): Bank {
  return BANKS.find((b) => b.id === id) ?? { id, name: id, short: id.slice(0, 2), color: "#5b6068" };
}

const BALANCES: Record<string, number> = {
  nubank: 2340.5, itau: 1180.2, inter: 860, c6: 420.75, bb: 1530, caixa: 310, santander: 980, bradesco: 640,
};

export function demoData(bankIds: string[], today = todayISO()) {
  const month = monthOf(today);
  const ids = bankIds.length ? bankIds : ["nubank"];
  const main = ids[0];

  const accounts: Account[] = ids.map((b) => ({
    id: `acc-${b}`,
    bank: b,
    name: `Conta ${bankById(b).name}`,
    balance: BALANCES[b] ?? 500,
    checkedAt: today,
  }));

  const cards: Card[] = [
    { id: `card-${main}`, bank: main, name: bankById(main).name, last4: "5588", limit: 8000, dueDay: 10 },
  ];
  const card = cards[0].id;
  const acc = accounts[0].id;

  const recurring: Recurring[] = [
    { id: uid(), description: "Salário", amount: 3800, day: 5, category: "salario", accountId: acc, startMonth: month },
    { id: uid(), description: "Aluguel", amount: -1200, day: 8, category: "moradia", accountId: acc, startMonth: month },
    { id: uid(), description: "Conta de luz", amount: -145, day: 15, category: "contas", accountId: acc, startMonth: month },
    { id: uid(), description: "Internet", amount: -99.9, day: 20, category: "contas", accountId: acc, startMonth: month },
    { id: uid(), description: "Academia", amount: -89.9, day: 3, category: "saude", cardId: card, startMonth: month },
    { id: uid(), description: "Spotify", amount: -21.9, day: 12, category: "assinaturas", cardId: card, startMonth: month },
  ];

  const installments: Installment[] = [
    {
      id: uid(), description: "iPhone", installmentAmount: 412.5, count: 12,
      firstMonth: addMonths(month, -3), category: "compras", cardId: card,
    },
    {
      id: uid(), description: "Curso de inglês", installmentAmount: 180, count: 6,
      firstMonth: addMonths(month, -1), category: "educacao", day: 25,
    },
    {
      id: uid(), description: "Passagem de férias", installmentAmount: 265, count: 5,
      firstMonth: addMonths(month, 1), category: "lazer", cardId: card,
    },
  ];

  const d = (n: number) => addDays(today, -n);
  const all: Transaction[] = [
    { id: uid(), date: d(0), description: "Supermercado Nova Era", amount: -184.32, category: "mercado", cardId: card },
    { id: uid(), date: d(0), description: "Pix recebido · Ana", amount: 120, category: "pix", accountId: acc },
    { id: uid(), date: d(1), description: "Café Regional", amount: -14.5, category: "alimentacao", cardId: card },
    { id: uid(), date: d(2), description: "Uber", amount: -23.8, category: "transporte", cardId: card },
    { id: uid(), date: d(3), description: "iFood", amount: -46.9, category: "alimentacao", cardId: card },
    { id: uid(), date: d(5), description: "Farmácia", amount: -38.4, category: "saude", accountId: acc },
    { id: uid(), date: d(6), description: "Cinema", amount: -52, category: "lazer", cardId: card },
    { id: uid(), date: d(8), description: "Feira", amount: -61.2, category: "mercado", accountId: acc },
    // Compras do mês passado: compõem a fatura que vence neste mês.
    { id: uid(), date: d(32), description: "Supermercado Nova Era", amount: -231.1, category: "mercado", cardId: card },
    { id: uid(), date: d(38), description: "Restaurante", amount: -88, category: "alimentacao", cardId: card },
  ];
  const transactions = all.filter((t) => monthOf(t.date) >= addMonths(month, -1));

  return { accounts, cards, recurring, installments, transactions };
}
