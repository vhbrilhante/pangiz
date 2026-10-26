"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Screen, Steps, Wordmark } from "@/components/ui";
import { SilverCard3D, Sparkline } from "@/components/visuals";
import { useStore } from "@/lib/store";

const STEPS = [
  {
    title: "Seu dinheiro, de olho no futuro.",
    text: "Contas, cartões e parcelas em um só lugar, sem planilha e sem complicação.",
  },
  {
    title: "Visão total do seu saldo",
    text: "Junte todas as suas contas e veja quanto você tem de verdade, num número só.",
  },
  {
    title: "Projeções inteligentes para o seu futuro",
    text: "Veja mês a mês quanto sobra e quanto você pode investir, já contando as parcelas.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { finishOnboarding } = useStore();

  function done() {
    finishOnboarding();
    router.push("/cadastro");
  }

  const s = STEPS[step];
  return (
    <Screen className="overflow-hidden">
      <div className="flex h-9 items-center justify-between">
        <Wordmark />
        <Steps total={3} current={step} />
        <button onClick={done} className="text-[13px] text-muted">
          Pular
        </button>
      </div>

      <div key={step} className="relative mt-10 flex flex-1 flex-col items-center justify-center">
        <SilverCard3D className="animate-rise -mt-6" />
        {step === 1 && (
          <div className="glass-strong animate-rise absolute top-[52%] w-[309px] rounded-[26px] p-5 [animation-delay:120ms]">
            <p className="text-[13px] text-muted">Saldo em todas as contas</p>
            <p className="tabular mt-1 font-serif text-[40px] leading-none">R$ 4.851,45</p>
            <div className="mt-4 flex justify-between text-[12px] text-ink-soft">
              <span>Nubank · R$ 2.340,50</span>
              <span>Itaú · R$ 1.180,20</span>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="glass-strong animate-rise absolute top-[48%] w-[309px] rounded-[26px] p-5 [animation-delay:120ms]">
            <p className="text-[13px] text-muted">Saldo previsto em março</p>
            <p className="tabular mt-1 font-serif text-[38px] leading-none">R$ 9.320,00</p>
            <Sparkline values={[4.8, 4.1, 5.2, 4.9, 6.3, 7.1, 6.8, 8.2, 9.3]} className="mt-4" />
            <div className="mt-2 flex justify-between text-[11px] text-muted">
              <span>hoje</span>
              <span>março de 2027</span>
            </div>
          </div>
        )}
      </div>

      <div key={`m${step}`} className="animate-rise mt-6">
        <h1 className="font-serif text-[34px] leading-[1.05] tracking-[-0.01em]">{s.title}</h1>
        <p className="mt-3 max-w-[290px] text-[14px] leading-[1.45] text-ink-soft">{s.text}</p>
      </div>

      <div className="mt-8 flex items-center justify-between pb-2">
        {step === 0 ? (
          <Link href="/login" className="text-[14px] text-ink-soft">
            Já tenho conta
          </Link>
        ) : (
          <button onClick={() => setStep(step - 1)} className="text-[14px] text-ink-soft">
            Voltar
          </button>
        )}
        <Button size="sm" onClick={() => (step < 2 ? setStep(step + 1) : done())}>
          {step < 2 ? "próximo" : "começar"}
        </Button>
      </div>
    </Screen>
  );
}
