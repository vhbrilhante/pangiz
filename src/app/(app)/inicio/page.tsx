"use client";

import { ArrowUpRight, Eye, EyeOff, Receipt, RefreshCw, TrendingUp } from "@/components/icons";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Money, Roll, Screen } from "@/components/ui";
import { Island, Sparkline, useTilt } from "@/components/visuals";
import { Pullable } from "@/components/pull";
import { CATEGORIES } from "@/lib/categories";
import { dayLabel, monthShort, relativeDay, todayISO } from "@/lib/dates";
import { currentBalance, openBill, project, upcoming } from "@/lib/projection";
import { useStore } from "@/lib/store";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "bom dia";
  if (h < 18) return "boa tarde";
  return "boa noite";
}

// Início em bento, sem excesso: o saldo, e dois widgets que abrem o resto.
// Investimentos abre a projeção; faturas abre os cartões. Embaixo, só o próximo pagamento.
export default function Home() {
  const { data, setSettings, update } = useStore();
  const p = useMemo(() => project(data), [data]);
  const balance = currentBalance(data);
  const first = p.months.find((m) => m.investable > 0);
  const card = data.cards[0];
  const bill = card ? openBill(data, card) : null;
  const billPct = card && bill ? Math.min(100, (bill.used / (card.limit || 1)) * 100) : 0;
  const next = useMemo(() => upcoming(data, 45).find((e) => e.amount < 0), [data]);
  const hide = data.settings.hideValues;
  const name = data.user?.name.split(" ")[0].toLowerCase() ?? "você";
  const [island, setIsland] = useState(false);
  const [syncedNow, setSyncedNow] = useState(false);
  const tilt = useTilt<HTMLAnchorElement>(0.5);
  const curve = [balance, ...p.months.slice(0, 6).map((m) => m.afterInvesting)];

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

  const NextIcon = next ? CATEGORIES[next.category].icon : null;

  return (
    <Screen light="top" className="!px-2.5 !pb-[calc(max(var(--safe-bottom),12px)+100px)]">
      <Island open={island}>
        <RefreshCw size={13} />
        <span>saldos atualizados</span>
      </Island>

      <header className="animate-rise flex h-12 items-center justify-between px-2.5">
        <span className="flex items-center gap-3">
          <span aria-hidden className="grid size-10 place-items-center rounded-full bg-lime font-display text-[19px] text-[var(--on-green)]">
            {name[0]}
          </span>
          <h1 className="font-display text-[24px] leading-none tracking-[-0.02em]">
            {greeting()}, {name}
          </h1>
        </span>
        <button
          aria-label={hide ? "mostrar valores" : "esconder valores"}
          onClick={() => setSettings({ hideValues: !hide })}
          className="grid size-11 place-items-center rounded-full bg-tile text-ink-soft transition active:scale-95"
        >
          {hide ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </header>

      <div className="mt-9 grid grid-cols-2 gap-2.5">
        <div className="col-span-2">
          <Pullable onRefresh={refresh}>
            <Link href="/transacoes" className="paper animate-rise block rounded-card-lg p-5 transition active:scale-[0.985]">
              <p className="text-caption text-muted">saldo disponível agora</p>
              <p className="big mt-2.5 text-display">
                <Roll value={balance} />
              </p>
              <p className="mt-3 truncate text-caption text-muted">
                {data.accounts.map((a) => a.name.replace(/^conta /i, "").toLowerCase()).join(" · ")} ·{" "}
                {syncedNow ? "atualizado agora" : `conferido ${relativeDay(data.accounts[0]?.checkedAt ?? todayISO())}`} · puxe para atualizar
              </p>
            </Link>
          </Pullable>
        </div>

        <Link
          ref={tilt}
          href="/projecao"
          aria-label="Ver investimentos e projeção"
          className="glow animate-rise delay-1 relative flex aspect-square flex-col justify-between overflow-hidden rounded-card-lg p-4 [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
        >
          <span className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-full bg-tile">
              <TrendingUp size={19} />
            </span>
            <span className="grid size-8 place-items-center rounded-full bg-tile">
              <ArrowUpRight size={13} />
            </span>
          </span>
          <span className="block">
            <span className="block text-caption text-muted">{first ? `investir em ${monthShort(first.month)}` : "ainda não sobra"}</span>
            <span className="big mt-1.5 block text-value">
              <Roll value={first?.investable ?? 0} compact />
            </span>
            <Sparkline values={curve} height={30} className="mt-2" />
          </span>
        </Link>

        <Link
          href="/cartoes"
          aria-label="Ver faturas"
          className="paper animate-rise delay-2 flex aspect-square flex-col justify-between rounded-card-lg p-4 transition active:scale-[0.975]"
        >
          <span className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-full bg-tile text-lime">
              <Receipt size={19} />
            </span>
            <span className="grid size-8 place-items-center rounded-full bg-tile text-ink-soft">
              <ArrowUpRight size={13} />
            </span>
          </span>
          {card && bill ? (
            <span className="block">
              <span className="block truncate text-caption text-muted">fatura {card.name.toLowerCase()}</span>
              <span className="big mt-1.5 block text-value">
                <Roll value={bill.total} compact />
              </span>
              <span className="mt-1 block text-caption text-muted">vence {dayLabel(bill.dueDate).toLowerCase()}</span>
              <span className="mt-2.5 block h-1 overflow-hidden rounded-full bg-tile">
                <span className="block h-full rounded-full bg-lime transition-[width] duration-700" style={{ width: `${billPct}%` }} />
              </span>
            </span>
          ) : (
            <span className="block text-caption text-muted">nenhum cartão ainda</span>
          )}
        </Link>

        {next && NextIcon && (
          <Link
            href="/projecao"
            className="paper animate-rise delay-3 col-span-2 flex items-center gap-3 rounded-card px-4 py-3.5 transition active:scale-[0.985]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tile text-lime">
              <NextIcon size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body-sm">{next.description.toLowerCase()}</span>
              <span className="text-caption text-muted">próximo pagamento · {relativeDay(next.date)}</span>
            </span>
            <Money value={-next.amount} compact className="text-body-sm font-medium" />
          </Link>
        )}
      </div>
    </Screen>
  );
}
