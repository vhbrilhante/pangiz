"use client";

import { Check, LogOut, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Field, IconBubble, Money, Screen, SectionHeader } from "@/components/ui";
import { CATEGORIES } from "@/lib/categories";
import { bankById } from "@/lib/demo";
import { relativeDay, todayISO } from "@/lib/dates";
import { money, parseMoney } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Account } from "@/lib/types";

function AccountRow({ a }: { a: Account }) {
  const { setBalance } = useStore();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(a.balance.toFixed(2).replace(".", ","));
  const b = bankById(a.bank);
  return (
    <div className="py-3">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: b.color }}>
          {b.short}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium">{a.name}</p>
          <p className="text-[12px] text-muted">conferido {relativeDay(a.checkedAt)}</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-right">
            <Money value={a.balance} className="block text-[14px] font-medium" />
            <span className="text-[11px] text-muted underline">corrigir</span>
          </button>
        )}
      </div>
      {editing && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setBalance(a.id, parseMoney(text));
            setEditing(false);
          }}
        >
          <input
            autoFocus
            inputMode="decimal"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="tabular h-10 flex-1 rounded-xl bg-white/8 px-3 text-[14px] outline-none ring-1 ring-white/10"
            aria-label="Saldo real da conta"
          />
          <button className="grid size-10 place-items-center rounded-xl bg-ink text-page" aria-label="Salvar saldo">
            <Check size={16} />
          </button>
        </form>
      )}
    </div>
  );
}

export default function Profile() {
  const router = useRouter();
  const { data, update, reset, removeRecurring, addAccount, connectBanks } = useStore();
  const [newAcc, setNewAcc] = useState<{ name: string; balance: string } | null>(null);
  const fixed = data.recurring;

  return (
    <Screen className="pb-32">
      <h1 className="font-serif text-[32px] leading-none">perfil</h1>

      <Card className="mt-5 flex items-center gap-3">
        <span className="pearl grid size-12 place-items-center rounded-full font-serif text-[22px]">
          {data.user?.name.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <p className="text-[15px] font-semibold">{data.user?.name}</p>
          <p className="text-[13px] text-muted">{data.user?.email}</p>
        </div>
      </Card>

      <section id="contas" className="mt-6 scroll-mt-6">
        <SectionHeader title="contas" />
        <p className="-mt-1 mb-2 text-[12px] text-muted">Toque no saldo para corrigir com o valor que aparece no seu banco.</p>
        <div className="glass divide-y divide-line rounded-[24px] px-4">
          {data.accounts.map((a) => (
            <AccountRow key={a.id} a={a} />
          ))}
          {newAcc ? (
            <form
              className="space-y-3 py-4"
              onSubmit={(e) => {
                e.preventDefault();
                addAccount({ bank: "manual", name: newAcc.name || "Nova conta", balance: parseMoney(newAcc.balance) });
                setNewAcc(null);
              }}
            >
              <Field label="Nome" placeholder="Ex.: Conta Inter" value={newAcc.name} onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })} />
              <Field label="Saldo atual" inputMode="decimal" placeholder="R$ 0,00" value={newAcc.balance} onChange={(e) => setNewAcc({ ...newAcc, balance: e.target.value })} />
              <Button type="submit">Adicionar conta</Button>
            </form>
          ) : (
            <button onClick={() => setNewAcc({ name: "", balance: "" })} className="flex h-12 w-full items-center gap-2 text-[13px] font-medium text-ink-soft">
              <Plus size={15} /> Adicionar conta
            </button>
          )}
        </div>
      </section>

      <section className="mt-6">
        <SectionHeader title="todo mês" />
        {fixed.length === 0 && <p className="text-[13px] text-muted">Nada cadastrado. Use o + para adicionar salário, aluguel, assinaturas.</p>}
        <div className="space-y-3">
          {fixed.map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              <IconBubble icon={CATEGORIES[r.category].icon} tone={r.amount > 0 ? "positive" : "neutral"} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{r.description}</p>
                <p className="text-[12px] text-muted">
                  todo dia {r.day} {r.cardId ? "· no cartão" : ""}
                </p>
              </div>
              <Money value={r.amount} sign className={r.amount > 0 ? "text-[14px] text-positive" : "text-[14px]"} />
              <button aria-label="Apagar" onClick={() => removeRecurring(r.id)} className="text-muted">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <p className="text-[12px] text-muted">
          Seus dados ficam só neste aparelho por enquanto. Reserva atual: {money(data.settings.reserve)}. Hoje é {todayISO().split("-").reverse().join("/")}.
        </p>
        <Button variant="glass" icon={RotateCcw} onClick={() => connectBanks(data.accounts.map((a) => a.bank).filter((b) => b !== "manual"))}>
          Recarregar dados de exemplo
        </Button>
        <Button
          variant="glass"
          icon={LogOut}
          onClick={() => {
            update((d) => ({ ...d, user: null }));
            router.push("/login");
          }}
        >
          Sair
        </Button>
        <Button
          variant="ghost"
          icon={Trash2}
          className="text-negative"
          onClick={() => {
            if (confirm("Apagar todos os dados deste aparelho?")) {
              reset();
              router.push("/");
            }
          }}
        >
          Apagar todos os dados
        </Button>
      </section>
    </Screen>
  );
}
