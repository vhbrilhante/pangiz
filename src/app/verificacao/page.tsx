"use client";

import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, OtpInput, Rise, Screen, TopBar } from "@/components/ui";
import { Island } from "@/components/visuals";
import { useStore } from "@/lib/store";

// Código de exemplo: chega "por SMS" pela ilha do topo e preenche sozinho, como o autopreenchimento do iPhone.
const DEMO_CODE = "284619";

export default function Verify() {
  const router = useRouter();
  const { data, verify } = useStore();
  const [code, setCode] = useState("");
  const [island, setIsland] = useState(false);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setIsland(true), 500),
      setTimeout(() => setIsland(false), 2900),
      ...[...DEMO_CODE].map((_, i) =>
        setTimeout(() => {
          setCode((c) => (c.length === i ? DEMO_CODE.slice(0, i + 1) : c));
          if (i === DEMO_CODE.length - 1) setAuto(true);
        }, 1300 + i * 110),
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const complete = code.replace(/\s/g, "").length === 6;

  return (
    <Screen>
      <Island open={island}>
        <span className="text-muted">mensagem</span>
        <span>código pangiz: {DEMO_CODE}</span>
      </Island>
      <TopBar back="/cadastro" />
      <div className="mt-[34px] flex flex-1 flex-col">
        <Rise text="só falta confirmar que é você." className="text-heading" />
        <p className="animate-rise delay-2 mt-2.5 text-body-sm leading-[1.45] text-ink-soft">
          enviamos um código de 6 dígitos para <span className="text-ink">{data.user?.email ?? "seu e-mail"}</span>
        </p>

        <div className="animate-rise delay-3 mt-7">
          <OtpInput value={code} onChange={setCode} />
        </div>
        <p className="mt-[18px] text-center text-caption text-muted">
          {auto && complete ? "código preenchido automaticamente" : <span className="shimmer">aguardando o código...</span>}
        </p>

        <div className="mx-auto mt-auto flex max-w-[240px] flex-col items-center gap-2 pt-10 text-center text-ink-soft">
          <LockKeyhole size={20} />
          <p className="text-caption leading-normal text-muted">uma camada de cuidado para manter seu dinheiro e seus dados seguros.</p>
        </div>

        <div className="mt-6">
          <Button
            disabled={!complete}
            onClick={() => {
              verify();
              router.push("/conectar");
            }}
          >
            verificar e continuar
          </Button>
          <button onClick={() => router.push("/cadastro")} className="block w-full pt-3 text-center text-body-sm text-ink-soft">
            alterar e-mail
          </button>
        </div>
      </div>
    </Screen>
  );
}
