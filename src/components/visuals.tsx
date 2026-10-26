"use client";

import { ChartNoAxesCombined, CreditCard, House, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { money } from "@/lib/format";
import { cx, Wordmark } from "./ui";

/** Inclina o elemento seguindo o dedo (ou o mouse) e move o reflexo do champanhe junto. */
export function useTilt<T extends HTMLElement>(strength = 1) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = "transform .08s linear";
      el.style.setProperty("--rx", `${-y * 14 * strength}deg`);
      el.style.setProperty("--ry", `${x * 18 * strength}deg`);
      el.style.setProperty("--sx", `${50 + x * 90}%`);
    };
    const leave = () => {
      el.style.transition = "transform .6s var(--ease)";
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.removeProperty("--sx");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerup", leave);
    el.addEventListener("pointercancel", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerup", leave);
      el.removeEventListener("pointercancel", leave);
    };
  }, [strength]);
  return ref;
}

/** O cartão pangiz inclinado do onboarding. */
export function Card3D({ className, children }: { className?: string; children?: React.ReactNode }) {
  const tilt = useTilt<HTMLDivElement>();
  return (
    <div ref={tilt} className={cx("relative h-[300px] touch-pan-y [perspective:1100px]", className)}>
      <div
        className="glow absolute left-1/2 top-5 h-[240px] w-[380px] -translate-x-[46%] rounded-card-lg"
        style={{
          transform: "rotateX(calc(28deg + var(--rx, 0deg))) rotateY(calc(-12deg + var(--ry, 0deg))) rotateZ(-12deg)",
          transition: "inherit",
        }}
      >
        <span className="absolute right-8 top-6 text-[9px] tracking-[0.14em] opacity-50">PANGIZ / 2026</span>
        <span className="absolute left-[34px] top-[74px] h-[34px] w-[46px] rounded-lg bg-gradient-to-br from-[#e8cf8a] via-[#b99447] to-[#f1dc9f]" />
        <Wordmark className="absolute right-[30px] top-[120px] text-[18px] opacity-60" />
        <span className="absolute bottom-[34px] left-[34px] text-body-sm tracking-[0.2em] opacity-55">•••• 8707</span>
      </div>
      {children}
    </div>
  );
}

/** Curva suave (linha + área). A linha se desenha ao entrar. usa a cor do texto em volta. */
export function Sparkline({ values, height = 52, className }: { values: number[]; height?: number; className?: string }) {
  const id = useId();
  const w = 300;
  const h = height;
  if (values.length < 2) return <div style={{ height }} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, 6 + (h - 12) * (1 - (v - min) / span)] as const);
  const line = pts
    .map(([x, y], i) => {
      if (!i) return `M${x},${y}`;
      const [qx, qy] = pts[i - 1];
      const cx_ = (qx + x) / 2;
      return `C${cx_},${qy} ${cx_},${y} ${x},${y}`;
    })
    .join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cx("block w-full overflow-visible", className)} style={{ height }} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path className="draw" pathLength={1} d={line} fill="none" stroke="currentColor" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="currentColor" />
    </svg>
  );
}

const MONTH_INITIAL = (label: string) => label.slice(0, 1);

/**
 * Saldo de fim de mês em barras, com o que dá para investir em champanhe por cima.
 * Arraste (ou use as setas) para escolher o mês.
 */
