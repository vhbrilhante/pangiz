"use client";

import { Check, Landmark, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, cx, Money, Screen, TopBar } from "@/components/ui";
import { bankById, BANKS, demoData } from "@/lib/demo";
import { useStore } from "@/lib/store";

type Phase = "bancos" | "carregando" | "sucesso";

function BankBadge({ id, size = 32 }: { id: string; size?: number }) {
  const b = bankById(id);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full text-caption font-bold text-white"
      style={{ width: size, height: size, background: b.color, color: b.id === "bb" ? "#1d3a8a" : "white" }}
    >
      {b.short}
    </span>
  );
}

export default function Connect() {
  const router = useRouter();
  const { connectBanks } = useStore();
  const [phase, setPhase] = useState<Phase>("bancos");
  const [selected, setSelected] = useState<string[]>(["nubank", "itau"]);
  const [query, setQuery] = useState("");
  const [synced, setSynced] = useState(0);

  const banks = BANKS.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));
  const preview = useMemo(() => demoData(selected).accounts, [selected]);
  const total = preview.reduce((s, a) => s + a.balance, 0);

  // Simula a sincronização: um banco por vez.
  useEffect(() => {
    if (phase !== "carregando") return;
    if (synced >= selected.length) {
      const t = setTimeout(() => setPhase("sucesso"), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSynced((n) => n + 1), 1100);
    return () => clearTimeout(t);
  }, [phase, synced, selected.length]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  if (phase === "carregando") {
    const progress = Math.min(1, (synced + 0.5) / selected.length);
    return (
      <Screen>
        <TopBar />
        <div className="animate-rise mt-16 flex flex-1 flex-col items-center text-center">
          <div className="relative grid size-[100px] place-items-center">
            <span className="animate-spin-slow absolute inset-0 rounded-full border-[3px] border-line border-t-graphite" />
            <Landmark size={32} />
          </div>
          <h1 className="mt-8 font-display text-heading leading-none">conectando suas contas</h1>
          <p className="mt-3 max-w-[300px] text-body text-ink-soft">estamos buscando saldos, cartões e parcelas. isso leva só alguns segundos.</p>

          <div className="glow mt-9 w-full rounded-card p-5 text-left">
            {selected.map((id, i) => (
              <div key={id}>
                {i > 0 && <div className="my-3 h-px bg-graphite/10" />}
                <div className="flex items-center justify-between text-body">
                  <span className="flex items-center gap-2.5 font-medium">
                    <BankBadge id={id} size={22} />
                    {bankById(id).name}
                  </span>
                  {i < synced ? (
                    <span className="flex items-center gap-1 text-label text-positive">
                      <Check size={14} /> conectado
                    </span>
                  ) : (
                    <span className="text-label text-muted">{i === synced ? "sincronizando…" : "na fila"}</span>
                  )}
                </div>
              </div>
            ))}
            <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-graphite/10">
              <div className="h-full rounded-full bg-graphite transition-[width] duration-700" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="mt-3 text-label text-muted">
              {Math.min(synced, selected.length)} de {selected.length} instituições
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-[329px] pb-2 text-center">
          <p className="flex items-center justify-center gap-1.5 text-label font-medium text-ink-soft">
            <ShieldCheck size={14} /> conexão protegida pelo Open Finance
          </p>
          <p className="mt-2 text-label leading-[1.4] text-muted">o pangiz só lê seus dados. nunca movimenta dinheiro.</p>
        </div>
      </Screen>
    );
  }

  if (phase === "sucesso") {
    return (
      <Screen>
        <TopBar />
        <div className="animate-rise mt-12 flex flex-1 flex-col items-center text-center">
          <div className="grid size-[92px] place-items-center rounded-full bg-ink text-on-ink shadow-float">
            <Check size={34} />
          </div>
          <h1 className="mt-8 font-display text-heading">tudo pronto! suas contas estão conectadas</h1>
          <p className="mt-3 max-w-[300px] text-body text-ink-soft">já calculamos a sua primeira projeção dos próximos 12 meses.</p>

          <div className="glow relative mt-8 w-full overflow-hidden rounded-card p-5 text-left">
            <p className="text-body-sm text-muted">saldo total conectado</p>
            <p className="mt-1 font-display text-display leading-none">
              <Money value={total} />
            </p>
            <div className="my-4 h-px bg-graphite/10" />
            <div className="space-y-2.5">
              {preview.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-body">
                  <span className="flex items-center gap-2">
                    <Check size={13} className="text-positive" /> {bankById(a.bank).name}
                  </span>
                  <Money value={a.balance} className="text-ink-soft" />
                </div>
              ))}
            </div>
            <p className="mt-4 text-label text-muted">atualizado agora</p>
          </div>
        </div>
        <div className="space-y-3 pb-2 text-center">
          <Button
            onClick={() => {
              connectBanks(selected);
              router.push("/inicio");
            }}
          >
            ver minha projeção
          </Button>
          <p className="text-label text-muted">você pode conectar outras contas depois, no perfil.</p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar back="/verificacao" />
      <div className="animate-rise mt-10 flex flex-1 flex-col">
        <h1 className="font-display text-heading">conecte suas contas e cartões</h1>
        <p className="mt-3 text-body text-ink-soft">escolha seus bancos. quanto mais contas, mais certeira fica a projeção.</p>

        <label className="mt-7 flex h-12 items-center gap-2.5 rounded-full bg-tile px-4">
          <Search size={15} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="buscar banco ou corretora"
            className="flex-1 bg-transparent text-body outline-none placeholder:text-muted"
          />
        </label>

        <div className="paper mt-4 divide-y divide-line rounded-card-lg px-4">
          {banks.map((b) => {
            const on = selected.includes(b.id);
            return (
              <button key={b.id} onClick={() => toggle(b.id)} className="flex h-[58px] w-full items-center gap-3 text-left">
                <BankBadge id={b.id} />
                <span className="flex-1 text-body-lg font-medium">{b.name}</span>
                <span
                  className={cx(
                    "grid size-5 place-items-center rounded-full transition",
                    on ? "bg-ink text-on-ink" : "ring-1 ring-graphite/25",
                  )}
                >
                  {on && <Check size={13} />}
                </span>
              </button>
            );
          })}
          {banks.length === 0 && <p className="py-5 text-center text-body-sm text-muted">nenhum banco encontrado.</p>}
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-label text-ink-soft">
          <ShieldCheck size={14} /> conexão segura, somente leitura
        </p>
      </div>

      <div className="space-y-3 pt-6 pb-2 text-center">
        <Button
          disabled={selected.length === 0}
          onClick={() => {
            setSynced(0);
            setPhase("carregando");
          }}
        >
          conectar {selected.length > 0 ? `${selected.length} ${selected.length === 1 ? "conta" : "contas"}` : ""}
        </Button>
        <Link href="/saldo-inicial" className="block text-body-sm text-ink-soft">
          prefiro informar meu saldo manualmente
        </Link>
      </div>
    </Screen>
  );
}
