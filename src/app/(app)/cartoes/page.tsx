"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, Card, Field, IconBubble, Money, Screen, SectionHeader } from "@/components/ui";
import { Wordmark } from "@/components/ui";
import { CATEGORIES } from "@/lib/categories";
import { addMonths, dayLabel, monthDiff, monthLong, monthOf, monthShort, todayISO } from "@/lib/dates";
import { parseMoney } from "@/lib/format";
import { cardBillFor, openBill } from "@/lib/projection";
import { useStore } from "@/lib/store";
import type { Card as CardT } from "@/lib/types";

function CardFace({ card }: { card: CardT }) {
  return (
    <div className="pearl relative aspect-[1.586] w-full overflow-hidden rounded-[26px] p-5">
      <div className="absolute -right-8 -top-24 h-[260px] w-[120px] rotate-[28deg] rounded-full bg-white/70 blur-2xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <Wordmark className="text-[24px] text-ink/80" />
          <span className="text-[13px] font-medium text-ink-soft">{card.name}</span>
        </div>
        <div className="h-7 w-10 rounded-md bg-gradient-to-br from-[#e8e1c8] via-[#c8bf9f] to-[#efe8d2] ring-1 ring-black/10" />
        <div className="flex items-end justify-between">
          <span className="font-mono text-[14px] tracking-[0.2em] text-ink/60">•••• {card.last4}</span>
          <span className="text-[11px] text-muted">vence dia {card.dueDay}</span>
        </div>
      </div>
    </div>
  );
}

function NewCardForm({ onDone }: { onDone: () => void }) {
  const { addCard } = useStore();
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [due, setDue] = useState("10");
  return (
    <Card className="mt-5 space-y-4">
      <Field label="Nome do cartão" placeholder="Ex.: Nubank" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-[1fr_96px] gap-3">
        <Field label="Limite" inputMode="decimal" placeholder="R$ 0,00" value={limit} onChange={(e) => setLimit(e.target.value)} />
        <Field label="Vencimento" inputMode="numeric" value={due} onChange={(e) => setDue(e.target.value.replace(/\D/g, "").slice(0, 2))} />
      </div>
      <Button
        disabled={!name}
        onClick={() => {
          addCard({ bank: "manual", name, last4: String(Math.floor(1000 + Math.random() * 9000)), limit: parseMoney(limit), dueDay: Math.min(28, Math.max(1, Number(due) || 10)) });
          onDone();
        }}
      >
        Salvar cartão
      </Button>
    </Card>
  );
}

export default function Cards() {
  const { data, removeInstallment } = useStore();
  const [index, setIndex] = useState(0);
  const [adding, setAdding] = useState(data.cards.length === 0);
  const card = data.cards[index];
  const month = monthOf(todayISO());

  return (
    <Screen className="pb-32">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[34px] leading-none">Cartões</h1>
        <button aria-label="Adicionar cartão" onClick={() => setAdding(!adding)} className="glass grid size-9 place-items-center rounded-full">
          <Plus size={16} />
        </button>
      </div>

      {adding && <NewCardForm onDone={() => setAdding(false)} />}

      {data.cards.length > 1 && (
        <div className="mt-5 flex gap-2">
          {data.cards.map((c, i) => (
            <button key={c.id} onClick={() => setIndex(i)} className={`h-8 rounded-full px-3 text-[12px] font-medium ${i === index ? "bg-graphite text-white" : "bg-white/60"}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {card && (() => {
        const bill = openBill(data, card);
        const next = Array.from({ length: 6 }, (_, i) => {
          const m = addMonths(bill.payMonth, i + 1);
          return { month: m, total: -cardBillFor(data, card, m).total };
        });
        const maxNext = Math.max(...next.map((n) => n.total), 1);
        const plans = data.installments.filter((p) => p.cardId === card.id || (!p.cardId && index === 0));
        return (
          <>
            <div className="animate-rise mt-5 [perspective:1000px]">
              <div className="[transform:rotateX(8deg)]">
                <CardFace card={card} />
              </div>
            </div>

            <Card className="mt-5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium">Fatura de {monthLong(bill.payMonth)}</span>
                <span className="text-muted">vence {dayLabel(bill.dueDate)}</span>
              </div>
              <p className="mt-2 font-serif text-[36px] leading-none">
                <Money value={bill.total} />
              </p>
              <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-graphite/10">
                <div className="h-full rounded-full bg-graphite" style={{ width: `${Math.min(100, (bill.used / (card.limit || 1)) * 100)}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[12px] text-muted">
                <span>
                  Limite usado <Money value={bill.used} />
                </span>
                <span>
                  disponível <Money value={Math.max(0, card.limit - bill.used)} />
                </span>
              </div>
              {bill.parts.length > 0 && (
                <div className="mt-4 space-y-2.5 border-t border-graphite/10 pt-4">
                  {bill.parts.map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-[13px]">
                      <span className="truncate">
                        {e.description}
                        {e.detail && <span className="text-muted"> · {e.detail}</span>}
                      </span>
                      <Money value={-e.amount} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="mt-5">
              <SectionHeader title="Próximas faturas" />
              <div className="flex h-[96px] items-end gap-2">
                {next.map((n) => (
                  <div key={n.month} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="tabular text-[10px] text-muted">{Math.round(n.total)}</span>
                    <span className="w-full rounded-md bg-graphite/70" style={{ height: Math.max(3, (n.total / maxNext) * 60) }} />
                    <span className="text-[10px] text-muted">{monthShort(n.month)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-muted">Já contando as parcelas e assinaturas que caem neste cartão.</p>
            </Card>

            <section className="mt-6">
              <SectionHeader title="Parcelamentos" />
              {plans.length === 0 && <p className="text-[13px] text-muted">Nenhuma compra parcelada.</p>}
              <div className="space-y-3">
                {plans.map((p) => {
                  const paid = Math.min(p.count, Math.max(0, monthDiff(p.firstMonth, month) + 1));
                  const Icon = CATEGORIES[p.category].icon;
                  return (
                    <div key={p.id} className="glass flex items-center gap-3 rounded-[20px] p-3">
                      <IconBubble icon={Icon} />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between text-[14px]">
                          <span className="truncate font-medium">{p.description}</span>
                          <Money value={p.installmentAmount} className="font-medium" />
                        </div>
                        <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-graphite/10">
                          <div className="h-full rounded-full bg-graphite" style={{ width: `${(paid / p.count) * 100}%` }} />
                        </div>
                        <p className="mt-1 text-[11px] text-muted">
                          {paid} de {p.count} pagas · termina em {monthLong(addMonths(p.firstMonth, p.count - 1))}
                          {p.cardId ? "" : " · boleto"}
                        </p>
                      </div>
                      <button aria-label="Apagar parcelamento" onClick={() => removeInstallment(p.id)} className="text-muted">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        );
      })()}
    </Screen>
  );
}