export function ProjectionScrub({
  months,
  reserve,
  selected,
  onSelect,
}: {
  /** `end` é o saldo que fica na conta depois de investir; `investable` vai em cima. */
  months: { month: string; label: string; end: number; investable: number }[];
  reserve: number;
  selected: number;
  onSelect: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const H = 130;
  const max = Math.max(reserve, ...months.map((m) => m.end + m.investable), 1);
  const min = Math.min(0, ...months.map((m) => m.end));
  const span = max - min || 1;
  const w = 100 / months.length;
  const gap = months.length > 6 ? 2 : 4;
  const sel = months[selected];

  function pick(clientX: number) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const i = Math.max(0, Math.min(months.length - 1, Math.floor(((clientX - r.left) / r.width) * months.length)));
    if (i !== selected) onSelect(i);
  }

  const tipBottom = Math.min(H, ((Math.max(sel.end, 0) - min) / span) * H + (sel.investable / span) * H) + 14;
  const tipShift = selected < 2 ? "-12%" : selected > months.length - 3 ? "-88%" : "-50%";

  return (
    <div>
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label="Mês selecionado"
        aria-valuemin={0}
        aria-valuemax={months.length - 1}
        aria-valuenow={selected}
        aria-valuetext={sel.label}
        className="relative mt-11 cursor-ew-resize touch-none select-none"
        style={{ height: H }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          pick(e.clientX);
        }}
        onPointerMove={(e) => dragging && pick(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") onSelect(Math.max(0, selected - 1));
          if (e.key === "ArrowRight") onSelect(Math.min(months.length - 1, selected + 1));
        }}
      >
        <span className="absolute inset-x-0 border-t border-dashed border-ink/25" style={{ bottom: ((reserve - min) / span) * H }} />
        {months.map((m, i) => {
          // Uma barra redonda por mês: o saldo que fica mais o que dá pra investir. O mês escolhido acende em branco.
          const bh = Math.max(10, ((Math.max(m.end, 0) + m.investable - min) / span) * H);
          return (
            <span
              key={m.month}
              className="absolute bottom-0 rounded-full transition-[height,background-color] duration-700 ease-[var(--ease)]"
              style={{
                left: `${i * w + gap / 2}%`,
                width: `${w - gap}%`,
                height: bh,
                background: m.end < 0 ? "var(--negative)" : i === selected ? "var(--ink)" : m.investable > 0 ? "rgb(198 242 90 / .7)" : "rgb(255 255 255 / .2)",
              }}
            />
          );
        })}
        <span
          className="pointer-events-none absolute whitespace-nowrap rounded-full bg-ink px-[9px] py-[5px] text-caption font-medium text-on-ink transition-[left] duration-200"
          style={{ left: `${(selected + 0.5) * w}%`, bottom: tipBottom, transform: `translate(${tipShift}, 0)` }}
        >
          {sel.label} · {sel.investable ? `investir ${money(sel.investable, { compact: true })}` : "nada"}
        </span>
      </div>
      <div className="mt-2 flex">
        {months.map((m, i) => (
          <span key={m.month} className={cx("flex-1 text-center text-micro", i === selected ? "text-ink" : "text-muted")}>
            {MONTH_INITIAL(m.label)}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Aviso que sai do topo da tela, como a Dynamic Island do iPhone. */
export function Island({ children, open }: { children: React.ReactNode; open: boolean }) {
  return (
    <div
      aria-live="polite"
      className={cx(
        "fixed left-1/2 top-[max(calc(var(--safe-top)_-_48px),10px)] z-[90] flex -translate-x-1/2 items-center justify-between gap-3 overflow-hidden rounded-card bg-black px-3.5 text-label text-ink transition-all duration-500 ease-[var(--spring)]",
        open ? "h-10 w-[250px] opacity-100" : "pointer-events-none h-[35px] w-[122px] opacity-0",
      )}
    >
      <span className={cx("flex w-full items-center justify-between gap-3 whitespace-nowrap transition-opacity", open ? "opacity-100 delay-200" : "opacity-0")}>
        {children}
      </span>
    </div>
  );
}

const TABS = [
  { href: "/inicio", label: "início", icon: House },
  { href: "/projecao", label: "projeção", icon: ChartNoAxesCombined },
  { href: "/cartoes", label: "cartões", icon: CreditCard },
  { href: "/perfil", label: "perfil", icon: UserRound },
];

/** Navegação: barra escura com botões redondos (o ativo é claro) e o + no verde. */
export function BottomNav() {
  const path = usePathname();
  const active = Math.max(0, TABS.findIndex((t) => path.startsWith(t.href)));
  return (
    <nav aria-label="Navegação" className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] px-2.5 pb-[max(var(--safe-bottom),12px)]">
      <div className="glass-strong flex items-center justify-between rounded-full p-2">
        {TABS.map(({ href, label, icon: Icon }, i) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={i === active ? "page" : undefined}
            className={cx(
              "grid size-14 place-items-center rounded-full transition duration-300 active:scale-95",
              i === active ? "bg-ink text-on-ink" : "bg-tile text-ink-soft",
            )}
          >
            <Icon size={20} strokeWidth={1.6} />
          </Link>
        ))}
        <Link
          href="/lancar"
          aria-label="Novo lançamento"
          className="group grid size-14 place-items-center rounded-full bg-lime text-[var(--on-green)] transition active:scale-95"
        >
          <Plus size={22} className="transition-transform duration-[450ms] ease-[var(--spring)] group-active:rotate-90" />
        </Link>
      </div>
    </nav>
  );
}
