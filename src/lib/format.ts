const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function money(value: number, opts: { hide?: boolean; compact?: boolean; sign?: boolean } = {}): string {
  if (opts.hide) return "R$ •••••";
  const f = opts.compact ? brlCompact : brl;
  const text = f.format(Math.abs(value)).replace(/ /g, " ");
  if (value < 0) return `- ${text}`;
  if (opts.sign && value > 0) return `+ ${text}`;
  return text;
}

/** Converte o texto digitado ("1.234,56" ou "1234.56") em número. */
export function parseMoney(text: string): number {
  const clean = text.replace(/[^\d,.-]/g, "");
  if (clean.includes(",")) return Number(clean.replace(/\./g, "").replace(",", ".")) || 0;
  return Number(clean) || 0;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
