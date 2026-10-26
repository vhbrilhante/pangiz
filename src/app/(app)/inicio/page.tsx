"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, Eye, EyeOff, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { cx, Money, Roll, Screen } from "@/components/ui";
import { Island, useTilt } from "@/components/visuals";
import { Pullable } from "@/components/pull";
import { monthLong, monthShort, relativeDay, todayISO } from "@/lib/dates";
import { money } from "@/lib/format";
import { currentBalance, project, upcoming } from "@/lib/projection";
import { useStore } from "@/lib/store";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "bom dia";
  if (h < 18) return "boa tarde";
  return "boa noite";
}

// Início em blocos: o claro mostra o saldo, o verde quanto dá pra investir no mês escolhido,
// o floresta uma prévia da projeção.
export default function Home() {
  const { data, setSettings, update } = useStore();
  const p = useMemo(() => project(data), [data]);
  const balance = currentBalance(data);
  const [picked, setPicked] = useState<number | null>(null);
  const selIndex = picked ?? Math.max(0, p.months.findIndex((m) => m.investable > 0));
  const sel = p.months[selIndex];
  const next = useMemo(() => upcoming(data, 45)[0], [data]);
  const hide = data.settings.hideValues;
  const name = data.user?.name.split(" ")[0].toLowerCase() ?? "você";
  const [island, setIsland] = useState(false);
  const [syncedNow, setSyncedNow] = useState(false);
  const tilt = useTilt<HTMLElement>(0.5);
  const bars = p.months.slice(0, 12);
  const barMax = Math.max(1, ...bars.map((m) => Math.max(m.afterInvesting, 0) + m.investable));

  // Simula a sincronização: confere os saldos hoje e mexe alguns centavos, como se o banco tivesse respondido.
  const refresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1100));
    update((d) => ({
      ...d,
      accounts: d.accounts.map((a) => ({ ...a, checkedAt: todayISO(), balance: Math.round((a.balance + (Math.random() * 60 - 20)) * 100) / 100 })),
    }));
    setSyncedNow(true);
    setIsland(true);
    setTimeout(() => setIsland(false), 1600);
  }, [update]);

  return (
    <Screen light="top" className="!px-2.5 !pb-[calc(max(var(--safe-bottom),12px)+92px)]">
      <Island open={island}>
        <RefreshCw size={13} />
        <span>saldos atualizados</span>
      </Island>

      <Pullable onRefresh={refresh}>
        <section className="paper animate-rise rounded-card-lg p-5">
          <div className="flex items-center justify-between">
            <span aria-hidden className="grid size-11 place-items-center rounded-full bg-ink font-display text-[22px] text-lime">p</span>
            <button
              aria-label={hide ? "mostrar valores" : "esconder valores"}
              onClick={() => setSettings({ hideValues: !hide })}
              className="grid size-11 place-items-center rounded-full bg-tile transition active:scale-95"
            >
              {hide ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="mt-5 flex items-center gap-2 text-caption text-muted">
            <span className="size-1.5 rounded-full bg-ink" /> visão geral
          </p>
          <h1 className="mt-2 font-display text-heading">
            {greeting()}, {name}
          </h1>
          <p className="mt-3 text-body-sm text-ink-soft">você tem disponível</p>
          <p className="big mt-1 text-display">
            <Roll value={balance} />
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <span className="flex h-12 items-center justify-between rounded-full bg-tile px-4 text-label">
              <span className="text-muted">contas</span>
              <span className="font-medium">{data.accounts.length}</span>
            </span>
            <span className="flex h-12 items-center justify-between rounded-full bg-tile px-4 text-label">
              <span className="text-muted">{syncedNow ? "atualizado" : "conferido"}</span>
              <span className="font-medium">{syncedNow ? "agora" : relativeDay(data.accounts[0]?.checkedAt ?? todayISO())}</span>
            </span>
          </div>
        </section>
      </Pullable>

      <section
        ref={tilt}
        className="glow animate-rise delay-1 mt-2.5 rounded-card-lg p-5 [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-start gap-2">
              <p className="big text-display-sm">
                <Roll value={sel.investable} compact />
              </p>
              <span className="mt-1 rounded-full bg-ink px-2 py-0.5 text-micro text-on-ink">{monthShort(sel.month)}</span>
            </div>
            <p className="mt-1.5 text-label text-ink-soft">
              {sel.investable > 0
                ? `dá pra investir em ${monthLong(sel.month)}, sem tocar nos ${money(data.settings.reserve, { compact: true })} de reserva`
                : `em ${monthLong(sel.month)} não sobra pra investir`}
            </p>
          </div>
          <Link href="/projecao" aria-label="Ver projeção" className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-on-ink transition active:scale-95">
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-11 items-center gap-1 rounded-full bg-tile px-1.5">
            <button
              aria-label="Mês anterior"
              onClick={() => setPicked(Math.max(0, selIndex - 1))}
              disabled={selIndex === 0}
              className="grid size-8 place-items-center rounded-full transition active:scale-90 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-8 text-center text-label font-medium">{monthShort(sel.month)}</span>
            <button
              aria-label="Próximo mês"
              onClick={() => setPicked(Math.min(p.months.length - 1, selIndex + 1))}
              disabled={selIndex === p.months.length - 1}
              className="grid size-8 place-items-center rounded-full transition active:scale-90 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          {next && (
            <span className="flex h-11 min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-tile pl-4 pr-3 text-label">
              <span className="truncate">
                {next.description.toLowerCase()} · {relativeDay(next.date)}
              </span>
              <Money value={-next.amount} compact className="shrink-0 font-medium" />
            </span>
          )}
        </div>
      </section>

      <Link href="/projecao" className="forest animate-rise delay-2 mt-2.5 block rounded-card-lg p-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-caption text-ink-soft">
            <span className="size-1.5 rounded-full bg-lime" /> projeção · {bars.length} meses
          </p>
          <span className="rounded-full bg-ink px-3 py-1 text-caption font-medium text-on-ink">ver</span>
        </div>
        <p className="mt-2 font-display text-value">
          <Money value={p.totalInvestable} compact /> <span className="text-ink-soft">até {monthShort(bars[bars.length - 1].month)}</span>
        </p>
        <div aria-hidden className="mt-4 flex h-20 items-end gap-1.5">
          {bars.map((m, i) => (
            <span
              key={m.month}
              className={cx("flex-1 rounded-full transition-[height] duration-700")}
              style={{
                height: `${Math.max(14, ((Math.max(m.afterInvesting, 0) + m.investable) / barMax) * 100)}%`,
                background: i === selIndex ? "var(--ink)" : m.investable > 0 ? "rgb(198 242 90 / .7)" : "rgb(255 255 255 / .2)",
              }}
            />
          ))}
        </div>
      </Link>
    </Screen>
  );
}
