"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cx, Money, Roll, Screen, Segmented, Tag } from "@/components/ui";
import { ProjectionScrub } from "@/components/visuals";
import { dayLabel, monthLong, monthShort, relativeDay, todayISO } from "@/lib/dates";
import { project } from "@/lib/projection";
import { useStore } from "@/lib/store";

const HORIZONS = [
  { value: "6", label: "6m" },
  { value: "12", label: "12m" },
];

// Projeção em blocos: o floresta com as barras de cada mês, o escuro com o detalhe do mês e o claro com a reserva.
export default function ProjectionPage() {
  const { data, setSettings } = useStore();
  const p = useMemo(() => project(data), [data]);
  const [picked, setPicked] = useState<number | null>(null);
  const selected = Math.min(picked ?? Math.max(0, p.months.findIndex((m) => m.investable > 0)), p.months.length - 1);
  const sel = p.months[selected];
  const last = p.months[p.months.length - 1];
  const reserve = data.settings.reserve;
  const oldest = data.accounts.reduce((min, a) => (a.checkedAt < min ? a.checkedAt : min), todayISO());

  return (
    <Screen light="top" className="!px-2.5 !pb-[calc(max(var(--safe-bottom),12px)+92px)]">
      <div className="flex items-center justify-between px-2.5 pb-3 pt-1">
        <h1 className="font-display text-heading">projeção</h1>
        <div className="w-32">
          <Segmented
            options={HORIZONS}
            value={data.settings.horizon > 6 ? "12" : "6"}
            onChange={(v) => {
              setSettings({ horizon: Number(v) });
              setPicked(null);
            }}
          />
        </div>
      </div>

      <section className="forest animate-rise rounded-card-lg p-5">
        <p className="flex items-center gap-2 text-caption text-ink-soft">
          <span className="size-1.5 rounded-full bg-lime" /> dá pra investir até {monthLong(last.month)} de {last.month.slice(0, 4)}
        </p>
        <p className="big mt-2 text-display">
          <Roll value={p.totalInvestable} compact />
        </p>
        {p.goesNegative && (
          <Tag tone="negative" className="mt-3">
            saldo negativo em {dayLabel(p.goesNegative.date)}
          </Tag>
        )}
        <ProjectionScrub
          months={p.months.map((m) => ({ month: m.month, label: monthShort(m.month), end: m.afterInvesting, investable: m.investable }))}
          reserve={reserve}
          selected={selected}
          onSelect={setPicked}
        />
      </section>

      <section className="glass-strong animate-rise delay-1 mt-2.5 rounded-card-lg p-5">
        <p className="flex items-center gap-2 text-body-sm font-medium">
          <span className="size-1.5 rounded-full bg-lime" /> {monthLong(sel.month)}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-1.5">
          <div className="rounded-field bg-tile px-3 py-3">
            <Money value={sel.income} compact className="block text-body font-medium" />
            <p className="mt-1 text-caption text-muted">entra</p>
          </div>
          <div className="rounded-field bg-tile px-3 py-3">
            <Money value={-(sel.expenses + sel.installments + sel.cardBills)} compact className="block text-body font-medium" />
            <p className="mt-1 text-caption text-muted">sai</p>
          </div>
          <div className="rounded-field bg-tile px-3 py-3">
            <Money value={sel.endBalance} compact className={cx("block text-body font-medium", sel.endBalance < 0 && "text-negative")} />
            <p className="mt-1 text-caption text-muted">fim do mês</p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-caption text-muted">pode investir</p>
            <p className="big mt-1 text-value">
              <Roll value={sel.investable} compact />
            </p>
          </div>
          <Link href="/lancar" className="flex h-12 items-center rounded-full bg-lime px-6 text-body font-medium text-[var(--on-green)] transition active:scale-95">
            simular gasto
          </Link>
        </div>
      </section>

      <section className="paper animate-rise delay-2 mt-2.5 rounded-card-lg p-5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="reserve" className="text-body-sm">
            reserva na conta
          </label>
          <span className="big text-value">
            <Roll value={reserve} compact />
          </span>
        </div>
        <input
          id="reserve"
          type="range"
          className="reserve mt-2"
          min={0}
          max={10000}
          step={250}
          value={reserve}
          style={{ "--p": `${reserve / 100}%` } as React.CSSProperties}
          onChange={(e) => setSettings({ reserve: Number(e.target.value) })}
        />
        <p className="text-caption text-muted">quanto mais reserva, menos sobra pra investir.</p>
      </section>

      <p className="mx-3 mt-4 text-caption text-muted">
        usa o saldo, as contas fixas e as parcelas que estão aqui. saldo conferido {relativeDay(oldest)}.{" "}
        <Link href="/perfil#contas" className="text-ink-soft underline underline-offset-4">
          corrigir
        </Link>
      </p>
    </Screen>
  );
}
