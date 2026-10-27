import type { AppData } from "./types";

/** Para onde o usuário deve ir, dado o estado atual. */
export function nextRoute(d: AppData): string {
  if (!d.onboarded) return "/boas-vindas";
  if (!d.user) return "/login";
  if (!d.user.verified) return "/verificacao";
  if (!d.setupDone) return "/conectar";
  return "/inicio";
}
