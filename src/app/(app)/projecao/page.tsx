"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, cx, Money, Rise, Roll, Screen, Segmented } from "@/components/ui";
import { ProjectionScrub } from "@/components/visuals";
import { monthLong, monthShort, relativeDay, todayISO } from "@/lib/dates";
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
    <Screen className="pb-36">
      <Rise text="projeção" className="text-[32px]" />
      <p className="animate-rise mt-1.5 text-[13px] text-ink-soft">quanto você pode investir, e em que mês.</p>

      <div className="animate-rise delay-1 mt-[18px]">
        <Segmented
          options={HORIZONS}
          value={data.settings.horizon > 6 ? "12" : "6"}
          onChange={(v) => {
            setSettings({ horizon: Number(v) });
            setPicked(null);
          }}
        />
      </div>

      <Card className="animate-rise delay-2 mt-3.5">
        <p className="text-[11px] text-muted">
          dá para investir até {monthLong(last.month)} de {last.month.slice(0, 4)}
        </p>
        <p className="big mt-2.5 text-[44px]">
          <Roll value={p.totalInvestable} />
        </p>
        {p.goesNegative && <p className="mt-2 text-[12px] text-negative">o saldo fica negativo em algum momento. veja os meses em vermelho.</p>}

        <ProjectionScrub
          months={p.months.map((m) => ({ month: m.month, label: monthShort(m.month), end: m.afterInvesting, investable: m.investable }))}
          reserve={reserve}
          selected={selected}
          onSelect={setPicked}
        />

        <div className="mt-[18px] grid grid-cols-3 gap-2 border-t border-line pt-3.5">
          <div>
            <p className="text-[11px] text-muted">entra</p>
            <Money value={sel.income} compact className="mt-1 block text-[14px] text-positive" />
          </div>
          <div>
            <p className="text-[11px] text-muted">sai</p>
            <Money value={sel.expenses + sel.installments + sel.cardBills} compact className="mt-1 block text-[14px]" />
          </div>
          <div>
            <p className="text-[11px] text-muted">fim de {monthShort(sel.month)}</p>
            <Money value={sel.endBalance} compact className={cx("mt-1 block text-[14px]", sel.endBalance < 0 && "text-negative")} />
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted">arraste no gráfico para ver cada mês</p>
      </Card>

      <Card className="animate-rise delay-3 mt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px]">reserva na conta</span>
          <span className="big text-[22px]">
            <Roll value={reserve} compact />
          </span>
        </div>
        <input
          type="range"
          className="reserve mt-2"
          min={0}
          max={10000}
          step={250}
          value={reserve}
          aria-label="Reserva na conta"
          style={{ "--p": `${reserve / 100}%` } as React.CSSProperties}
          onChange={(e) => setSettings({ reserve: Number(e.target.value) })}
        />
        <p className="text-[11px] text-muted">arraste: quanto mais reserva, menos sobra para investir.</p>
      </Card>

      <p className="mx-1 mt-4 text-[11px] leading-normal text-muted">
        a projeção usa o saldo, as contas fixas e as parcelas que estão aqui. saldo conferido {relativeDay(oldest)}.{" "}
        <Link href="/perfil#contas" className="text-ink-soft underline">
          corrigir
        </Link>
      </p>
    </Screen>
  );
}
