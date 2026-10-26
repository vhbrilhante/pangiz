"use client";

import { ArrowUpRight, Bell, CreditCard, Eye, EyeOff, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Card, IconBubble, Money, Screen, SectionHeader } from "@/components/ui";
import { Sparkline } from "@/components/visuals";
import { TransactionRow } from "@/components/TransactionRow";
import { CATEGORIES } from "@/lib/categories";
import { dayLabel, monthLong, monthOf, monthShort, relativeDay, todayISO } from "@/lib/dates";
import { currentBalance, openBill, project, upcoming } from "@/lib/projection";
import { useStore } from "@/lib/store";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Home() {
  const { data, setSettings } = useStore();
  const today = todayISO();
  const p = useMemo(() => project(data), [data]);
  const balance = currentBalance(data);
  const thisMonth = p.months[0];
  const nextMonth = p.months[1];
  const bills = useMemo(() => upcoming(data, 30).slice(0, 3), [data]);
  const card = data.cards[0];
  const bill = card ? openBill(data, card) : null;
  const recent = [...data.transactions].filter((t) => t.date <= today).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const incomeThisMonth = data.transactions
    .filter((t) => t.amount > 0 && monthOf(t.date) === monthOf(today))
    .reduce((s, t) => s + t.amount, 0);
  const curve = [balance, ...p.months.slice(0, 6).map((m) => m.endBalance)];
  const first = p.firstInvestMonth;
  const hide = data.settings.hideValues;

  return (
    <Screen className="pb-32">
      <header className="flex h-8 items-center justify-between">
        <h1 className="font-serif text-[26px] leading-none">
          {greeting()}, {data.user?.name.split(" ")[0]}
        </h1>
        <div className="flex items-center gap-2">
          <button aria-label={hide ? "Mostrar valores" : "Esconder valores"} onClick={() => setSettings({ hideValues: !hide })} className="grid size-8 place-items-center text-ink-soft">
            {hide ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button aria-label="Notificações" className="glass relative grid size-8 place-items-center rounded-full">
            <Bell size={14} />
            {bills.length > 0 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-negative" />}
          </button>
        </div>
      </header>

      {/* Saldo presente */}
      <section className="animate-rise mt-6">
        <p className="text-[13px] text-muted">Saldo em contas</p>
        <p className="mt-1 font-serif text-[48px] leading-none tracking-[-0.02em]">
          <Money value={balance} />
        </p>
        <p className="mt-2 text-[12px] text-ink-soft">
          {incomeThisMonth > 0 ? (
            <>
              <Money value={incomeThisMonth} sign className="text-positive" /> entraram este mês
            </>
          ) : (
            `${data.accounts.length} ${data.accounts.length === 1 ? "conta" : "contas"}`
          )}
        </p>
      </section>

      {/* Saldo futuro */}
      <Link href="/projecao" className="mt-5 flex items-end justify-between border-t border-graphite/10 pt-4">
        <div>
          <p className="text-[13px] font-medium">Saldo previsto</p>
          <p className="text-[12px] text-muted">no fim de {monthLong(nextMonth?.month ?? thisMonth.month)}</p>
        </div>
        <p className="font-serif text-[28px] leading-none">
          <Money value={(nextMonth ?? thisMonth).endBalance} />
        </p>
      </Link>

      {/* A resposta principal do pangiz */}
      <Link href="/projecao" className="pearl-dark mt-5 flex items-center gap-3 rounded-[22px] p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10">
          <Sparkles size={16} />
        </span>
        <span className="flex-1 text-[13px] leading-[1.35]">
          {first ? (
            <>
              Você pode investir <b className="tabular">{hide ? "R$ •••" : <Money value={first.investable} />}</b> no fim de {monthLong(first.month)} sem
              ficar abaixo da sua reserva.
            </>
          ) : p.goesNegative ? (
            <>Atenção: seu saldo fica negativo em {dayLabel(p.goesNegative.date)}. Veja onde ajustar.</>
          ) : (
            <>Ainda não sobra para investir acima da sua reserva. Veja a projeção completa.</>
          )}
        </span>
        <ArrowUpRight size={16} className="shrink-0 opacity-70" />
      </Link>

      {/* Fatura do cartão */}
      {card && bill && (
        <Link href="/cartoes" className="block">
          <Card className="mt-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[13px] font-medium">
                <CreditCard size={15} /> Fatura {card.name}
              </span>
              <span className="text-[12px] text-muted">vence {dayLabel(bill.dueDate)}</span>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <p className="font-serif text-[30px] leading-none">
                <Money value={bill.total} />
              </p>
              <span className="text-[12px] text-muted">em aberto</span>
            </div>
            <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-graphite/10">
              <div className="h-full rounded-full bg-graphite" style={{ width: `${Math.min(100, (bill.used / card.limit) * 100)}%` }} />
            </div>
            <p className="mt-2 text-[12px] text-muted">
              <Money value={bill.used} /> de <Money value={card.limit} compact /> do limite usado
            </p>
          </Card>
        </Link>
      )}

      {/* Próximas contas */}
      <section className="mt-7">
        <SectionHeader title="Próximas contas" href="/projecao" action="Ver todas" />
        {bills.length === 0 && <p className="text-[13px] text-muted">Nada vencendo nos próximos 30 dias.</p>}
        <div className="space-y-3">
          {bills.map((e, i) => {
            const Icon = CATEGORIES[e.category].icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <IconBubble icon={Icon} />
                <span className="min-w-0 flex-1 truncate text-[14px]">
                  {e.description}
                  {e.detail && <span className="text-muted"> · {e.detail}</span>}
                </span>
                <span className="text-[12px] text-muted">{relativeDay(e.date, today)}</span>
                <Money value={-e.amount} className="w-[84px] text-right text-[14px] font-medium" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Projeção de saldo */}
      <Link href="/projecao" className="block">
        <Card className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold">Projeção de saldo · 6 meses</h2>
            <ArrowUpRight size={14} className="text-muted" />
          </div>
          <Sparkline values={curve} height={56} />
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>hoje</span>
            <span>{monthShort(p.months[Math.min(2, p.months.length - 1)].month)}</span>
            <span>{monthShort(p.months[Math.min(5, p.months.length - 1)].month)}</span>
          </div>
        </Card>
      </Link>

      {/* Últimas transações */}
      <section className="mt-7">
        <SectionHeader title="Últimas transações" href="/transacoes" />
        {recent.length === 0 && <p className="text-[13px] text-muted">Nenhum lançamento ainda. Toque em + para adicionar.</p>}
        <div className="space-y-3.5">
          {recent.map((t) => (
            <TransactionRow key={t.id} t={t} />
          ))}
        </div>
      </section>
    </Screen>
  );
}
