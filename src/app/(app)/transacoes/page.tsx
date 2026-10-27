"use client";

import { Search, X } from "@/components/icons";
import { useMemo, useState } from "react";
import { Money, Screen, Segmented, TopBar } from "@/components/ui";
import { TransactionRow } from "@/components/TransactionRow";
import { CATEGORIES } from "@/lib/categories";
import { monthLong, monthOf, relativeDay, todayISO } from "@/lib/dates";
import { useStore } from "@/lib/store";

type Filter = "todas" | "saidas" | "entradas";

// Lista no padrão dos trackers: resumo do mês em cima, busca, e um bloco por dia com o total do dia.
export default function Transactions() {
  const { data, removeTransaction } = useStore();
  const [filter, setFilter] = useState<Filter>("todas");
  const [query, setQuery] = useState("");
  const month = monthOf(todayISO());

  const summary = useMemo(() => {
    const inMonth = data.transactions.filter((t) => monthOf(t.date) === month);
    return {
      income: inMonth.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
      spent: inMonth.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0),
    };
  }, [data.transactions, month]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...data.transactions]
      .filter((t) => (filter === "todas" ? true : filter === "saidas" ? t.amount < 0 : t.amount > 0))
      .filter((t) => !q || t.description.toLowerCase().includes(q) || CATEGORIES[t.category].label.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date));
    const map = new Map<string, typeof list>();
    for (const t of list) map.set(t.date, [...(map.get(t.date) ?? []), t]);
    return [...map.entries()].map(([date, items]) => ({ date, items, total: items.reduce((s, t) => s + t.amount, 0) }));
  }, [data.transactions, filter, query]);

  return (
    <Screen className="!px-2.5 !pb-32">
      <div className="px-3.5">
        <TopBar back="/inicio" />
        <h1 className="mt-6 font-display text-heading leading-none">transações</h1>
      </div>

      <section className="paper animate-rise mt-5 rounded-card-lg p-5">
        <p className="text-caption text-muted">{monthLong(month)} até agora</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-field bg-tile px-4 py-3">
            <p className="text-label text-muted">entrou</p>
            <Money value={summary.income} sign className="mt-0.5 block font-display text-value" />
          </div>
          <div className="rounded-field bg-tile px-4 py-3">
            <p className="text-label text-muted">saiu</p>
            <Money value={summary.spent} sign className="mt-0.5 block font-display text-value" />
          </div>
        </div>
        <label className="mt-2 flex h-12 items-center gap-2 rounded-full bg-tile px-4">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="buscar por nome ou categoria"
            aria-label="Buscar lançamentos"
            className="h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-muted"
          />
          {query && (
            <button aria-label="Limpar busca" onClick={() => setQuery("")} className="text-muted">
              <X size={16} />
            </button>
          )}
        </label>
      </section>

      <div className="animate-rise delay-1 mt-2.5">
        <Segmented
          options={[
            { value: "todas", label: "todas" },
            { value: "saidas", label: "saídas" },
            { value: "entradas", label: "entradas" },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {groups.length === 0 && (
        <p className="mt-10 text-center text-body-sm text-muted">{query ? `nada com “${query}”.` : "nenhum lançamento."}</p>
      )}
      <div className="animate-rise delay-2 mt-2.5 space-y-2.5">
        {groups.map(({ date, items, total }) => (
          <section key={date} className="glass-strong rounded-card-lg px-4 pb-2 pt-4 [--row-bg:var(--glass-strong)]">
            <h2 className="flex items-baseline justify-between px-1 text-label">
              <span className="font-medium text-ink-soft">{relativeDay(date)}</span>
              <Money value={total} sign className="text-muted" />
            </h2>
            <div className="mt-1">
              {items.map((t) => (
                <TransactionRow key={t.id} t={t} onDelete={() => removeTransaction(t.id)} />
              ))}
            </div>
          </section>
        ))}
      </div>
      {groups.length > 0 && <p className="mt-4 text-center text-caption text-muted">arraste um lançamento para a esquerda para apagar</p>}
    </Screen>
  );
}
