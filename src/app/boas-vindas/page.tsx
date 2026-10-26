"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button, Rise, Roll, Screen, Steps, Wordmark } from "@/components/ui";
import { Card3D, Sparkline } from "@/components/visuals";
import { useStore } from "@/lib/store";

const STEPS = [
  {
    title: "seu dinheiro, de olho no futuro.",
    text: "contas, cartões e parcelas em um só lugar, sem planilha e sem complicação.",
  },
  {
    title: "visão total do seu saldo",
    text: "suas contas reunidas em um só lugar. saiba exatamente o que você tem, agora.",
  },
  {
    title: "projeções inteligentes para seu futuro",
    text: "veja mês a mês quanto sobra e quanto dá para investir, já contando as parcelas.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { finishOnboarding } = useStore();
  const swipe = useRef<{ x: number; y: number } | null>(null);

  function done() {
    finishOnboarding();
    router.push("/cadastro");
  }
  const next = () => (step < 2 ? setStep(step + 1) : done());

  const s = STEPS[step];
  return (
    <Screen className="overflow-hidden text-center">
      <div
        className="flex flex-1 flex-col"
        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const start = swipe.current;
          swipe.current = null;
          if (!start) return;
          const dx = e.clientX - start.x;
          if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(e.clientY - start.y)) return;
          if (dx < 0) next();
          else if (step > 0) setStep(step - 1);
        }}
      >
        <div className="flex h-9 items-center justify-between">
          <Wordmark />
          <Steps total={3} current={step} />
          <button onClick={done} className="text-caption text-ink-soft">
            pular
          </button>
        </div>

        <div className="relative mx-[-40px] mt-[18px]">
          <Card3D />
          {step === 1 && (
            <div key="a" className="glass-strong animate-rise delay-2 absolute inset-x-10 top-[150px] rounded-card p-[18px] text-left">
              <p className="text-caption text-muted">saldo disponível · 2 contas</p>
              <p className="big mt-2 text-heading">
                <Roll value={12450} />
              </p>
              <div className="mt-2.5 flex justify-between text-caption text-muted">
                <span>itaú R$ 8.200,00</span>
                <span>nubank R$ 4.250,00</span>
              </div>
            </div>
          )}
          {step === 2 && (
            <div key="b" className="glow animate-rise delay-2 absolute inset-x-10 top-[140px] rounded-card p-[18px] text-left">
              <p className="text-caption text-muted">saldo previsto · fim do mês</p>
              <p className="big mt-2 text-heading">
                <Roll value={10320} />
              </p>
              <div className="mt-2.5">
                <Sparkline values={[10, 9.2, 9.6, 8.7, 9.9, 10.8, 10.1, 10.6]} height={46} />
              </div>
              <div className="mt-1.5 flex justify-between text-caption text-muted">
                <span>hoje</span>
                <span>próximos 30 dias</span>
              </div>
            </div>
          )}
        </div>

        <div key={step} className="mt-auto">
          <Rise text={s.title} className="text-heading" />
          <p className="animate-rise delay-3 mx-auto mt-2.5 max-w-[270px] text-body-sm leading-[1.45] text-ink-soft">{s.text}</p>
        </div>

        <div className="mb-2 mt-[34px] flex justify-center">
          <Button size="sm" onClick={next}>
            {step < 2 ? "próximo" : "começar"}
          </Button>
        </div>
        {step === 0 ? (
          <Link href="/login" className="block pb-1 text-label text-muted">
            já tenho conta
          </Link>
        ) : (
          <p className="pb-1 text-caption text-muted">arraste para os lados</p>
        )}
      </div>
    </Screen>
  );
}
