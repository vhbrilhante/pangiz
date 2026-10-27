"use client";

import { ArrowLeft, ArrowUpRight, Eye, EyeOff, type IconType } from "@/components/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useRef, useState } from "react";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export type Light = "bottom" | "middle" | "top" | "none";

/**
 * Fundo: base preta com um respiro de verde no topo (ou embaixo) e grão de filme.
 * Os blocos coloridos fazem o resto; o fundo só dá profundidade.
 */
export function Backdrop({ light = "top" }: { light?: Light; rise?: number }) {
  const glow: Record<Exclude<Light, "none">, string> = {
    top: "radial-gradient(90% 40% at 50% -10%, rgb(212 245 60 / 0.12), transparent 70%)",
    middle: "radial-gradient(90% 45% at 50% 40%, rgb(212 245 60 / 0.07), transparent 70%)",
    bottom: "radial-gradient(90% 40% at 50% 110%, rgb(212 245 60 / 0.12), transparent 70%)",
  };
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-page" style={light !== "none" ? { backgroundImage: glow[light] } : undefined}>
      <svg className="absolute inset-0 h-full w-full opacity-[0.12] mix-blend-overlay">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}

/** Container de celular: ocupa a tela no telefone e fica centralizado no desktop. */
export function Screen({ children, className, light, rise }: { children: React.ReactNode; className?: string; light?: Light; rise?: number }) {
  const { data } = useStore();
  return (
    <div
      className={cx(
        "relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pt-[max(var(--safe-top),20px)] pb-[max(var(--safe-bottom),16px)]",
        data.settings.hideValues && "hide-values",
        className,
      )}
    >
      <Backdrop light={light} rise={rise} />
      {children}
    </div>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cx("font-display text-[26px] leading-none tracking-[-0.02em] text-ink", className)}>pangiz</span>;
}

/** Título que entra palavra por palavra, com desfoque. */
export function Rise({ text, className, as: Tag = "h1" }: { text: string; className?: string; as?: "h1" | "h2" | "p" }) {
  const words = text.split(" ");
  return (
    <Tag className={cx("font-display text-balance", className)}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="word" style={{ animationDelay: `${i * 55}ms` }}>
            {w}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}

export function TopBar({ back, right }: { back?: string | true; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="relative flex h-9 items-center justify-between">
      {back ? (
        <button
          aria-label="Voltar"
          onClick={() => (back === true ? router.back() : router.push(back))}
          className="-ml-1 grid size-9 place-items-center rounded-full text-ink-soft transition active:scale-95"
        >
          <ArrowLeft size={18} />
        </button>
      ) : (
        <span className="size-9" />
      )}
      <Wordmark className="absolute left-1/2 -translate-x-1/2" />
      {right ?? <span className="size-9" />}
    </div>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "glass" | "ghost" | "link";
  icon?: IconType | null;
  leading?: React.ReactNode;
  size?: "md" | "sm";
  href?: string;
};

/**
 * Pílula: creme sólido (principal), vidro ou só texto. seta pequena depois do rótulo.
 * Uma ação principal por tela; a segunda vira `link` (texto sublinhado), nunca outro botão cheio ao lado.
 */
export function Button({ variant = "primary", icon = ArrowUpRight, leading, size = "md", className, children, href, ...rest }: ButtonProps) {
  const Icon = variant === "link" ? null : icon;
  const base = cx(
    "flex items-center justify-center gap-1.5 rounded-full font-medium transition duration-200 active:scale-[0.96] disabled:opacity-35 disabled:active:scale-100",
    variant === "link" ? "h-11 w-full text-body-sm" : size === "md" ? "h-14 w-full px-5 text-body-lg" : "h-10 px-5 text-body",
    variant === "primary" && "bg-ink text-on-ink",
    variant === "glass" && "border border-white/14 bg-tile text-ink shadow-sheen",
    variant === "ghost" && "text-ink-soft",
    variant === "link" && "text-ink-soft underline decoration-ink/30 underline-offset-4",
    className,
  );
  const inner = (
    <>
      {leading}
      <span>{children}</span>
      {Icon && !leading && <Icon size={size === "md" ? 14 : 13} />}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={base}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={base} {...rest}>
      {inner}
    </button>
  );
}

export function IconButton({ icon: Icon, label, onClick, className }: { icon: IconType; label: string; onClick?: () => void; className?: string }) {
  return (
    <button aria-label={label} onClick={onClick} className={cx("grid size-11 place-items-center rounded-full bg-tile text-ink transition active:scale-95", className)}>
      <Icon size={16} />
    </button>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; trailing?: React.ReactNode };

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, hint, trailing, className, id, ...rest }, ref) {
  const fid = id ?? `f-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={fid} className={cx("block", className)}>
      <span className="mb-[7px] block text-label text-muted">{label}</span>
      <span className="flex h-[52px] items-center gap-2 rounded-field bg-tile px-4 ring-1 ring-line transition focus-within:border-white/30 focus-within:bg-tile">
        <input
          ref={ref}
          id={fid}
          className="h-full min-w-0 flex-1 bg-transparent text-body-lg text-ink outline-none placeholder:text-ink/30"
          {...rest}
        />
        {trailing}
      </span>
      {hint && <span className="mt-1.5 block text-label text-muted">{hint}</span>}
    </label>
  );
});

export function PasswordField(props: Omit<FieldProps, "type" | "trailing">) {
  const [show, setShow] = useState(false);
  return (
    <Field
      {...props}
      type={show ? "text" : "password"}
      trailing={
        <button type="button" aria-label={show ? "esconder senha" : "mostrar senha"} onClick={() => setShow(!show)} className="text-muted">
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      }
    />
  );
}

/** 6 caixinhas para o código de verificação. cada dígito entra com um "pop". */
export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  function set(i: number, d: string) {
    const arr = value.padEnd(length, " ").split("");
    arr[i] = d || " ";
    onChange(arr.join("").trimEnd());
  }

  return (
    <div className="grid grid-cols-6 gap-2">
      {digits.map((d, i) => (
        <span key={i} className={cx("glass relative h-[62px] rounded-field transition", d.trim() && "border-white/30 bg-tile")}>
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Dígito ${i + 1}`}
            value={d.trim()}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v.length > 1) {
                onChange(v.slice(0, length));
                refs.current[Math.min(v.length, length) - 1]?.focus();
                return;
              }
              set(i, v);
              if (v && i < length - 1) refs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !d.trim() && i > 0) refs.current[i - 1]?.focus();
            }}
            className="absolute inset-0 w-full rounded-field bg-transparent text-center text-transparent caret-ink outline-none"
          />
          {d.trim() && (
            <span key={d} aria-hidden className="animate-pop pointer-events-none absolute inset-0 grid place-items-center font-display text-heading">
              {d}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

export function Steps({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-2" aria-label={`Etapa ${current + 1} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="relative h-0.5 w-[34px] overflow-hidden rounded-full bg-ink/20">
          <span
            className="absolute inset-0 origin-left bg-ink transition-transform duration-[600ms] ease-[var(--ease)]"
            style={{ transform: `scaleX(${i <= current ? 1 : 0})` }}
          />
        </span>
      ))}
    </div>
  );
}

