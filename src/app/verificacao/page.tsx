"use client";

import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, OtpInput, Screen, TopBar } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Verify() {
  const router = useRouter();
  const { data, verify } = useStore();
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const complete = code.replace(/\s/g, "").length === 6;

  return (
    <Screen>
      <TopBar back="/cadastro" />
      <div className="animate-rise mt-12 flex flex-1 flex-col">
        <h1 className="font-serif text-[34px] leading-[1.05]">Confirme o seu e-mail</h1>
        <p className="mt-3 text-[14px] text-ink-soft">Enviamos um código de 6 dígitos para</p>
        <p className="mt-0.5 text-[14px] font-semibold">{data.user?.email ?? "seu e-mail"}</p>

        <div className="mt-9">
          <OtpInput value={code} onChange={setCode} />
        </div>

        <div className="mt-6 text-center text-[13px]">
          <p className="text-muted">Não recebeu?</p>
          {seconds > 0 ? (
            <p className="mt-1 text-ink-soft">Reenviar código em 0:{String(seconds).padStart(2, "0")}</p>
          ) : (
            <button onClick={() => setSeconds(30)} className="mt-1 font-semibold text-ink">
              Reenviar código
            </button>
          )}
        </div>

        <div className="mx-auto mt-auto flex max-w-[263px] flex-col items-center gap-2 pt-10 text-center">
          <LockKeyhole size={20} className="text-ink-soft" />
          <p className="text-[12px] leading-[1.4] text-muted">
            Seus dados financeiros ficam protegidos e só você tem acesso a eles.
          </p>
        </div>

        <div className="mt-6 space-y-3 text-center">
          <Button
            disabled={!complete}
            onClick={() => {
              verify();
              router.push("/conectar");
            }}
          >
            Verificar
          </Button>
          <p className="text-[12px] text-muted">No MVP qualquer código de 6 dígitos funciona.</p>
        </div>
      </div>
    </Screen>
  );
}
