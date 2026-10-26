"use client";

import { ArrowLeft, ArrowUpRight, Eye, EyeOff, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useRef, useState } from "react";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** Fundo difuso + luzes + acabamento fosco, como nos frames do Figma. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-full w-full max-w-[430px] -translate-x-1/2">
        <div className="absolute left-[30%] top-[17%] h-[390px] w-[350px] rounded-full bg-white/80 blur-[70px]" />
        <div className="absolute -left-[48%] top-[39%] h-[230px] w-[440px] rounded-full bg-[#9aa1aa]/45 blur-[70px]" />
        <div className="absolute left-[51%] top-[66%] h-[330px] w-[250px] rounded-full bg-white/70 blur-[60px]" />
      </div>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
    </div>
  );
}

/** Container de celular: ocupa a tela no telefone e fica centralizado no desktop. */
export function Screen({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-[22px] pt-[max(env(safe-area-inset-top),20px)] pb-[max(env(safe-area-inset-bottom),16px)]", className)}>
      <Backdrop />
      {children}
    </div>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cx("font-serif text-[30px] leading-none tracking-[-0.02em] text-ink", className)}>pangiz</span>;
}

export function TopBar({ back, right }: { back?: string | true; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="relative flex h-9 items-center justify-between">
      {back ? (
        <button
          aria-label="Voltar"
          onClick={() => (back === true ? router.back() : router.push(back))}
          className="-ml-1 grid size-9 place-items-center rounded-full text-ink active:bg-white/40"
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
  variant?: "primary" | "glass" | "ghost";
  icon?: LucideIcon | null;
  leading?: React.ReactNode;
  size?: "md" | "sm";
  href?: string;
};

/** Botão do Figma: texto à esquerda e um quadradinho com seta à direita. */
export function Button({ variant = "primary", icon = ArrowUpRight, leading, size = "md", className, children, href, ...rest }: ButtonProps) {
  const Icon = icon;
  const base = cx(
    "group relative flex items-center gap-3 rounded-full font-medium transition active:scale-[0.98] disabled:opacity-45 disabled:active:scale-100",
    size === "md" ? "h-12 w-full pl-5 pr-1.5 text-[15px]" : "h-[37px] pl-4 pr-1 text-[14px]",
    variant === "primary" && "bg-graphite text-white shadow-[0_10px_24px_-12px_rgba(18,20,23,0.7)]",
    variant === "glass" && "glass text-ink",
    variant === "ghost" && "text-ink",
    Boolean(leading) && "justify-center px-5",
    className,
  );
  const inner = (
    <>
      {leading}
      <span className={cx(!leading && "flex-1 text-left")}>{children}</span>
      {Icon && !leading && (
        <span
          className={cx(
            "grid place-items-center rounded-full",
            size === "md" ? "size-9" : "size-[29px]",
            variant === "primary" ? "bg-white/12 ring-1 ring-white/15" : "bg-white/70 ring-1 ring-black/5",
          )}
        >
          <Icon size={size === "md" ? 16 : 14} />
        </span>
      )}
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

export function IconButton({ icon: Icon, label, onClick, className }: { icon: LucideIcon; label: string; onClick?: () => void; className?: string }) {
  return (
    <button aria-label={label} onClick={onClick} className={cx("glass grid size-8 place-items-center rounded-full text-ink active:scale-95", className)}>
      <Icon size={14} />
    </button>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; trailing?: React.ReactNode };

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, hint, trailing, className, id, ...rest }, ref) {
  const fid = id ?? `f-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={fid} className={cx("block", className)}>
      <span className="mb-2 block text-[13px] font-medium text-ink-soft">{label}</span>
      <span className="glass flex h-[52px] items-center gap-2 rounded-2xl px-4 focus-within:ring-2 focus-within:ring-graphite/15">
        <input
          ref={ref}
          id={fid}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
          {...rest}
        />
        {trailing}
      </span>
      {hint && <span className="mt-1.5 block text-[12px] text-muted">{hint}</span>}
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
        <button type="button" aria-label={show ? "Esconder senha" : "Mostrar senha"} onClick={() => setShow(!show)} className="text-muted">
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      }
    />
  );
}

/** 6 caixinhas para o código de verificação. */
export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  function set(i: number, d: string) {
    const arr = value.padEnd(length, " ").split("");
    arr[i] = d || " ";
    onChange(arr.join("").trimEnd());
  }

  return (
    <div className="flex justify-between gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
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
          className="glass h-[62px] w-full min-w-0 rounded-2xl text-center font-serif text-[30px] text-ink outline-none focus:ring-2 focus:ring-graphite/20"
        />
      ))}
    </div>
  );
}

export function Steps({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-[10px]" aria-label={`Etapa ${current + 1} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cx("h-1 w-10 rounded-full transition-colors", i <= current ? "bg-graphite" : "bg-graphite/15")} />
      ))}
    </div>
  );
}

export function Money({ value, className, sign, compact }: { value: number; className?: string; sign?: boolean; compact?: boolean }) {
  const { data } = useStore();
  return <span className={cx("tabular", className)}>{money(value, { hide: data.settings.hideValues, sign, compact })}</span>;
}

export function SectionHeader({ title, href, action }: { title: string; href?: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
      {href && (
        <Link href={href} className="text-[13px] text-muted">
          {action ?? "Ver todas"}
        </Link>
      )}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cx("glass rounded-[24px] p-4", className)}>{children}</section>;
}

export function IconBubble({ icon: Icon, tone = "neutral" }: { icon: LucideIcon; tone?: "neutral" | "positive" | "dark" }) {
  return (
    <span
      className={cx(
        "grid size-9 shrink-0 place-items-center rounded-full",
        tone === "neutral" && "bg-white/70 text-ink ring-1 ring-black/5",
        tone === "positive" && "bg-positive/12 text-positive",
        tone === "dark" && "bg-graphite text-white",
      )}
    >
      <Icon size={15} />
    </span>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="glass flex rounded-full p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            "h-9 flex-1 rounded-full text-[13px] font-medium transition",
            value === o.value ? "bg-graphite text-white shadow" : "text-ink-soft",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
