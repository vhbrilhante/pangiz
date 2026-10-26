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

  return (
    <div className={cx("mx-auto min-h-dvh max-w-[430px]", data.settings.hideValues && "hide-values")}>
      <Backdrop />
      <button aria-label="Fechar" onClick={() => router.back()} className="animate-fade fixed inset-0 bg-black/55" />
      <div
        role="dialog"
        aria-label="Novo lançamento"
        className="animate-sheet fixed inset-x-0 bottom-0 mx-auto max-h-[94dvh] max-w-[430px] overflow-y-auto rounded-t-sheet border-t border-glass-border bg-raised px-[22px] pb-[max(env(safe-area-inset-bottom),22px)] pt-3"
      >
        <div className="mx-auto mb-3.5 h-[5px] w-[38px] rounded-full bg-ink/20" />
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-title leading-none">novo lançamento</h1>
          <button aria-label="Fechar" onClick={() => router.back()} className="glass grid size-9 place-items-center rounded-full text-ink-soft">
            <X size={15} />
          </button>
        </div>

        <div className="mt-3.5">
          <Segmented options={KINDS} value={kind} onChange={pickKind} />
        </div>

        <div className="mt-5 text-center">
          <p className="big text-display-xl">
            <Roll value={amount} />
          </p>
          <p className="mt-2 min-h-4 text-caption text-muted">
            {kind === "parcelado" && amount > 0 && `${count}x de ${money(amount / count)} a partir de ${monthLong(addMonths(month, 1))}`}
            {kind === "fixo" && amount > 0 && `todo dia ${day}`}
          </p>
        </div>

        <div className="-mx-[22px] mt-3 flex gap-2 overflow-x-auto px-[22px] pb-0.5 [scrollbar-width:none]">
          {categories.map((c) => (
            <Chip key={c} on={category === c} onClick={() => setCategory(c)}>
              {CATEGORIES[c].label.toLowerCase()}
            </Chip>
          ))}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {sources.map((s) => (
            <Chip key={s.id} on={source === s.id} onClick={() => setSource(s.id)}>
              {s.label}
            </Chip>
          ))}
          {kind === "parcelado" && (
            <span className="glass ml-auto flex items-center gap-1 rounded-full p-1">
              <button aria-label="Menos parcelas" onClick={() => setCount((n) => Math.max(2, n - 1))} className="grid size-8 place-items-center rounded-full active:bg-white/10">
                <Minus size={14} />
              </button>
              <span className="tabular min-w-11 text-center text-body">{count}x</span>
              <button aria-label="Mais parcelas" onClick={() => setCount((n) => Math.min(24, n + 1))} className="grid size-8 place-items-center rounded-full active:bg-white/10">
                <Plus size={14} />
              </button>
            </span>
          )}
        </div>

        <div className="glass mt-3.5 min-h-[62px] rounded-field px-3.5 py-3 text-label leading-normal text-ink-soft" aria-live="polite">
          {!after ? (
            "digite um valor para ver como ele muda o que você pode investir."
          ) : (
            <>
              em {data.settings.horizon} meses você investe{" "}
              <b className={cx("m font-medium", diff < 0 ? "text-negative" : diff > 0 && "text-positive")}>{money(after.totalInvestable, { compact: true })}</b>
              {diff !== 0 && <span className="m"> ({money(diff, { compact: true, sign: true })})</span>}
              {after.firstInvestMonth && before.firstInvestMonth && after.firstInvestMonth.month !== before.firstInvestMonth.month
                ? `. o primeiro mês para investir passa a ser ${monthLong(after.firstInvestMonth.month)}`
                : ""}
              .{after.goesNegative && !before.goesNegative && <span className="text-negative"> o saldo fica negativo em algum momento.</span>}
            </>
          )}
        </div>

        <div className="mt-3.5 grid grid-cols-3 gap-1.5">
          {KEYS.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              aria-label={k === "del" ? "Apagar" : k}
              className="grid h-[50px] place-items-center rounded-field font-serif text-value transition active:scale-[0.92] active:bg-white/10"
            >
              {k === "del" ? <Delete size={20} /> : k}
            </button>
          ))}
        </div>

        <button
          disabled={!amount || saved}
          onClick={save}
          className={cx(
            "mt-3 flex h-[52px] w-full items-center justify-center gap-1.5 rounded-full text-body-lg font-medium text-page transition active:scale-[0.96] disabled:opacity-35",
            saved ? "bg-positive disabled:opacity-100" : "bg-ink",
          )}
        >
          {saved ? (
            <>
              <Check size={16} /> salvo
            </>
          ) : (
            "salvar"
          )}
        </button>
      </div>
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
