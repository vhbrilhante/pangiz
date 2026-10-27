"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Screen, Wordmark } from "@/components/ui";
import { nextRoute } from "@/lib/route";
import { useStore } from "@/lib/store";

// Entrada do app: manda para a etapa certa (onboarding, login, verificação, conectar ou início).
export default function AppEntry() {
  const { data, ready } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready) router.replace(nextRoute(data));
  }, [ready, data, router]);

  return (
    <Screen className="items-center justify-center">
      <Wordmark className="text-display" />
    </Screen>
  );
}
