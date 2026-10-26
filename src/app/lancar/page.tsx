"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Gate } from "@/components/Gate";
import { Button, cx, Field, Money, Screen, Segmented } from "@/components/ui";
import { CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { addMonths, monthLong, monthOf, todayISO } from "@/lib/dates";
import { parseMoney, uid } from "@/lib/format";
import { project } from "@/lib/projection";
import { useStore } from "@/lib/store";
import type { AppData, CategoryId } from "@/lib/types";

type Kind = "gasto" | "receita" | "parcelado" | "fixo";

const KINDS: { value: Kind; label: string }[] = [
  { value: "gasto", label: "Gasto" },
  { value: "receita", label: "Receita" },
  { value: "parcelado", label: "Parcelado" },
  { value: "fixo", label: "Fixo" },
];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("h-8 shrink-0 rounded-full px-3 text-[12px] font-medium transition", on ? "bg-graphite text-white" : "bg-white/60 text-ink-soft ring-1 ring-black/5")}
    >
      {children}
    </button>
  );
}

function NewEntry() {
  const router = useRouter();
  const store = useStore();
  const { data } = store;
  const today = todayISO();
  const month = monthOf(today);

  const [kind, setKind] = useState<Kind>("gasto");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryId>("mercado");
  const [date, setDate] = useState(today);
  const [source, setSource] = useState<string>(data.cards[0]?.id ?? data.accounts[0]?.id ?? "");
  const [count, setCount] = useState("10");
  const [firstOffset, setFirstOffset] = useState(1);
  const [day, setDay] = useState("10");
  const [isIncome, setIsIncome] = useState(false);

  const amount = parseMoney(value);
  const isCard = data.cards.some((c) => c.id === source);
  const income = kind === "receita" || (kind === "fixo" && isIncome);
  const categories = income ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const n = Math.max(1, Math.min(48, Number(count) || 1));

  // Constrói os dados como ficariam depois de salvar, para mostrar o impacto antes.
  function apply(d: AppData): AppData {
    const desc = description.trim() || CATEGORIES[category].label;
    const ids = isCard ? { cardId: source } : { accountId: source || undefined };
    if (kind === "gasto" || kind === "receita") {
      const signed = kind === "gasto" ? -amount : amount;
      const t = { id: uid(), date, description: desc, amount: signed, category, ...(kind === "receita" ? { accountId: source } : ids) };
      const touchesBalance = !t.cardId && t.date <= today;
      return {
        ...d,
        transactions: [t, ...d.transactions],
        accounts: touchesBalance ? d.accounts.map((a) => (a.id === t.accountId ? { ...a, balance: a.balance + signed } : a)) : d.accounts,
      };
    }
    if (kind === "parcelado") {
      return {
        ...d,
        installments: [
          ...d.installments,
          {
            id: uid(), description: desc, installmentAmount: Math.round((amount / n) * 100) / 100, count: n,
            firstMonth: addMonths(month, firstOffset), category,
            ...(isCard ? { cardId: source } : { day: Number(day) || 10 }),
          },
        ],
      };
    }
    return {
      ...d,
      recurring: [
        ...d.recurring,
        { id: uid(), description: desc, amount: income ? amount : -amount, day: Math.min(31, Math.max(1, Number(day) || 1)), category, startMonth: month, ...ids },
      ],
    };
  }

  const before = useMemo(() => project(data), [data]);
  const after = useMemo(() => (amount > 0 ? project(apply(data)) : null), [data, amount, kind, source, count, firstOffset, day, isIncome, date, category]); // eslint-disable-line react-hooks/exhaustive-deps

  function save() {
    store.update(apply);
    router.push(kind === "gasto" || kind === "receita" ? "/inicio" : "/projecao");
  }

  const sources = [
    ...(kind === "receita" || (kind === "fixo" && isIncome) ? [] : data.cards.map((c) => ({ id: c.id, label: `Cartão ${c.name}` }))),
    ...data.accounts.map((a) => ({ id: a.id, label: a.name })),
  ];
  if (kind === "parcelado") sources.push({ id: "", label: "Boleto / carnê" });

  return (
    <Screen>
      <div className="flex h-9 items-center justify-between">
        <h1 className="font-serif text-[28px] leading-none">Novo lançamento</h1>
        <button aria-label="Fechar" onClick={() => router.back()} className="glass grid size-9 place-items-center rounded-full">
          <X size={16} />
        </button>
      </div>

      <div className="mt-5">
        <Segmented
          options={KINDS}
          value={kind}
          onChange={(k) => {
            setKind(k);
            setCategory(k === "receita" ? "salario" : "mercado");
            setIsIncome(false);
            if (k === "receita") setSource(data.accounts[0]?.id ?? "");
          }}
        />
      </div>

      <label className="mt-6 block text-center">
        <span className="text-[13px] text-muted">{kind === "parcelado" ? "Valor total" : kind === "fixo" ? "Valor por mês" : "Valor"}</span>
        <input
          autoFocus
          inputMode="decimal"
          placeholder="R$ 0,00"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="tabular mt-1 w-full bg-transparent text-center font-serif text-[48px] leading-none outline-none placeholder:text-ink/25"
        />
        {kind === "parcelado" && amount > 0 && (
          <span className="text-[13px] text-ink-soft">
            {n}x de <Money value={amount / n} />
          </span>
        )}
      </label>

      <div className="mt-6 space-y-5">
        <Field label="Descrição" placeholder={CATEGORIES[category].label} value={description} onChange={(e) => setDescription(e.target.value)} />

        {kind === "fixo" && (
          <div className="flex gap-2">
            <Chip on={!isIncome} onClick={() => { setIsIncome(false); setCategory("contas"); }}>É uma saída</Chip>
            <Chip on={isIncome} onClick={() => { setIsIncome(true); setCategory("salario"); setSource(data.accounts[0]?.id ?? ""); }}>É uma entrada</Chip>
          </div>
        )}

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-soft">Categoria</p>
          <div className="-mx-[22px] flex gap-2 overflow-x-auto px-[22px] pb-1">
            {categories.map((c) => (
              <Chip key={c} on={category === c} onClick={() => setCategory(c)}>
                {CATEGORIES[c].label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-soft">{income ? "Entra em" : "Pago com"}</p>
          <div className="flex flex-wrap gap-2">
            {sources.map((s) => (
              <Chip key={s.id || "boleto"} on={source === s.id} onClick={() => setSource(s.id)}>
                {s.label}
              </Chip>
            ))}
          </div>
        </div>

        {(kind === "gasto" || kind === "receita") && (
          <Field label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        )}

        {kind === "parcelado" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Parcelas" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, "").slice(0, 2))} />
            {isCard ? (
              <div>
                <p className="mb-2 text-[13px] font-medium text-ink-soft">1ª parcela</p>
                <div className="flex gap-2">
                  <Chip on={firstOffset === 0} onClick={() => setFirstOffset(0)}>{monthLong(month).slice(0, 3)}</Chip>
                  <Chip on={firstOffset === 1} onClick={() => setFirstOffset(1)}>{monthLong(addMonths(month, 1)).slice(0, 3)}</Chip>
                </div>
              </div>
            ) : (
              <Field label="Vence no dia" inputMode="numeric" value={day} onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))} />
            )}
          </div>
        )}

        {kind === "fixo" && (
          <Field label="Todo dia" inputMode="numeric" value={day} onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))} />
        )}
      </div>

      {after && (
        <div className="glass mt-6 rounded-[20px] p-4 text-[13px] leading-[1.45]">
          <p className="font-semibold">Impacto na projeção</p>
          <p className="mt-1 text-ink-soft">
            O que dá para investir nos próximos {data.settings.horizon} meses vai de <Money value={before.totalInvestable} /> para{" "}
            <Money
              value={after.totalInvestable}
              className={cx("font-semibold", after.totalInvestable < before.totalInvestable ? "text-negative" : after.totalInvestable > before.totalInvestable && "text-positive")}
            />
            .
          </p>
          {after.goesNegative && !before.goesNegative && <p className="mt-1 text-negative">Com isso o saldo fica negativo em algum momento.</p>}
        </div>
      )}

      <div className="mt-6 pb-4">
        <Button disabled={amount <= 0} onClick={save}>
          Salvar
        </Button>
      </div>
    </Screen>
  );
}

export default function Page() {
  return (
    <Gate>
      <NewEntry />
    </Gate>
  );
}
