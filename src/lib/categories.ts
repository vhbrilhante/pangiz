import {
  ArrowDownLeft, BookOpen, Car, Coffee, CreditCard, Film, HeartPulse, House, type IconType,
  Music, PiggyBank, ShoppingBag, ShoppingBasket, Wallet, Zap, Send,
} from "@/components/icons";
import type { CategoryId } from "./types";

export const CATEGORIES: Record<CategoryId | "cartao", { label: string; icon: IconType }> = {
  mercado: { label: "Mercado", icon: ShoppingBasket },
  alimentacao: { label: "Alimentação", icon: Coffee },
  transporte: { label: "Transporte", icon: Car },
  moradia: { label: "Moradia", icon: House },
  contas: { label: "Contas", icon: Zap },
  lazer: { label: "Lazer", icon: Film },
  saude: { label: "Saúde", icon: HeartPulse },
  educacao: { label: "Educação", icon: BookOpen },
  compras: { label: "Compras", icon: ShoppingBag },
  assinaturas: { label: "Assinaturas", icon: Music },
  salario: { label: "Salário", icon: Wallet },
  pix: { label: "Pix", icon: ArrowDownLeft },
  investimento: { label: "Investimento", icon: PiggyBank },
  outros: { label: "Outros", icon: Send },
  cartao: { label: "Cartão", icon: CreditCard },
};

export const EXPENSE_CATEGORIES: CategoryId[] = [
  "mercado", "alimentacao", "transporte", "moradia", "contas", "lazer",
  "saude", "educacao", "compras", "assinaturas", "outros",
];

export const INCOME_CATEGORIES: CategoryId[] = ["salario", "pix", "investimento", "outros"];
