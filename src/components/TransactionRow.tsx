"use client";

import { Trash2 } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { relativeDay } from "@/lib/dates";
import { useStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { bankById } from "@/lib/demo";
import { cx, IconBubble, Money } from "./ui";

export function TransactionRow({ t, onDelete }: { t: Transaction; onDelete?: () => void }) {
  const { data } = useStore();
  const cat = CATEGORIES[t.category];
  const where = t.cardId
    ? `Cartão ${data.cards.find((c) => c.id === t.cardId)?.name ?? ""}`
    : bankById(data.accounts.find((a) => a.id === t.accountId)?.bank ?? "").name;
  return (
    <div className="flex items-center gap-3">
      <IconBubble icon={cat.icon} tone={t.amount > 0 ? "positive" : "neutral"} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium">{t.description}</p>
        <p className="truncate text-[12px] text-muted">
          {cat.label} · {relativeDay(t.date)} {where && `· ${where}`}
        </p>
      </div>
      <Money value={t.amount} sign className={cx("text-[14px] font-medium", t.amount > 0 && "text-positive")} />
      {onDelete && (
        <button aria-label="Apagar lançamento" onClick={onDelete} className="grid size-7 place-items-center text-muted">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
