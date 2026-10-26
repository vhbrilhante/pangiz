"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Screen, TopBar } from "@/components/ui";
import { parseMoney } from "@/lib/format";
import { useStore } from "@/lib/store";

// Caminho mais curto até a primeira projeção: saldo + salário.
// Parcelas e contas fixas o usuário adiciona depois pelo botão "+".
export default function ManualSetup() {
  const router = useRouter();
  const { manualSetup } = useStore();
  const [balance, setBalance] = useState("");
  const [salary, setSalary] = useState("");
  const [day, setDay] = useState("5");

  return (
    <Screen>
      <TopBar back="/conectar" />
      <form
        className="animate-rise mt-10 flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          manualSetup({ balance: parseMoney(balance), salary: parseMoney(salary), salaryDay: Math.min(31, Math.max(1, Number(day) || 5)) });
          router.push("/inicio");
        }}
      >
        <h1 className="font-display text-heading">Só dois números para começar</h1>
        <p className="mt-3 text-body text-ink-soft">Com o seu saldo e a sua renda já dá para ver a primeira projeção. Parcelas e contas você adiciona depois.</p>

        <div className="mt-9 space-y-5">
          <Field label="Quanto você tem hoje nas contas?" inputMode="decimal" placeholder="R$ 0,00" value={balance} onChange={(e) => setBalance(e.target.value)} />
          <div className="grid grid-cols-[1fr_96px] gap-3">
            <Field label="Renda por mês" inputMode="decimal" placeholder="R$ 0,00" value={salary} onChange={(e) => setSalary(e.target.value)} />
            <Field label="Cai no dia" inputMode="numeric" value={day} onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))} />
          </div>
        </div>

        <div className="mt-auto pt-8 pb-2">
          <Button type="submit" disabled={!balance}>
            Ver minha projeção
          </Button>
        </div>
      </form>
    </Screen>
  );
}
