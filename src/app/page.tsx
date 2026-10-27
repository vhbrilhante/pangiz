"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChartNoAxesCombined, House } from "@/components/icons";
import { Backdrop } from "@/components/ui";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Entrada do site: escolher entre a landing page e o app.
// No computador o app abre no simulador de iPhone; no celular, em tela cheia.
export default function Choose() {
  const [appHref, setAppHref] = useState("/app");
  useEffect(() => {
    if (window.matchMedia("(min-width: 601px)").matches) setAppHref("/simulador");
  }, []);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[980px] flex-col px-4 pt-[max(var(--safe-top),28px)] pb-[max(var(--safe-bottom),24px)] sm:px-8">
      <Backdrop light="top" />
      <header className="animate-rise flex items-center gap-2.5">
        <span aria-hidden className="grid size-9 place-items-center rounded-[12px] bg-lime text-[var(--on-green)]">
          <ChartNoAxesCombined size={18} />
        </span>
        <span className="font-display text-[28px] leading-none tracking-[-0.02em]">pangiz</span>
      </header>

      <section className="mt-12 sm:mt-20">
        <h1 className="animate-rise delay-1 max-w-[14ch] text-balance font-display text-[44px] leading-[0.98] tracking-[-0.03em] sm:text-[68px]">
          o que você quer ver?
        </h1>
        <p className="animate-rise delay-2 mt-4 max-w-[34em] text-body-lg text-ink-soft">
          o pangiz projeta seu saldo mês a mês e mostra quanto dá pra investir, e em que mês. escolha a apresentação ou o app.
        </p>
      </section>

      <div className="mt-10 grid gap-3 sm:mt-14 sm:grid-cols-2">
        <a
          href={`${BASE}/landing/`}
          className="paper animate-rise delay-2 group flex min-h-[220px] flex-col justify-between rounded-card-lg p-6 transition hover:-translate-y-1 active:scale-[0.985] sm:min-h-[300px] sm:p-8"
        >
          <span className="flex items-start justify-between">
            <span className="grid size-12 place-items-center rounded-full bg-tile text-lime">
              <House size={22} />
            </span>
            <span className="grid size-10 place-items-center rounded-full bg-tile text-ink-soft transition group-hover:bg-ink group-hover:text-on-ink">
              <ArrowUpRight size={15} />
            </span>
          </span>
          <span className="block">
            <span className="block font-display text-[34px] leading-none tracking-[-0.02em] sm:text-[40px]">landing page</span>
            <span className="mt-2 block text-body text-muted">a apresentação do produto: o problema, como funciona e os widgets do app.</span>
          </span>
        </a>

        <Link
          href={appHref}
          className="glow animate-rise delay-3 group flex min-h-[220px] flex-col justify-between rounded-card-lg p-6 transition hover:-translate-y-1 active:scale-[0.985] sm:min-h-[300px] sm:p-8"
        >
          <span className="flex items-start justify-between">
            <span className="grid size-12 place-items-center rounded-full bg-tile">
              <ChartNoAxesCombined size={22} />
            </span>
            <span className="grid size-10 place-items-center rounded-full bg-ink text-on-ink">
              <ArrowUpRight size={15} />
            </span>
          </span>
          <span className="block">
            <span className="block font-display text-[34px] leading-none tracking-[-0.02em] sm:text-[40px]">app mobile</span>
            <span className="mt-2 block text-body text-muted">
              o app funcionando, com dados de exemplo. no computador abre numa moldura de iPhone; no celular, em tela cheia.
            </span>
          </span>
        </Link>
      </div>

      <p className="mt-auto pt-10 text-caption text-muted">pangiz · 2026 · os dados ficam no seu aparelho.</p>
    </main>
  );
}
