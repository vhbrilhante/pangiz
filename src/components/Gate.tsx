"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { nextRoute } from "@/lib/route";
import { useStore } from "@/lib/store";

/** Só mostra as abas do app depois do cadastro e da conexão das contas. */
export function Gate({ children }: { children: React.ReactNode }) {
  const { data, ready } = useStore();
  const router = useRouter();
  const target = ready ? nextRoute(data) : null;
  const allowed = target === "/inicio";

  useEffect(() => {
    if (target && !allowed) router.replace(target);
  }, [target, allowed, router]);

  if (!allowed) return null;
  return <>{children}</>;
}
