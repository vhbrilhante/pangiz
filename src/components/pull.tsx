"use client";

import { RefreshCw } from "@/components/icons";
import { useEffect, useRef, useState } from "react";

/**
 * Puxar para atualizar. funciona com o dedo (no topo da página) e com o mouse (para demonstrar no desktop).
 * O conteúdo desce junto, o ícone gira conforme puxa e, passando do limite, chama `onRefresh`.
 */
export function Pullable({ onRefresh, children }: { onRefresh: () => Promise<void>; children: React.ReactNode }) {
  const content = useRef<HTMLDivElement>(null);
  const icon = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    let start: { x: number; y: number } | null = null;
    let dy = 0;

    const paint = (d: number, animate: boolean) => {
      if (!content.current || !icon.current) return;
      content.current.style.transition = animate ? "transform .45s var(--ease)" : "none";
      content.current.style.transform = d ? `translateY(${d}px)` : "";
      icon.current.style.opacity = String(Math.min(1, d / 60));
      icon.current.style.transform = `translate(-50%, ${d - 40}px) rotate(${d * 4}deg)`;
    };

    const begin = (x: number, y: number) => {
      if (busyRef.current || window.scrollY > 0) return;
      start = { x, y };
      dy = 0;
    };
    const move = (x: number, y: number, e?: Event) => {
      if (!start) return;
      const ddy = y - start.y;
      const ddx = x - start.x;
      if (ddy <= 0 || Math.abs(ddx) > Math.abs(ddy)) return;
      e?.preventDefault();
      dy = Math.min(110, ddy * 0.45);
      paint(dy, false);
    };
    const end = async () => {
      if (!start) return;
      start = null;
      if (dy > 55) {
        busyRef.current = true;
        setBusy(true);
        paint(54, true);
        if (icon.current) icon.current.style.transform = "translate(-50%, 14px)";
        await onRefresh();
        busyRef.current = false;
        setBusy(false);
      }
      dy = 0;
      paint(0, true);
    };

    const ts = (e: TouchEvent) => begin(e.touches[0].clientX, e.touches[0].clientY);
    const tm = (e: TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY, e);
    const md = (e: PointerEvent) => e.pointerType === "mouse" && !(e.target as HTMLElement).closest("a,button") && begin(e.clientX, e.clientY);
    const mm = (e: PointerEvent) => e.pointerType === "mouse" && move(e.clientX, e.clientY);

    window.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchmove", tm, { passive: false });
    window.addEventListener("touchend", end);
    window.addEventListener("pointerdown", md);
    window.addEventListener("pointermove", mm);
    window.addEventListener("pointerup", end);
    return () => {
      window.removeEventListener("touchstart", ts);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("touchend", end);
      window.removeEventListener("pointerdown", md);
      window.removeEventListener("pointermove", mm);
      window.removeEventListener("pointerup", end);
    };
  }, [onRefresh]);

  return (
    <>
      <div ref={icon} aria-hidden className="pointer-events-none absolute left-1/2 top-[max(var(--safe-top),20px)] z-10 text-ink-soft opacity-0" style={{ transform: "translate(-50%, -40px)" }}>
        <RefreshCw size={18} className={busy ? "animate-spin-slow" : undefined} />
      </div>
      <div ref={content}>{children}</div>
    </>
  );
}
