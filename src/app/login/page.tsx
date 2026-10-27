"use client";

import { ScanFace } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, PasswordField, Screen, TopBar } from "@/components/ui";
import { nextRoute } from "@/lib/route";
import { useStore } from "@/lib/store";

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
      <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.28-.88-2.3-3.48ZM14.2 6.13c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.55 1.31-.56.65-1.05 1.69-.92 2.68.97.08 1.96-.49 2.57-1.22Z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.27c0-.78-.07-1.53-.2-2.27H12v4.3h5.9a5.05 5.05 0 0 1-2.2 3.3v2.75h3.55c2.08-1.92 3.25-4.74 3.25-8.08Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.75c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.85 14.12a6.6 6.6 0 0 1 0-4.24V7.04H2.18a11 11 0 0 0 0 9.92l3.67-2.84Z" />
      <path fill="#EA4335" d="M12 5.35c1.62 0 3.06.56 4.2 1.64l3.15-3.15A10.97 10.97 0 0 0 2.18 7.04l3.67 2.84C6.71 7.28 9.14 5.35 12 5.35Z" />
    </svg>
  );
}

export default function Login() {
  const router = useRouter();
  const { data, signIn } = useStore();
  const [email, setEmail] = useState(data.user?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function enter(withEmail = email) {
    if (!withEmail.includes("@")) return setError("digite um e-mail válido.");
    signIn(withEmail);
    // O estado é salvo de forma síncrona no localStorage; calculamos o destino com o usuário já logado.
    const user = data.user && data.user.email === withEmail ? data.user : { name: "", email: withEmail, verified: true };
    router.push(nextRoute({ ...data, onboarded: true, user }));
  }

  return (
    <Screen>
      <TopBar back="/boas-vindas" />
      <div className="animate-rise mt-12 flex flex-1 flex-col">
        <h1 className="font-display text-heading leading-none">que bom te ver de novo</h1>
        <p className="mt-3 text-body text-ink-soft">entre para ver como está o seu futuro.</p>

        <form
          className="mt-9 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!password) return setError("digite sua senha.");
            enter();
          }}
        >
          <Field label="E-mail" type="email" autoComplete="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordField label="senha" autoComplete="current-password" placeholder="sua senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-negative">{error}</span>
            <button type="button" className="text-ink-soft underline-offset-2 hover:underline">
              esqueci minha senha
            </button>
          </div>
          <div className="space-y-3 pt-2">
            <Button type="submit">entrar</Button>
            <Button type="button" variant="glass" icon={ScanFace} onClick={() => (data.user ? enter(data.user.email) : setError("entre com e-mail uma vez para ativar o Face ID."))}>
              entrar com Face ID
            </Button>
          </div>
        </form>

        <div className="my-7 flex items-center gap-3 text-label text-muted">
          <span className="h-px flex-1 bg-graphite/12" />
          ou
          <span className="h-px flex-1 bg-graphite/12" />
        </div>

        <div className="space-y-3">
          <Button variant="glass" leading={<AppleLogo />} onClick={() => setError("login com Apple chega depois do MVP.")}>
            continuar com Apple
          </Button>
          <Button variant="glass" leading={<GoogleLogo />} onClick={() => setError("login com Google chega depois do MVP.")}>
            continuar com Google
          </Button>
        </div>

        <p className="mt-auto pt-8 text-center text-body text-ink-soft">
          ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-ink">
            criar conta
          </Link>
        </p>
      </div>
    </Screen>
  );
}
