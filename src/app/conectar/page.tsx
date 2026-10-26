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
      className="grid shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
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
          <h1 className="mt-8 font-serif text-[32px] leading-none">Conectando suas contas</h1>
          <p className="mt-3 max-w-[300px] text-[14px] text-ink-soft">Estamos buscando saldos, cartões e parcelas. Isso leva só alguns segundos.</p>

          <div className="pearl mt-9 w-full rounded-[24px] p-5 text-left">
            {selected.map((id, i) => (
              <div key={id}>
                {i > 0 && <div className="my-3 h-px bg-graphite/10" />}
                <div className="flex items-center justify-between text-[14px]">
                  <span className="flex items-center gap-2.5 font-medium">
                    <BankBadge id={id} size={22} />
                    {bankById(id).name}
                  </span>
                  {i < synced ? (
                    <span className="flex items-center gap-1 text-[12px] text-positive">
                      <Check size={14} /> Conectado
                    </span>
                  ) : (
                    <span className="text-[12px] text-muted">{i === synced ? "Sincronizando…" : "Na fila"}</span>
                  )}
                </div>
              </div>
            ))}
            <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-graphite/10">
              <div className="h-full rounded-full bg-graphite transition-[width] duration-700" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="mt-3 text-[12px] text-muted">
              {Math.min(synced, selected.length)} de {selected.length} instituições
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-[329px] pb-2 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink-soft">
            <ShieldCheck size={14} /> Conexão protegida pelo Open Finance
          </p>
          <p className="mt-2 text-[12px] leading-[1.4] text-muted">O pangiz só lê seus dados. Nunca movimenta dinheiro.</p>
        </div>
      </Screen>
    );
  }

  if (phase === "sucesso") {
    return (
      <Screen>
        <TopBar />
        <div className="animate-rise mt-12 flex flex-1 flex-col items-center text-center">
          <div className="grid size-[92px] place-items-center rounded-full bg-ink text-page shadow-[0_18px_40px_-16px_rgba(18,20,23,0.8)]">
            <Check size={34} />
          </div>
          <h1 className="mt-8 font-serif text-[34px] leading-[1.05]">Tudo pronto! Suas contas estão conectadas</h1>
          <p className="mt-3 max-w-[300px] text-[14px] text-ink-soft">Já calculamos a sua primeira projeção dos próximos 12 meses.</p>

          <div className="pearl relative mt-8 w-full overflow-hidden rounded-[24px] p-5 text-left">
            <p className="text-[13px] text-muted">Saldo total conectado</p>
            <p className="mt-1 font-serif text-[42px] leading-none">
              <Money value={total} />
            </p>
            <div className="my-4 h-px bg-graphite/10" />
            <div className="space-y-2.5">
              {preview.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-[14px]">
                  <span className="flex items-center gap-2">
                    <Check size={13} className="text-positive" /> {bankById(a.bank).name}
                  </span>
                  <Money value={a.balance} className="text-ink-soft" />
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-muted">Atualizado agora</p>
          </div>
        </div>
        <div className="space-y-3 pb-2 text-center">
          <Button
            onClick={() => {
              connectBanks(selected);
              router.push("/inicio");
            }}
          >
            Ver minha projeção
          </Button>
          <p className="text-[12px] text-muted">Você pode conectar outras contas depois, no Perfil.</p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar back="/verificacao" />
      <div className="animate-rise mt-10 flex flex-1 flex-col">
        <h1 className="font-serif text-[34px] leading-[1.05]">Conecte suas contas e cartões</h1>
        <p className="mt-3 text-[14px] text-ink-soft">Escolha seus bancos. Quanto mais contas, mais certeira fica a projeção.</p>

        <label className="glass mt-7 flex h-[42px] items-center gap-2.5 rounded-full px-4">
          <Search size={15} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar banco ou corretora"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted"
          />
        </label>

        <div className="glass mt-4 divide-y divide-line rounded-[24px] px-4">
          {banks.map((b) => {
            const on = selected.includes(b.id);
            return (
              <button key={b.id} onClick={() => toggle(b.id)} className="flex h-[58px] w-full items-center gap-3 text-left">
                <BankBadge id={b.id} />
                <span className="flex-1 text-[15px] font-medium">{b.name}</span>
                <span
                  className={cx(
                    "grid size-5 place-items-center rounded-full transition",
                    on ? "bg-ink text-page" : "ring-1 ring-graphite/25",
                  )}
                >
                  {on && <Check size={13} />}
                </span>
              </button>
            );
          })}
          {banks.length === 0 && <p className="py-5 text-center text-[13px] text-muted">Nenhum banco encontrado.</p>}
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-ink-soft">
          <ShieldCheck size={14} /> Conexão segura, somente leitura
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
          Conectar {selected.length > 0 ? `${selected.length} ${selected.length === 1 ? "conta" : "contas"}` : ""}
        </Button>
        <Link href="/saldo-inicial" className="block text-[13px] text-ink-soft">
          Prefiro informar meu saldo manualmente
        </Link>
      </div>
    </Screen>
  );
}
