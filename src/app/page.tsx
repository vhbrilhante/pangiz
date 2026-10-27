"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Screen, Wordmark } from "@/components/ui";
import { nextRoute } from "@/lib/route";
import { useStore } from "@/lib/store";

export default function Root() {
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
