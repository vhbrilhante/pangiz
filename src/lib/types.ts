// Modelo de dados do pangiz. Valores em reais (number). Gastos são negativos.

export type CategoryId =
  | "mercado"
  | "alimentacao"
  | "transporte"
  | "moradia"
  | "contas"
  | "lazer"
  | "saude"
  | "educacao"
  | "compras"
  | "assinaturas"
  | "salario"
  | "pix"
  | "investimento"
  | "outros";

export interface Account {
  id: string;
  bank: string;
  name: string;
  balance: number;
  /** Data (ISO) da última vez que o saldo foi conferido. */
  checkedAt: string;
}

export interface Card {
  id: string;
  bank: string;
  name: string;
  last4: string;
  limit: number;
  /** Dia do mês em que a fatura vence. */
  dueDay: number;
}

export interface Transaction {
  id: string;
  /** Data ISO (yyyy-mm-dd). */
  date: string;
  description: string;
  amount: number;
  category: CategoryId;
  accountId?: string;
  cardId?: string;
}

/** Algo que se repete todo mês: salário, aluguel, assinaturas. */
export interface Recurring {
  id: string;
  description: string;
  amount: number;
  day: number;
  category: CategoryId;
  accountId?: string;
  cardId?: string;
  /** Mês (yyyy-mm) a partir do qual vale. */
  startMonth: string;
  /** Último mês (yyyy-mm), se tiver fim. */
  endMonth?: string;
}

/** Compra parcelada. Cada parcela cai em um mês, a partir de firstMonth. */
export interface Installment {
  id: string;
  description: string;
  /** Valor de cada parcela (positivo). */
  installmentAmount: number;
  count: number;
  /** Mês (yyyy-mm) em que a 1ª parcela é paga. */
  firstMonth: string;
  category: CategoryId;
  cardId?: string;
  /** Dia de pagamento quando não é no cartão (boleto, carnê). */
  day?: number;
}

export interface User {
  name: string;
  email: string;
  verified: boolean;
}

export interface Settings {
  /** Quanto o usuário quer manter na conta como colchão. */
  reserve: number;
  hideValues: boolean;
  /** Quantos meses a projeção mostra. */
  horizon: number;
}

export interface AppData {
  version: 1;
  onboarded: boolean;
  user: User | null;
  setupDone: boolean;
  accounts: Account[];
  cards: Card[];
  transactions: Transaction[];
  recurring: Recurring[];
  installments: Installment[];
  settings: Settings;
}
