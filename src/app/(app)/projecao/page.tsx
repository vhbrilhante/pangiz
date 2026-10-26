"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cx, Money, Roll, Screen, Segmented, Tag } from "@/components/ui";
import { ProjectionScrub } from "@/components/visuals";
import { dayLabel, monthLong, monthShort, relativeDay, todayISO } from "@/lib/dates";
import { project } from "@/lib/projection";
import { useStore } from "@/lib/store";

const HORIZONS = [
  { value: "6", label: "6 meses" },
  { value: "12", label: "12 meses" },
];

// Um número, um gráfico arrastável por mês e a reserva. O resto da conta fica escondido atrás disso.
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
    <Screen light="middle" className="!pb-[calc(max(var(--safe-bottom),20px)+96px)]">
      <h1 className="text-title font-medium">projeção</h1>

      <section className="mt-6">
        <p className="animate-rise text-label text-muted">
          dá pra investir até {monthLong(last.month)} de {last.month.slice(0, 4)}
        </p>
        <p className="big mt-2.5 text-display-xl">
          <Roll value={p.totalInvestable} compact />
        </p>
        {p.goesNegative && (
          <Tag tone="negative" className="mt-3">
            saldo negativo em {dayLabel(p.goesNegative.date)}
          </Tag>
        )}
      </section>

      <div className="animate-rise delay-1 mt-5 w-[200px]">
        <Segmented
          options={HORIZONS}
          value={data.settings.horizon > 6 ? "12" : "6"}
          onChange={(v) => {
            setSettings({ horizon: Number(v) });
            setPicked(null);
          }}
        />
      </div>

      <div className="animate-rise delay-2">
        <ProjectionScrub
          months={p.months.map((m) => ({ month: m.month, label: monthShort(m.month), end: m.afterInvesting, investable: m.investable }))}
          reserve={reserve}
          selected={selected}
          onSelect={setPicked}
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4">
        <div>
          <p className="text-caption text-muted">entra</p>
          <Money value={sel.income} compact className="mt-1 block text-body-lg font-medium" />
        </div>
        <div>
          <p className="text-caption text-muted">sai</p>
          <Money value={sel.expenses + sel.installments + sel.cardBills} compact className="mt-1 block text-body-lg font-medium" />
        </div>
        <div>
          <p className="text-caption text-muted">fim de {monthShort(sel.month)}</p>
          <Money value={sel.endBalance} compact className={cx("mt-1 block text-body-lg font-medium", sel.endBalance < 0 && "text-negative")} />
        </div>
      </div>

      <section className="mt-5 rounded-card bg-white/6 p-[18px] backdrop-blur-xl">
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

      <p className="mx-1 mt-4 text-caption text-muted">
        usa o saldo, as contas fixas e as parcelas que estão aqui. saldo conferido {relativeDay(oldest)}.{" "}
        <Link href="/perfil#contas" className="text-ink-soft underline underline-offset-4">
          corrigir
        </Link>
      </p>
    </Screen>
  );
}
