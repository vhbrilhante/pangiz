"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@/components/ui";
import { demoData } from "@/lib/demo";
import { EMPTY } from "@/lib/store";
import type { AppData } from "@/lib/types";

// Simulador de iPhone para testar no desktop: o app roda num iframe de 393×852 dentro de uma moldura,
// com barra de status, Dynamic Island e as áreas seguras de um iPhone 15.
// No celular a rota manda direto para o app.

const W = 393;
const H = 852;
const SAFE_TOP = 59;
const SAFE_BOTTOM = 34;
const KEY = "pangiz:v1";

const SCREENS = [
  { path: "/inicio", label: "início" },
  { path: "/projecao", label: "projeção" },
  { path: "/lancar", label: "+ lançar" },
  { path: "/cartoes", label: "cartões" },
  { path: "/perfil", label: "perfil" },
  { path: "/transacoes", label: "transações" },
];

const FLOW = [
  { path: "/boas-vindas", label: "onboarding" },
  { path: "/cadastro", label: "cadastro" },
  { path: "/verificacao", label: "verificação" },
  { path: "/conectar", label: "conectar bancos" },
];

/** Conta de exemplo já conectada, para cair direto nas abas. */
function sample(): AppData {
  return {
    ...EMPTY,
    onboarded: true,
    setupDone: true,
    user: { name: "Victor Almeida", email: "victor@email.com", verified: true },
    ...demoData(["nubank", "itau"]),
  };
}

function StatusBar() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(`${n.getHours()}:${String(n.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[54px] items-center justify-between pl-[46px] pr-[34px] pt-1.5 text-[16px] font-semibold text-ink">
      <span className="tabular">{time}</span>
      <svg width="70" height="13" viewBox="0 0 70 13" fill="currentColor" aria-hidden>
        <rect x="0" y="8" width="3" height="5" rx="1" />
        <rect x="5" y="5.5" width="3" height="7.5" rx="1" />
        <rect x="10" y="3" width="3" height="10" rx="1" />
        <rect x="15" y="0.5" width="3" height="12.5" rx="1" />
        <path d="M31 3.6a9 9 0 0 1 11.8 0l-1.4 1.5a7 7 0 0 0-9 0zM33.4 6.2a5.6 5.6 0 0 1 7 0l-1.5 1.5a3.4 3.4 0 0 0-4 0zM36.9 9.4l1.5 1.6 1.5-1.6a2.2 2.2 0 0 0-3 0z" />
        <rect x="47.5" y="1" width="20" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".5" />
        <rect x="49.5" y="3" width="14" height="7" rx="1.6" />
        <rect x="68.5" y="4.5" width="1.5" height="4" rx=".7" opacity=".5" />
      </svg>
    </div>
  );
}

export default function Simulator() {
  const router = useRouter();
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const [path, setPath] = useState("/");
  const [src, setSrc] = useState("/");
  const [reloads, setReloads] = useState(0);

  // No celular não faz sentido simular um celular.
  useEffect(() => {
    if (window.matchMedia("(max-width: 600px)").matches) router.replace("/");
  }, [router]);

  // Escala o aparelho para caber na janela.
  useEffect(() => {
    const fit = () => setScale(Math.min(1.1, (window.innerHeight - 48) / (H + 24), (window.innerWidth - 300) / (W + 24)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // As rotas do app trocam sem recarregar o iframe, então a rota atual é lida de tempos em tempos.
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const p = frame.current?.contentWindow?.location.pathname;
        if (p) setPath(p);
      } catch {
        // iframe ainda carregando
      }
    }, 400);
    return () => clearInterval(id);
  }, []);

  // Fixa as áreas seguras do iPhone dentro do app e esconde a barra de rolagem.
  const onLoad = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc || doc.getElementById("sim-style")) return;
    const style = doc.createElement("style");
    style.id = "sim-style";
    style.textContent = `:root{--safe-top:${SAFE_TOP}px;--safe-bottom:${SAFE_BOTTOM}px}html{scrollbar-width:none}::-webkit-scrollbar{display:none}`;
    doc.head.appendChild(style);
  }, []);

  function open(p: string) {
    const win = frame.current?.contentWindow;
    // Navegação interna do Next quando possível (mantém as animações de troca de tela).
    const next = (win as (Window & { next?: { router?: { push: (p: string) => void } } }) | null)?.next;
    if (next?.router) next.router.push(p);
    else {
      setSrc(p);
      setReloads((n) => n + 1);
    }
  }

  function restart(data: AppData | null, to: string) {
    try {
      if (data) localStorage.setItem(KEY, JSON.stringify(data));
      else localStorage.removeItem(KEY);
    } catch {
      // modo privado: o app recomeça na memória
    }
    setSrc(to);
    setReloads((n) => n + 1);
  }

  const btn = (on: boolean) =>
    cx("h-8 rounded-full px-3 text-left text-label transition", on ? "bg-ink text-on-ink" : "text-ink-soft hover:bg-tile");

  return (
    <div
      className="flex min-h-dvh items-center justify-center gap-10 px-6"
      style={{ background: "radial-gradient(70% 60% at 50% 30%, #23221f 0%, #121211 70%)" }}
    >
      <aside className="flex w-[200px] shrink-0 flex-col gap-5 text-ink">
        <div>
          <p className="font-display text-title">pangiz</p>
          <p className="mt-1 text-caption text-muted">simulador de iPhone 15 · 393 × 852</p>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Telas do app">
          <p className="mb-1 text-caption text-muted">telas</p>
          {SCREENS.map((s) => (
            <button key={s.path} onClick={() => open(s.path)} className={btn(path === s.path)}>
              {s.label}
            </button>
          ))}
        </nav>

        <nav className="flex flex-col gap-1" aria-label="Fluxo de entrada">
          <p className="mb-1 text-caption text-muted">fluxo de entrada</p>
          {FLOW.map((s) => (
            <button key={s.path} onClick={() => open(s.path)} className={btn(path === s.path)}>
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-1">
          <p className="mb-1 text-caption text-muted">dados</p>
          <button onClick={() => restart(sample(), "/inicio")} className={cx(btn(false), "flex items-center gap-2")}>
            <RotateCcw size={13} /> recomeçar com exemplo
          </button>
          <button onClick={() => restart(null, "/")} className={cx(btn(false), "flex items-center gap-2")}>
            <Trash2 size={13} /> do zero (onboarding)
          </button>
        </div>

        <p className="text-caption leading-normal text-muted">
          arraste com o mouse: o cartão inclina, o gráfico troca de mês e, no topo da início, puxa para atualizar.
        </p>
      </aside>

      <div style={{ width: (W + 24) * scale, height: (H + 24) * scale }} className="shrink-0">
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }} className="p-3">
          <div
            className="relative overflow-hidden rounded-[58px] bg-[#0a0a09]"
            style={{ width: W, height: H, boxShadow: "0 0 0 11px #1b1b1a, 0 0 0 12px #3a3936, 0 40px 90px -20px rgb(0 0 0 / 0.8)" }}
          >
            <iframe
              key={reloads}
              ref={frame}
              src={src}
              onLoad={onLoad}
              title="pangiz no iPhone"
              className="absolute inset-0 border-0"
              style={{ width: W, height: H }}
            />
            <StatusBar />
            <div className="pointer-events-none absolute left-1/2 top-[11px] z-20 h-[35px] w-[122px] -translate-x-1/2 rounded-[20px] bg-black" />
            <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink/75" />
          </div>
        </div>
      </div>
    </div>
  );
}
