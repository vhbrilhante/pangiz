"use client";

import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { useStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { bankById } from "@/lib/demo";
import { cx, IconBubble, Money } from "./ui";

const REVEAL = 76;

/**
 * Uma linha da lista: categoria, onde foi pago e o valor com sinal.
 * Com `onDelete`, arrastar para a esquerda revela o apagar (em vez de uma lixeira em cada linha).
 */
export function TransactionRow({ t, onDelete }: { t: Transaction; onDelete?: () => void }) {
  const { data } = useStore();
  const cat = CATEGORIES[t.category];
  const where = t.cardId
    ? `cartão ${data.cards.find((c) => c.id === t.cardId)?.name ?? ""}`
    : bankById(data.accounts.find((a) => a.id === t.accountId)?.bank ?? "").name;
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number; base: number; horizontal?: boolean } | null>(null);

  const row = (
    <div className="flex items-center gap-3 py-2.5">
      <IconBubble icon={cat.icon} tone={t.amount > 0 ? "positive" : "neutral"} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium">{t.description.toLowerCase()}</p>
        <p className="truncate text-label text-muted">
          {cat.label.toLowerCase()} {where && `· ${where.toLowerCase()}`}
        </p>
      </div>
      <Money value={t.amount} sign className={cx("shrink-0 text-body font-medium", t.amount > 0 && "text-positive")} />
    </div>
  );
  if (!onDelete) return row;

  return (
    <div className="relative overflow-hidden rounded-field">
      <button
        aria-label={`Apagar ${t.description}`}
        onClick={onDelete}
        tabIndex={dx ? 0 : -1}
        className="absolute inset-y-1 right-0 flex w-[68px] items-center justify-center rounded-field bg-negative text-[#2a0d0a] transition-opacity"
        style={{ opacity: Math.min(1, -dx / REVEAL) }}
      >
        <Trash2 size={17} />
      </button>
      <div
        className={cx("relative touch-pan-y bg-[var(--row-bg,transparent)]", !dragging && "transition-transform duration-300 ease-[var(--spring)]")}
        style={{ transform: `translateX(${dx}px)` }}
        onPointerDown={(e) => {
          start.current = { x: e.clientX, y: e.clientY, base: dx };
        }}
        onPointerMove={(e) => {
          const s = start.current;
          if (!s) return;
          const mx = e.clientX - s.x;
          if (s.horizontal === undefined) {
            if (Math.abs(mx) < 6 && Math.abs(e.clientY - s.y) < 6) return;
            s.horizontal = Math.abs(mx) > Math.abs(e.clientY - s.y);
            if (s.horizontal) {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging(true);
            }
          }
          if (s.horizontal) setDx(Math.max(-REVEAL - 24, Math.min(0, s.base + mx)));
        }}
        onPointerUp={() => {
          if (start.current?.horizontal) setDx((v) => (v < -REVEAL / 2 ? -REVEAL : 0));
          else if (dx) setDx(0);
          start.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDragging(false);
          setDx(0);
        }}
      >
        {row}
      </div>
    </div>
  );
}
