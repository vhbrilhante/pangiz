"use client";

// Estado do app, guardado no localStorage do aparelho.
// Quando houver backend (SQLite na VM), é só trocar load/save por chamadas à API.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { todayISO } from "./dates";
import { demoData } from "./demo";
import { uid } from "./format";
import type { Account, AppData, Card, Installment, Recurring, Settings, Transaction, User } from "./types";

const KEY = "pangiz:v1";

export const EMPTY: AppData = {
  version: 1,
  onboarded: false,
  user: null,
  setupDone: false,
  accounts: [],
  cards: [],
  transactions: [],
  recurring: [],
  installments: [],
  settings: { reserve: 500, hideValues: false, horizon: 12 },
};

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as AppData;
    return { ...EMPTY, ...parsed, settings: { ...EMPTY.settings, ...parsed.settings } };
  } catch {
    return EMPTY;
  }
}

function save(data: AppData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Sem espaço ou modo privado: o app continua funcionando só na memória.
  }
}

interface Store {
  data: AppData;
  ready: boolean;
  update: (fn: (d: AppData) => AppData) => void;
  finishOnboarding: () => void;
  signUp: (user: Omit<User, "verified">) => void;
  signIn: (email: string) => void;
  verify: () => void;
  connectBanks: (bankIds: string[]) => void;
  manualSetup: (input: { balance: number; salary: number; salaryDay: number }) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
  addRecurring: (r: Omit<Recurring, "id">) => void;
  removeRecurring: (id: string) => void;
  addInstallment: (p: Omit<Installment, "id">) => void;
  removeInstallment: (id: string) => void;
  setBalance: (accountId: string, balance: number) => void;
  addAccount: (a: Omit<Account, "id" | "checkedAt">) => void;
  addCard: (c: Omit<Card, "id">) => void;
  setSettings: (s: Partial<Settings>) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(load());
    setReady(true);
  }, []);

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const store = useMemo<Store>(() => {
    const balanceDelta = (d: AppData, accountId: string | undefined, delta: number): Account[] =>
      d.accounts.map((a) => (a.id === accountId ? { ...a, balance: a.balance + delta } : a));

    return {
      data,
      ready,
      update,
      finishOnboarding: () => update((d) => ({ ...d, onboarded: true })),
      signUp: (user) => update((d) => ({ ...d, onboarded: true, user: { ...user, verified: false } })),
      signIn: (email) =>
        update((d) => ({
          ...d,
          onboarded: true,
          user: d.user && d.user.email === email ? d.user : { name: email.split("@")[0], email, verified: true },
        })),
      verify: () => update((d) => (d.user ? { ...d, user: { ...d.user, verified: true } } : d)),
      connectBanks: (bankIds) =>
        update((d) => ({ ...d, ...demoData(bankIds), setupDone: true })),
      manualSetup: ({ balance, salary, salaryDay }) =>
        update((d) => {
          const acc: Account = { id: uid(), bank: "manual", name: "Minha conta", balance, checkedAt: todayISO() };
          const recurring: Recurring[] = salary
            ? [{ id: uid(), description: "Salário", amount: salary, day: salaryDay, category: "salario", accountId: acc.id, startMonth: todayISO().slice(0, 7) }]
            : [];
          return { ...d, accounts: [acc], cards: [], transactions: [], installments: [], recurring, setupDone: true };
        }),
      addTransaction: (t) =>
        update((d) => ({
          ...d,
          transactions: [{ ...t, id: uid() }, ...d.transactions],
          // Lançamento em conta, já acontecido, mexe no saldo atual.
          accounts: t.accountId && t.date <= todayISO() ? balanceDelta(d, t.accountId, t.amount) : d.accounts,
        })),
      removeTransaction: (id) =>
        update((d) => {
          const t = d.transactions.find((x) => x.id === id);
          return {
            ...d,
            transactions: d.transactions.filter((x) => x.id !== id),
            accounts: t?.accountId && t.date <= todayISO() ? balanceDelta(d, t.accountId, -t.amount) : d.accounts,
          };
        }),
      addRecurring: (r) => update((d) => ({ ...d, recurring: [...d.recurring, { ...r, id: uid() }] })),
      removeRecurring: (id) => update((d) => ({ ...d, recurring: d.recurring.filter((x) => x.id !== id) })),
      addInstallment: (p) => update((d) => ({ ...d, installments: [...d.installments, { ...p, id: uid() }] })),
      removeInstallment: (id) => update((d) => ({ ...d, installments: d.installments.filter((x) => x.id !== id) })),
      setBalance: (accountId, balance) =>
        update((d) => ({
          ...d,
          accounts: d.accounts.map((a) => (a.id === accountId ? { ...a, balance, checkedAt: todayISO() } : a)),
        })),
      addAccount: (a) => update((d) => ({ ...d, accounts: [...d.accounts, { ...a, id: uid(), checkedAt: todayISO() }] })),
      addCard: (c) => update((d) => ({ ...d, cards: [...d.cards, { ...c, id: uid() }] })),
      setSettings: (s) => update((d) => ({ ...d, settings: { ...d.settings, ...s } })),
      reset: () => update(() => EMPTY),
    };
  }, [data, ready, update]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return s;
}
