"use client";

import { AlertTriangle, PiggyBank, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, cx, IconBubble, Money, Screen, Segmented } from "@/components/ui";
import { ProjectionBars } from "@/components/visuals";
import { CATEGORIES } from "@/lib/categories";
import { dayLabel, monthLabel, monthLong, monthShort, todayISO } from "@/lib/dates";
import { money, parseMoney } from "@/lib/format";
import { project } from "@/lib/projection";
import { useStore } from "@/lib/store";

const HORIZONS = [
  { value: "6", label: "6 meses" },
  { value: "12", label: "12 meses" },
  { value: "24", label: "24 meses" },
];

function daysSince(dateISO: string) {
  return Math.round((new Date(todayISO()).getTime() - new Date(dateISO).getTime()) / 86400000);
}

export default function ProjectionPage() {
  const { data, setSettings } = useStore();
  const p = useMemo(() => project(data), [data]);
  const [selected, setSelected] = useState(() => Math.max(0, p.months.findIndex((m) => m.investable > 0)));
  const sel = p.months[Math.min(selected, p.months.length - 1)];
  const [reserveText, setReserveText] = useState(String(data.settings.reserve));
  const oldest = data.accounts.reduce((min, a) => (a.checkedAt < min ? a.checkedAt : min), todayISO());
  const stale = daysSince(oldest);
  const first = p.firstInvestMonth;
  const last = p.months[p.months.length - 1];
  const visible = p.months.slice(0, Math.min(p.months.length, 12));

  return (
    <Screen className="pb-32">
      <h1 className="font-serif text-[34px] leading-none">Projeção</h1>
      <p className="mt-2 text-[14px] text-ink-soft">Quanto você pode investir, e em que mês.</p>

      <div className="mt-5">
        <Segmented
          options={HORIZONS}
          value={String(data.settings.horizon)}
          onChange={(v) => {
            setSettings({ horizon: Number(v) });
            setSelected(0);
          }}
        />
      </div>

      {/* A resposta */}
      <section className="pearl-dark animate-rise mt-5 rounded-[26px] p-5">
        {first ? (
          <>
            <p className="text-[13px] text-white/60">Primeiro mês para investir</p>
            <p className="mt-1 font-serif text-[40px] leading-none">
              <Money value={first.investable} />
            </p>
            <p className="mt-2 text-[13px] text-white/75">
              no fim de {monthLong(first.month)}, mantendo {money(data.settings.reserve, { compact: true })} de reserva.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[13px]">
              <span className="text-white/60">Total até {monthLabel(last.month)}</span>
              <Money value={p.totalInvestable} className="font-semibold" />
            </div>
          </>
        ) : (
          <>
            <p className="text-[13px] text-white/60">Por enquanto</p>
            <p className="mt-1 font-serif text-[30px] leading-[1.05]">Ainda não sobra para investir</p>
            <p className="mt-2 text-[13px] text-white/75">
              {p.goesNegative
                ? `O saldo fica negativo em ${dayLabel(p.goesNegative.date)} (${money(p.goesNegative.balance)}).`
                : "Seu saldo não passa da reserva no período. Tente diminuir a reserva ou rever as parcelas."}
            </p>
          </>
        )}
      </section>

      {/* Gráfico mês a mês */}
      <Card className="mt-5">
        <div className="mb-4 flex items-center justify-between text-[12px]">
          <span className="font-semibold text-ink">Saldo de cada mês, investindo</span>
          <span className="flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-sm bg-positive" /> pode investir
          </span>
        </div>
        <ProjectionBars
          months={visible.map((m) => ({ month: m.month, label: monthShort(m.month), end: m.afterInvesting, investable: m.investable }))}
          reserve={data.settings.reserve}
          selected={selected}
          onSelect={setSelected}
        />
        {p.months.length > visible.length && (
          <p className="mt-3 text-center text-[11px] text-muted">O gráfico mostra 12 meses. A lista abaixo mostra todos.</p>
        )}
      </Card>

      {/* Detalhe do mês */}
      {sel && (
        <Card className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-[24px] capitalize leading-none">{monthLong(sel.month)}</h2>
            {sel.investable > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-positive/12 px-2.5 py-1 text-[12px] font-medium text-positive">
                <PiggyBank size={13} /> investir <Money value={sel.investable} />
              </span>
            )}
          </div>
          <dl className="mt-4 space-y-2 text-[13px]">
            {[
              ["Começa com", sel.startBalance],
              ["Entradas", sel.income],
              ["Contas e gastos", sel.expenses],
              ["Parcelas", sel.installments],
              ["Faturas de cartão", sel.cardBills],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between">
                <dt className="text-ink-soft">{k}</dt>
                <dd>
                  <Money value={v as number} sign={k !== "Começa com"} className={cx((v as number) > 0 && k !== "Começa com" && "text-positive")} />
                </dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-graphite/10 pt-2 font-semibold">
              <dt>Termina com</dt>
              <dd>
                <Money value={sel.endBalance} className={cx(sel.endBalance < 0 && "text-negative")} />
              </dd>
            </div>
            {p.totalInvestable > 0 && (
              <div className="flex justify-between text-ink-soft">
                <dt>Investindo o sugerido até aqui</dt>
                <dd>
                  <Money value={sel.afterInvesting} />
                </dd>
              </div>
            )}
          </dl>

          {sel.events.length > 0 && (
            <div className="mt-5 space-y-3 border-t border-graphite/10 pt-4">
              {sel.events.map((e, i) => (
                <div key={i} className="flex items-center gap-3">
                  <IconBubble icon={CATEGORIES[e.category].icon} tone={e.amount > 0 ? "positive" : "neutral"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px]">
                      {e.description}
                      {e.detail && <span className="text-muted"> · {e.detail}</span>}
                    </p>
                    <p className="text-[12px] text-muted">{dayLabel(e.date)}</p>
                  </div>
                  <Money value={e.amount} sign className={cx("text-[14px] font-medium", e.amount > 0 && "text-positive")} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Reserva */}
      <Card className="mt-5">
        <h2 className="text-[14px] font-semibold">Sua reserva</h2>
        <p className="mt-1 text-[12px] text-muted">Quanto você quer que fique sempre na conta, para imprevistos.</p>
        <div className="mt-3 flex gap-2">
          {[0, 500, 1000, 2000].map((v) => (
            <button
              key={v}
              onClick={() => {
                setSettings({ reserve: v });
                setReserveText(String(v));
              }}
              className={cx(
                "h-8 flex-1 rounded-full text-[12px] font-medium",
                data.settings.reserve === v ? "bg-graphite text-white" : "bg-white/60 ring-1 ring-black/5",
              )}
            >
              {money(v, { compact: true })}
            </button>
          ))}
        </div>
        <label className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-white/60 px-3 ring-1 ring-black/5">
          <span className="shrink-0 text-[13px] text-muted">Outro valor</span>
          <input
            inputMode="decimal"
            value={reserveText}
            onChange={(e) => setReserveText(e.target.value)}
            onBlur={() => setSettings({ reserve: Math.max(0, parseMoney(reserveText)) })}
            className="tabular flex-1 bg-transparent text-right text-[14px] outline-none"
          />
        </label>
      </Card>

      {/* Confiança nos dados */}
      <Card className={cx("mt-5", stale > 7 && "ring-1 ring-warning/40")}>
        <div className="flex gap-3">
          <AlertTriangle size={18} className={cx("mt-0.5 shrink-0", stale > 7 ? "text-warning" : "text-muted")} />
          <div className="text-[13px] leading-[1.45]">
            <p className="font-semibold">A projeção é tão boa quanto os seus dados</p>
            <p className="mt-1 text-ink-soft">
              Ela usa o saldo das contas, as contas fixas e as parcelas que estão no pangiz.{" "}
              {stale === 0 ? "Seu saldo foi conferido hoje." : `Seu saldo foi conferido há ${stale} ${stale === 1 ? "dia" : "dias"}.`} Se algo
              estiver diferente do banco, corrija e a projeção se ajusta na hora.
            </p>
            <div className="mt-3 flex gap-2">
              <Link href="/perfil#contas" className="flex h-8 items-center gap-1.5 rounded-full bg-graphite px-3 text-[12px] font-medium text-white">
                <RefreshCw size={12} /> Conferir saldo
              </Link>
              <Link href="/lancar" className="flex h-8 items-center rounded-full bg-white/70 px-3 text-[12px] font-medium ring-1 ring-black/5">
                Adicionar parcela ou conta
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Todos os meses */}
      <section className="mt-6">
        <h2 className="mb-3 text-[14px] font-semibold">Mês a mês</h2>
        <div className="glass divide-y divide-graphite/8 rounded-[24px] px-4">
          {p.months.map((m, i) => (
            <button key={m.month} onClick={() => setSelected(i)} className="flex h-12 w-full items-center text-left text-[13px]">
              <span className={cx("w-20 capitalize", i === selected && "font-semibold")}>{monthLabel(m.month)}</span>
              <Money value={m.afterInvesting} className={cx("flex-1 text-right", m.afterInvesting < 0 && "text-negative")} />
              <span className="w-28 text-right">
                {m.investable > 0 ? <Money value={m.investable} className="font-medium text-positive" /> : <span className="text-muted">—</span>}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-right text-[11px] text-muted">fica na conta · pode investir</p>
      </section>
    </Screen>
  );
}
