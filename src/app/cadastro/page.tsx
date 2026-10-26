"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, cx, Field, PasswordField, Screen, TopBar } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const longEnough = password.length >= 8;
  const valid = name.trim().length > 1 && email.includes("@") && longEnough;

  return (
    <Screen>
      <TopBar back="/boas-vindas" />
      <form
        className="animate-rise mt-12 flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          signUp({ name: name.trim(), email: email.trim() });
          router.push("/verificacao");
        }}
      >
        <h1 className="font-serif text-[34px] leading-[1.05]">Crie sua conta e comece a planejar</h1>
        <p className="mt-3 text-[14px] text-ink-soft">Leva menos de um minuto.</p>

        <div className="mt-9 space-y-5">
          <Field label="Nome" autoComplete="given-name" placeholder="Como podemos te chamar?" value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="E-mail" type="email" autoComplete="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordField label="Senha" autoComplete="new-password" placeholder="Crie uma senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className={cx("flex items-center gap-2 text-[12px] transition-colors", longEnough ? "text-positive" : "text-muted")}>
            <Check size={12} />
            Pelo menos 8 caracteres
          </p>
        </div>

        <p className="mt-6 text-[12px] leading-[1.4] text-muted">
          Ao continuar você concorda com os Termos de uso e a Política de privacidade do pangiz.
        </p>

        <div className="mt-auto space-y-4 pt-8 text-center">
          <Button type="submit" disabled={!valid}>
            Criar conta
          </Button>
          <Link href="/login" className="block text-[14px] text-ink-soft">
            Já tenho uma conta
          </Link>
        </div>
      </form>
    </Screen>
  );
}
