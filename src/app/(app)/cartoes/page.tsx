"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, Card, Chip, Field, IconBubble, Money, Rise, Roll, Screen, SectionHeader, Tag, Wordmark } from "@/components/ui";
import { useTilt } from "@/components/visuals";
import { CATEGORIES } from "@/lib/categories";
import { addMonths, dayLabel, monthDiff, monthLong, monthOf, todayISO } from "@/lib/dates";
import { money, parseMoney } from "@/lib/format";
import { openBill } from "@/lib/projection";
import { useStore } from "@/lib/store";
import type { Card as CardT } from "@/lib/types";

function BillCard({ card }: { card: CardT }) {
  const { data } = useStore();
  const tilt = useTilt<HTMLDivElement>();
  const bill = openBill(data, card);
  const pct = Math.min(100, (bill.used / (card.limit || 1)) * 100);
  return (
    <div className="animate-rise delay-1 mt-5 touch-pan-y [perspective:1100px]">
      <div
        ref={tilt}
        className="champagne flex aspect-[1.586] flex-col justify-between rounded-card p-[22px] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
      >
        <div className="flex items-center justify-between">
          <Wordmark className="text-value opacity-75" />
          <span className="text-caption text-muted">{card.name}</span>
        </div>
        <div>
          <p className="text-caption text-muted">
            fatura de {monthLong(bill.payMonth)} · vence {dayLabel(bill.dueDate)}
          </p>
          <p className="big mt-2 text-display-sm">
            <Roll value={bill.total} />
          </p>
        </div>
        <div>
          <div className="h-[3px] overflow-hidden rounded-full bg-black/15">
            <div className="h-full rounded-full bg-current transition-[width] duration-900" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-caption text-muted">
            <span>•••• {card.last4}</span>
            <span className="m">
              {Math.round(pct)}% de {money(card.limit, { compact: true })}
            </span>
          </div>
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
    <Card className="animate-rise mt-5 space-y-4">
      <Field label="nome do cartão" placeholder="ex.: nubank" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-[1fr_96px] gap-3">
        <Field label="limite" inputMode="decimal" placeholder="R$ 0,00" value={limit} onChange={(e) => setLimit(e.target.value)} />
        <Field label="vence dia" inputMode="numeric" value={due} onChange={(e) => setDue(e.target.value.replace(/\D/g, "").slice(0, 2))} />
      </div>
      <Button
        disabled={!name}
        onClick={() => {
          addCard({ bank: "manual", name, last4: String(Math.floor(1000 + Math.random() * 9000)), limit: parseMoney(limit), dueDay: Math.min(28, Math.max(1, Number(due) || 10)) });
          onDone();
        }}
      >
        salvar cartão
      </Button>
    </Card>
  );
}

// Fatura em aberto num cartão que inclina com o dedo, e os parcelamentos logo abaixo.
export default function Cards() {
  const { data, removeInstallment } = useStore();
  const [index, setIndex] = useState(0);
  const [adding, setAdding] = useState(data.cards.length === 0);
  const card = data.cards[Math.min(index, data.cards.length - 1)];
  const month = monthOf(todayISO());

  return (
    <Screen className="pb-36">
      <div className="flex items-center justify-between">
        <Rise text="cartões" className="text-heading" />
        <button aria-label="Adicionar cartão" onClick={() => setAdding(!adding)} className="glass grid size-9 place-items-center rounded-full text-ink-soft">
          <Plus size={16} />
        </button>
      </div>

      {adding && <NewCardForm onDone={() => setAdding(false)} />}

      {data.cards.length > 1 && (
        <div className="mt-5 flex gap-2">
          {data.cards.map((c, i) => (
            <Chip key={c.id} on={c.id === card?.id} onClick={() => setIndex(i)}>
              {c.name}
            </Chip>
          ))}
        </div>
      )}

      {card && <BillCard key={card.id} card={card} />}

      {data.installments.length > 0 && (
        <section className="animate-rise delay-2 mt-6">
          <SectionHeader title="parcelamentos" />
          <div className="glass divide-y divide-line overflow-hidden rounded-card">
            {data.installments.map((p) => {
              const paid = Math.min(p.count, Math.max(0, monthDiff(p.firstMonth, month) + (p.cardId ? 0 : 1)));
              return (
                <div key={p.id} className="flex items-center gap-3 px-3.5 py-3">
                  <IconBubble icon={CATEGORIES[p.category].icon} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2 text-body">
                      <span className="truncate">{p.description}</span>
                      <Money value={p.installmentAmount} />
                    </div>
                    <div className="mt-[9px] h-[3px] overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${(paid / p.count) * 100}%` }} />
                    </div>
                    <p className="mt-1.5 flex items-center gap-2 text-caption text-muted">
                      {paid} de {p.count} · até {monthLong(addMonths(p.firstMonth, p.count - 1))}
                      {!p.cardId && <Tag>boleto</Tag>}
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
      )}
    </Screen>
  );
}
