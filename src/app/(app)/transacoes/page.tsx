"use client";

import { useMemo, useState } from "react";
import { Screen, Segmented, TopBar } from "@/components/ui";
import { TransactionRow } from "@/components/TransactionRow";
import { relativeDay } from "@/lib/dates";
import { useStore } from "@/lib/store";

type Filter = "todas" | "saidas" | "entradas";

export default function Transactions() {
  const { data, removeTransaction } = useStore();
  const [filter, setFilter] = useState<Filter>("todas");

  const groups = useMemo(() => {
    const list = [...data.transactions]
      .filter((t) => (filter === "todas" ? true : filter === "saidas" ? t.amount < 0 : t.amount > 0))
      .sort((a, b) => b.date.localeCompare(a.date));
    const map = new Map<string, typeof list>();
    for (const t of list) map.set(t.date, [...(map.get(t.date) ?? []), t]);
    return [...map.entries()];
  }, [data.transactions, filter]);

  return (
    <Screen className="!pb-32">
      <TopBar back="/inicio" />
      <h1 className="mt-6 font-display text-heading leading-none">transações</h1>
      <div className="mt-5">
        <Segmented
          options={[
            { value: "todas", label: "Todas" },
            { value: "saidas", label: "Saídas" },
            { value: "entradas", label: "Entradas" },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>
      {groups.length === 0 && <p className="mt-8 text-center text-body-sm text-muted">Nenhum lançamento.</p>}
      <div className="mt-6 space-y-6">
        {groups.map(([date, items]) => (
          <section key={date}>
            <h2 className="mb-3 text-label font-semibold uppercase tracking-wide text-muted">{relativeDay(date)}</h2>
            <div className="space-y-3.5">
              {items.map((t) => (
                <TransactionRow key={t.id} t={t} onDelete={() => removeTransaction(t.id)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Screen>
  );
}
