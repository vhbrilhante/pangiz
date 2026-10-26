"use client";

import { Check, Delete, Minus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Gate } from "@/components/Gate";
import { Backdrop, Chip, cx, Roll, Segmented } from "@/components/ui";
import { CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { addMonths, monthLong, monthOf, todayISO } from "@/lib/dates";
import { money, uid } from "@/lib/format";
import { project } from "@/lib/projection";
import { useStore } from "@/lib/store";
import type { AppData, CategoryId } from "@/lib/types";

type Kind = "gasto" | "parcelado" | "fixo" | "receita";

const KINDS: { value: Kind; label: string }[] = [
  { value: "gasto", label: "gasto" },
  { value: "parcelado", label: "parcelado" },
  { value: "fixo", label: "todo mês" },
  { value: "receita", label: "receita" },
];

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"];

// Folha de lançamento: escolhe o tipo, digita o valor no teclado próprio e vê o impacto na projeção antes de salvar.
function NewEntry() {
  const router = useRouter();
  const { data, update } = useStore();
  const today = todayISO();
  const month = monthOf(today);
  const day = Number(today.slice(8, 10));

  const [kind, setKind] = useState<Kind>("gasto");
  const [cents, setCents] = useState(0);
  const [category, setCategory] = useState<CategoryId>("mercado");
  const [source, setSource] = useState<string>(data.cards[0]?.id ?? data.accounts[0]?.id ?? "");
  const [count, setCount] = useState(10);
  const [saved, setSaved] = useState(false);

  const amount = cents / 100;
  const income = kind === "receita";
  const categories = income ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const sources = [
    ...(income ? [] : data.cards.map((c) => ({ id: c.id, label: "cartão" }))),
    ...data.accounts.map((a) => ({ id: a.id, label: a.name })),
  ];
  const isCard = data.cards.some((c) => c.id === source);

  function pickKind(k: Kind) {
    setKind(k);
    if (k === "receita") {
      setCategory("salario");
      if (isCard) setSource(data.accounts[0]?.id ?? "");
    } else if (!EXPENSE_CATEGORIES.includes(category)) {
      setCategory(k === "fixo" ? "contas" : "mercado");
    }
  }

  // Os dados como ficariam depois de salvar, para mostrar o impacto antes.
  function apply(d: AppData): AppData {
    const description = CATEGORIES[category].label;
    const on = isCard ? { cardId: source } : { accountId: source || undefined };
    if (kind === "gasto" || kind === "receita") {
      const signed = income ? amount : -amount;
      return {
        ...d,
        transactions: [{ id: uid(), date: today, description, amount: signed, category, ...on }, ...d.transactions],
        accounts: isCard ? d.accounts : d.accounts.map((a) => (a.id === source ? { ...a, balance: a.balance + signed } : a)),
      };
    }
    if (kind === "parcelado") {
      return {
        ...d,
        installments: [
          ...d.installments,
          {
            id: uid(), description, installmentAmount: Math.round((amount / count) * 100) / 100, count,
            firstMonth: addMonths(month, 1), category, ...(isCard ? { cardId: source } : { day: 10 }),
          },
        ],
      };
    }
    return { ...d, recurring: [...d.recurring, { id: uid(), description, amount: -amount, day, category, startMonth: month, ...on }] };
  }

  const before = useMemo(() => project(data), [data]);
  const after = useMemo(() => (amount > 0 ? project(apply(data)) : null), [data, amount, kind, source, count, category]); // eslint-disable-line react-hooks/exhaustive-deps

  function press(k: string) {
    setCents((c) => (k === "del" ? Math.floor(c / 10) : Math.min(99999999, Number(String(c) + k))));
  }

  function save() {
    setSaved(true);
    setTimeout(() => {
      update(apply);
      router.push(kind === "gasto" || kind === "receita" ? "/inicio" : "/projecao");
    }, 450);
  }

  const diff = after ? after.totalInvestable - before.totalInvestable : 0;

  const saveLabel = kind === "parcelado" ? "salvar parcelamento" : kind === "fixo" ? "salvar conta do mês" : kind === "receita" ? "salvar receita" : "salvar gasto";

  return (
    <div className={cx("relative mx-auto flex min-h-dvh max-w-[430px] flex-col px-2.5 pb-[max(var(--safe-bottom),12px)] pt-[max(var(--safe-top),20px)]", data.settings.hideValues && "hide-values")}>
      <Backdrop light="top" />
      <div className="flex items-center justify-between px-2.5 pb-3 pt-1">
        <h1 className="font-display text-heading">novo lançamento</h1>
        <button aria-label="Fechar" onClick={() => router.back()} className="grid size-11 place-items-center rounded-full bg-tile transition active:scale-95">
          <X size={16} />
        </button>
      </div>

      <section className="paper animate-rise flex flex-1 flex-col rounded-card-lg p-4">
      <div>
        <Segmented options={KINDS} value={kind} onChange={pickKind} />
      </div>

      <div className="mt-6 text-center">
        <p className="big text-display-xl">
          <Roll value={amount} compact={cents % 100 === 0} />
        </p>
        <p className="mt-2.5 min-h-5 text-label text-ink-soft">
          {kind === "parcelado" && amount > 0 && `${count}x de ${money(amount / count)} a partir de ${monthLong(addMonths(month, 1))}`}
          {kind === "fixo" && amount > 0 && `todo dia ${day}`}
        </p>
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none]">
        {categories.map((c) => (
          <Chip key={c} on={category === c} onClick={() => setCategory(c)}>
            {CATEGORIES[c].label.toLowerCase()}
          </Chip>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {sources.map((s) => (
          <Chip key={s.id} on={source === s.id} onClick={() => setSource(s.id)}>
            {s.label.toLowerCase()}
          </Chip>
        ))}
        {kind === "parcelado" && (
          <span className="ml-auto flex h-11 items-center gap-1 rounded-full bg-tile px-1.5">
            <button aria-label="Menos parcelas" onClick={() => setCount((n) => Math.max(2, n - 1))} className="grid size-8 place-items-center rounded-full active:bg-tile">
              <Minus size={14} />
            </button>
            <span className="tabular min-w-9 text-center text-label">{count}x</span>
            <button aria-label="Mais parcelas" onClick={() => setCount((n) => Math.min(24, n + 1))} className="grid size-8 place-items-center rounded-full active:bg-tile">
              <Plus size={14} />
            </button>
          </span>
        )}
      </div>

      <div
        className="glow mt-4 flex min-h-[56px] items-center gap-3 rounded-card px-4 py-3 text-label leading-normal"
        aria-live="polite"
      >
        <span className="size-2 shrink-0 rounded-full bg-ink" />
        <span className="text-ink-soft">
          {!after ? (
            "digite um valor pra ver como ele muda o que dá pra investir."
          ) : (
            <>
              em {data.settings.horizon} meses você investe{" "}
              <b className="m font-semibold text-ink">{money(after.totalInvestable, { compact: true })}</b>
              {diff !== 0 && <span className="m">, {money(Math.abs(diff), { compact: true })} a {diff < 0 ? "menos" : "mais"}</span>}
              {after.firstInvestMonth && before.firstInvestMonth && after.firstInvestMonth.month !== before.firstInvestMonth.month
                ? `. o primeiro mês pra investir passa a ser ${monthLong(after.firstInvestMonth.month)}`
                : ""}
              .{after.goesNegative && !before.goesNegative && <span className="text-negative"> o saldo fica negativo em algum momento.</span>}
            </>
          )}
        </span>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            aria-label={k === "del" ? "Apagar" : k}
            className="grid h-[52px] place-items-center rounded-full bg-tile font-display text-[24px] transition active:scale-[0.92]"
          >
            {k === "del" ? <Delete size={22} /> : k}
          </button>
        ))}
      </div>

      <button
        disabled={!amount || saved}
        onClick={save}
        className={cx(
          "mt-3 flex h-14 w-full items-center justify-center gap-1.5 rounded-full text-body-lg font-medium text-on-ink transition active:scale-[0.96] disabled:opacity-35",
          saved ? "bg-positive disabled:opacity-100" : "bg-ink",
        )}
      >
        {saved ? (
          <>
            <Check size={16} /> salvo
          </>
        ) : (
          saveLabel
        )}
      </button>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <NewEntry />
    </Gate>
  );
}
