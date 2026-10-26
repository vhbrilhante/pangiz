"use client";

import { ArrowUpRight, Eye, EyeOff, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { IconBubble, Money, Roll, Screen } from "@/components/ui";
import { Island, Sparkline, useTilt } from "@/components/visuals";
import { Pullable } from "@/components/pull";
import { CATEGORIES } from "@/lib/categories";
import { dayLabel, monthLong, monthShort, relativeDay, todayISO } from "@/lib/dates";
import { money } from "@/lib/format";
import { currentBalance, project, upcoming } from "@/lib/projection";
import { useStore } from "@/lib/store";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "bom dia";
  if (h < 18) return "boa tarde";
  return "boa noite";
}

// Início enxuto: o saldo de agora, a resposta (quanto investir e quando) e o próximo pagamento.
export default function Home() {
  const { data, setSettings, update } = useStore();
  const p = useMemo(() => project(data), [data]);
  const balance = currentBalance(data);
  const first = p.firstInvestMonth;
  const six = p.months.slice(0, 6);
  const next = useMemo(() => upcoming(data, 45)[0], [data]);
  const hide = data.settings.hideValues;
  const tilt = useTilt<HTMLAnchorElement>(0.6);
  const [island, setIsland] = useState(false);
  const [syncedNow, setSyncedNow] = useState(false);

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
    <Screen className="pb-36">
      <Island open={island}>
        <RefreshCw size={13} />
        <span>saldos atualizados</span>
      </Island>
      <Pullable onRefresh={refresh}>
        <header className="flex h-9 items-center justify-between">
          <h1 className="font-serif text-title leading-none">
            {greeting()}, {data.user?.name.split(" ")[0].toLowerCase() ?? "você"}
          </h1>
          <button
            aria-label={hide ? "Mostrar valores" : "Esconder valores"}
            onClick={() => setSettings({ hideValues: !hide })}
            className="glass grid size-9 place-items-center rounded-full text-ink-soft transition active:scale-95"
          >
            {hide ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </header>

        <section className="mt-10">
          <p className="animate-rise text-caption text-muted">saldo disponível agora</p>
          <p className="big mt-2.5 text-display-xl">
            <Roll value={balance} />
          </p>
          <p className="animate-rise delay-1 mt-3 text-caption text-muted">
            {data.accounts.map((a) => a.name).join(" · ")} · {syncedNow ? "atualizado agora" : "puxe para atualizar"}
          </p>
        </section>

        <Link
          ref={tilt}
          href="/projecao"
          className="champagne animate-rise delay-2 mt-[34px] block rounded-card p-[18px] [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-caption text-muted">
              <Sparkles size={12} /> {first ? `pode investir em ${monthLong(first.month)}` : "ainda não sobra para investir"}
            </span>
            <ArrowUpRight size={14} className="opacity-55" />
          </div>
          <p className="big mt-2.5 text-display-sm">
            <Roll value={first?.investable ?? 0} />
          </p>
          <p className="mt-2 text-caption text-muted">
            {first
              ? `e ainda sobram ${money(data.settings.reserve, { compact: true })} na conta`
              : p.goesNegative
                ? `o saldo fica negativo em ${dayLabel(p.goesNegative.date)}`
                : "seu saldo não passa da reserva"}
          </p>
          <div className="mt-[18px]">
            <Sparkline values={[balance, ...six.map((m) => m.endBalance)]} height={48} />
          </div>
          <div className="mt-2 flex justify-between text-caption text-muted">
            <span>hoje</span>
            <span>
              {monthShort(six[six.length - 1].month)} · <Money value={six[six.length - 1].endBalance} compact />
            </span>
          </div>
        </Link>

        {next && (
          <Link href="/projecao" className="glass animate-rise delay-3 mt-3 flex min-h-[62px] items-center gap-3 rounded-card px-3.5">
            <IconBubble icon={CATEGORIES[next.category].icon} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body">
                {next.description}
                {next.detail && <span className="text-muted"> · {next.detail}</span>}
              </span>
              <span className="text-caption text-muted">próximo pagamento · {relativeDay(next.date)}</span>
            </span>
            <Money value={-next.amount} className="text-body" />
          </Link>
        )}

      </Pullable>
    </Screen>
  );
}