/** Valor em reais. com "ocultar valores" ligado, desfoca em vez de trocar por bolinhas. */
export function Money({ value, className, sign, compact }: { value: number; className?: string; sign?: boolean; compact?: boolean }) {
  return <span className={cx("m tabular", className)}>{money(value, { sign, compact })}</span>;
}

const DIGITS = Array.from({ length: 10 }, (_, i) => i);

/** Odômetro: cada dígito rola até o valor novo, da direita para a esquerda. */
export function Roll({ value, className, sign, compact }: { value: number; className?: string; sign?: boolean; compact?: boolean }) {
  const text = money(value, { sign, compact });
  const [shown, setShown] = useState(() => text.replace(/\d/g, "0"));
  useEffect(() => {
    const id = setTimeout(() => setShown(text), 30);
    return () => clearTimeout(id);
  }, [text]);
  const sameShape = shown.length === text.length;
  return (
    <span className={cx("m roll", className)} aria-label={text} role="img">
      {[...text].map((c, i) => {
        if (!/\d/.test(c)) {
          return (
            <span key={i} className="c" aria-hidden style={/\s/.test(c) ? { width: "0.26em" } : undefined}>
              {/\s/.test(c) ? "" : c}
            </span>
          );
        }
        const d = sameShape && /\d/.test(shown[i]) ? Number(shown[i]) : 0;
        return (
          <span key={i} className="d" aria-hidden>
            <span className="s" style={{ transform: `translateY(-${d}em)`, transitionDelay: `${(text.length - i) * 22}ms` }}>
              {DIGITS.map((n) => (
                <i key={n}>{n}</i>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function SectionHeader({ title, href, action }: { title: string; href?: string; action?: string }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <h2 className="text-caption text-muted">{title}</h2>
      {href && (
        <Link href={href} className="text-label text-ink-soft">
          {action ?? "ver todas"}
        </Link>
      )}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cx("paper rounded-card-lg p-5", className)}>{children}</section>;
}

export function IconBubble({ icon: Icon, tone = "neutral" }: { icon: IconType; tone?: "neutral" | "positive" | "dark" }) {
  return (
    <span
      className={cx(
        "grid size-8 shrink-0 place-items-center rounded-full",
        tone === "neutral" && "bg-tile text-ink",
        tone === "positive" && "bg-positive/14 text-positive",
        tone === "dark" && "bg-ink text-on-ink",
      )}
    >
      <Icon size={14} strokeWidth={1.7} />
    </span>
  );
}

/** Controle segmentado com um botão creme que desliza entre as opções. */
export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div className="glass relative flex rounded-full p-1">
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-ink transition-transform duration-500 ease-[var(--spring)]"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${idx * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cx("relative h-9 flex-1 rounded-full text-label transition-colors", value === o.value ? "text-on-ink" : "text-ink-soft")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Etiqueta pequena de status. `accent` é a lavagem de champanhe (o destaque fraco);
 * as outras são neutra, positiva e negativa. sempre pílula.
 */
export function Tag({ tone = "neutral", children, className }: { tone?: "neutral" | "accent" | "positive" | "negative"; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-caption font-medium",
        tone === "neutral" && "bg-tile text-ink-soft",
        tone === "accent" && "bg-glow-wash text-glow-light",
        tone === "positive" && "bg-positive/14 text-positive",
        tone === "negative" && "bg-negative/14 text-negative",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cx(
        "h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-body-sm transition active:scale-95",
        on ? "bg-ink text-on-ink" : "bg-tile text-ink-soft",
      )}
    >
      {children}
    </button>
  );
}

/** Aviso curto no rodapé da tela, que some sozinho. */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      key={message}
      className="animate-toast fixed bottom-[108px] left-1/2 z-50 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-body-sm font-medium text-on-ink"
    >
      {message}
    </div>
  );
}
