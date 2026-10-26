"use client";

import { ChartNoAxesCombined, CreditCard, House, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { cx, Wordmark } from "./ui";

/** O "Cartão Pangiz" inclinado do onboarding. */
export function SilverCard3D({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cx("relative [perspective:1200px]", className)}>
      <div
        className="pearl relative mx-auto aspect-[1.586] w-[300px] rounded-[28px] [transform:rotateX(18deg)_rotateY(-16deg)_rotateZ(-9deg)] [transform-style:preserve-3d]"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[28px]">
          <div className="absolute -right-10 -top-24 h-[260px] w-[120px] rotate-[28deg] rounded-full bg-white/70 blur-2xl" />
          <div className="absolute -left-16 top-10 h-[240px] w-[110px] rotate-[28deg] rounded-full bg-[#b8c2d1]/50 blur-2xl" />
        </div>
        <div className="absolute left-6 top-5">
          <Wordmark className="text-[26px] text-ink/80" />
        </div>
        <div className="absolute left-6 top-[46%] h-7 w-10 rounded-md bg-gradient-to-br from-[#e8e1c8] via-[#c8bf9f] to-[#efe8d2] ring-1 ring-black/10" />
        <div className="absolute bottom-5 left-6 font-mono text-[13px] tracking-[0.2em] text-ink/55">•••• 2026</div>
      </div>
      {children}
    </div>
  );
}

/** Curva simples (linha + área) usada no onboarding e na home. */
export function Sparkline({ values, height = 52, className, showDots = true }: { values: number[]; height?: number; className?: string; showDots?: boolean }) {
  const id = useId();
  const w = 320;
  const h = height;
  if (values.length < 2) return <div style={{ height }} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 4 - ((v - min) / span) * (h - 8)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cx("block w-full overflow-visible", className)} style={{ height }}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#17191d" stopOpacity="0.16" />
          <stop offset="1" stopColor="#17191d" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="#17191d" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      {showDots && (
        <>
          <circle cx={pts[0][0]} cy={pts[0][1]} r="3" fill="#17191d" />
          <circle cx={last[0]} cy={last[1]} r="3.5" fill="white" stroke="#17191d" strokeWidth="1.6" />
        </>
      )}
    </svg>
  );
}

/** Barras do saldo de fim de mês, com a parte que dá para investir destacada. */
export function ProjectionBars({
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
  const max = Math.max(reserve, ...months.map((m) => m.end + m.investable), 1);
  const min = Math.min(0, ...months.map((m) => m.end));
  const span = max - min;
  const h = 150;
  const zero = (max / span) * h;
  const reserveY = ((max - reserve) / span) * h;
  return (
    <div className="relative">
      <div className="relative flex items-end gap-1.5" style={{ height: h }}>
        <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-graphite/30" style={{ top: reserveY }}>
          <span className="absolute -top-4 right-0 text-[10px] text-muted">reserva</span>
        </div>
        {months.map((m, i) => {
          const barH = (Math.abs(m.end) / span) * h;
          const negative = m.end < 0;
          return (
            <button
              key={m.month}
              onClick={() => onSelect(i)}
              aria-label={m.label}
              className="relative h-full flex-1"
            >
              <span
                className={cx(
                  "absolute inset-x-0 rounded-[6px] transition",
                  negative ? "bg-negative/70" : i === selected ? "bg-graphite" : "bg-graphite/25",
                )}
                style={negative ? { top: zero, height: Math.max(barH, 2) } : { top: zero - barH, height: Math.max(barH, 2) }}
              />
              {m.investable > 0 && !negative && (
                <span
                  className="absolute inset-x-0 rounded-t-[6px] bg-positive"
                  style={{ top: zero - barH - (m.investable / span) * h, height: Math.max((m.investable / span) * h, 3) }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {months.map((m, i) => (
          <span key={m.month} className={cx("flex-1 text-center text-[10px]", i === selected ? "font-semibold text-ink" : "text-muted")}>
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const TABS = [
  { href: "/inicio", label: "Início", icon: House },
  { href: "/cartoes", label: "Cartões", icon: CreditCard },
  { href: "/projecao", label: "Projeção", icon: ChartNoAxesCombined },
  { href: "/perfil", label: "Perfil", icon: UserRound },
];

/** Navegação principal: pílula de vidro com 4 abas e o botão de lançar. */
export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] px-[22px] pb-[max(env(safe-area-inset-bottom),14px)]">
      <div className="flex items-center gap-2.5">
        <div className="glass-strong flex h-[58px] flex-1 items-center rounded-full px-1.5">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex h-[46px] flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] transition",
                  active ? "bg-graphite text-white" : "text-ink-soft",
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/lancar"
          aria-label="Novo lançamento"
          className="grid size-[58px] shrink-0 place-items-center rounded-full bg-graphite text-white shadow-[0_14px_30px_-12px_rgba(18,20,23,0.8)] active:scale-95"
        >
          <Plus size={22} />
        </Link>
      </div>
    </nav>
  );
}
