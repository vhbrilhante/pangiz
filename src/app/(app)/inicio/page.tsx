"use client";

import { Eye, EyeOff, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { cx, IconBubble, Money, Roll, Screen } from "@/components/ui";
import { Island } from "@/components/visuals";
import { Pullable } from "@/components/pull";
import { CATEGORIES } from "@/lib/categories";
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

// Início: o saldo de agora e, em cima da luz do horizonte, quanto dá pra investir e em que mês.
// A luz sobe conforme o valor do mês escolhido.
export default function Home() {
  const { data, setSettings, update } = useStore();
  const p = useMemo(() => project(data), [data]);
  const balance = currentBalance(data);
  const months = p.months.slice(0, 5);
  const [picked, setPicked] = useState<number | null>(null);
  const selIndex = picked ?? Math.max(0, months.findIndex((m) => m.investable > 0));
  const sel = months[selIndex];
  const next = useMemo(() => upcoming(data, 45)[0], [data]);
  const hide = data.settings.hideValues;
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
    <Screen light="bottom" rise={sel.investable / Math.max(balance, 1)} className="!pb-[calc(max(var(--safe-bottom),20px)+88px)]">
      <Island open={island}>
        <RefreshCw size={13} />
        <span>saldos atualizados</span>
      </Island>
      <Pullable onRefresh={refresh}>
        <header className="flex items-center justify-between">
          <h1 className="text-title font-medium">
            {greeting()}, {data.user?.name.split(" ")[0].toLowerCase() ?? "você"}
          </h1>
          <button
            aria-label={hide ? "Mostrar valores" : "Esconder valores"}
            onClick={() => setSettings({ hideValues: !hide })}
            className="grid size-11 place-items-center rounded-full bg-white/8 transition active:scale-95"
          >
            {hide ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </header>

        <section className="mt-9">
          <p className="animate-rise text-label text-muted">saldo disponível</p>
          <p className="big mt-2.5 text-display">
            <Roll value={balance} />
          </p>
          <p className="animate-rise delay-1 mt-2.5 text-label text-muted">
            {data.accounts.map((a) => a.name.replace(/^conta /i, "").toLowerCase()).join(" · ")} ·{" "}
            {syncedNow ? "atualizado agora" : "puxe pra atualizar"}
          </p>
        </section>
      </Pullable>

      <section className="animate-rise delay-2 mt-auto pt-16" aria-live="polite">
        <p className="text-label opacity-80">
          {sel.investable > 0 ? `dá pra investir em ${monthLong(sel.month)}` : `em ${monthLong(sel.month)} não sobra pra investir`}
        </p>
        <Link href="/projecao" className="big mt-2.5 block text-hero">
          <Roll value={sel.investable} compact />
        </Link>
        <p className="mt-2.5 max-w-[270px] text-body-sm opacity-85">
          {sel.investable > 0
            ? `sem tocar nos ${money(data.settings.reserve, { compact: true })} que ficam de reserva.`
            : p.goesNegative
              ? "o saldo fica negativo em algum momento. veja a projeção."
              : "o saldo não passa da reserva neste mês."}
        </p>
        <div className="mt-4 flex gap-1.5" role="group" aria-label="Mês">
          {months.map((m, i) => (
            <button
              key={m.month}
              onClick={() => setPicked(i)}
              aria-pressed={i === selIndex}
              className={cx(
                "h-9 rounded-full px-3.5 text-label transition active:scale-95",
                i === selIndex ? "bg-ink font-medium text-page" : "bg-black/35 text-ink backdrop-blur-md",
              )}
            >
              {monthShort(m.month)}
            </button>
          ))}
        </div>
      </section>

      {next && (
        <Link
          href="/projecao"
          className="animate-rise delay-3 mt-5 flex h-16 items-center gap-3 rounded-card bg-black/45 px-4 backdrop-blur-xl"
        >
          <IconBubble icon={CATEGORIES[next.category].icon} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body font-medium">
              {next.description.toLowerCase()}
              {next.detail && <span className="font-normal text-muted"> · {next.detail}</span>}
            </span>
            <span className="text-caption text-ink-soft">próximo pagamento · {relativeDay(next.date)}</span>
          </span>
          <Money value={-next.amount} compact className="text-body font-medium" />
        </Link>
      )}
    </Screen>
  );
}
