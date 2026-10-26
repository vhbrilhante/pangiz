# Design system do pangiz · direção A, horizonte

Um preto quase puro e uma luz que nasce no horizonte. A luz é o único acento e carrega a ideia do app:
**quanto dá pra investir, e quando**. Na Início ela sobe conforme o valor do mês escolhido.

Os tokens estão em `src/app/globals.css` (cores em `:root`, escala em `@theme`). Os componentes estão em
`src/components/ui.tsx` e `src/components/visuals.tsx`. Os previews aprovados estão no canvas "pangiz redesign".

Referências: [gradients.sh](https://gradients.sh/) (coleção First Light), apple-design (movimento contínuo e interrompível)
e taste-skill (sem serifa genérica, sem paleta bege e latão, um conceito tirado do próprio assunto).

## Cor

| Papel | Valor | Token |
|---|---|---|
| fundo | `#09090c` | `page` |
| texto | `#f4f1ea` | `ink` |
| texto de apoio | `#d8d2c6` | `ink-soft` |
| rótulos e metadados | `#a9a49a` | `muted` |
| vidro | branco a 7% | `glass` (`bg-white/7`, `bg-white/8`) |
| superfície opaca que flutua | `rgb(12 10 16 / .72)` + desfoque | `glass-strong` |
| luz do horizonte | `#ffe2b8` → `#ff9a5c` → `#d9466a` → `#5a2a7a` | `--glow-1..4`, `glow`, `glow-light` |
| texto sobre a luz | `#1a0f14` | `--glow-ink` |
| lavagem da luz | `#ff9a5c` a 14% | `glow-wash` |
| positivo / negativo / atenção | `#9fdcb0` / `#ff8a8a` / `#ffc98a` | `positive`, `negative`, `warning` |

- **A luz é o único acento.** Ela aparece no fundo (`Backdrop`), no cartão aceso (`.glow`), nas barras do gráfico, no trilho da reserva e na caixa de impacto do +. Nada mais é colorido.
- **Ação é creme** (`bg-ink text-page`): botão principal, botão +, pílula ou segmento selecionado.
- Gastos comuns ficam em `ink`, sem vermelho. `negative` só para saldo negativo e alertas.

## Fundo

`<Screen light="bottom|middle|top|none" rise={0..1}>` desenha a luz e o grão de filme por trás da tela.

| Tela | `light` | Por quê |
|---|---|---|
| Início | `bottom`, `rise` = investível do mês ÷ saldo | a luz nasce embaixo e sobe com o valor |
| Projeção | `middle` | ilumina o gráfico |
| + | `top` | ilumina o valor sendo digitado |
| Cartões, Perfil, Transações, entrada | `middle` (padrão) | |

A luz respira devagar (14 s). O grão é um `feTurbulence` a 16% em `overlay`. Com `prefers-reduced-motion`, tudo para.

## Tipografia

Geist em tudo. Números e títulos em `font-display` (Geist 600), com tracking mais apertado quanto maior.

| Token | Tamanho | Tracking | Uso |
|---|---|---|---|
| `text-hero` | 72 | −0,05em | quanto dá pra investir (Início) |
| `text-display-xl` | 64 | −0,05em | total da Projeção, valor no + |
| `text-display` | 56 | −0,045em | saldo |
| `text-display-sm` | 40 | −0,04em | fatura |
| `text-heading` | 30 | −0,03em | títulos do fluxo de entrada |
| `text-value` | 22 | −0,03em | valores secundários |
| `text-title` | 17 | −0,01em | título de tela, saudação (medium) |
| `text-body-lg` / `body` / `body-sm` | 16 / 15 / 14 | | botões, linhas, parágrafos |
| `text-label` / `caption` / `micro` | 13 / 12 / 11 | | chips, rótulos, eixo |

Microcopy em minúsculas, com ` · ` como separador. Dinheiro sempre por `<Money>` ou `<Roll>`; negativo com `−` (U+2212).
Valores redondos aparecem sem centavos (`compact`): `R$ 3.020`.

## Forma

- **Tudo que se toca é pílula** (`rounded-full`) e tem pelo menos 44 px: botões (56), botão de ícone (44), chips e segmentos (36 de altura dentro de uma área maior), abas (64).
- `rounded-field` 16 (campos, teclas), `rounded-card` 22 (cartões e listas), `rounded-card-lg` 28, `rounded-t-sheet` 34.
- **Plano por padrão.** Sem bordas pesadas: vidro a 7% e, quando precisa, um anel de 1 px a 10%. Sombra só no que flutua (`shadow-float`) e o brilho do `.glow`.

## Componentes

| Componente | Regra |
|---|---|
| `Screen` | posiciona a luz (`light`, `rise`) e aplica "ocultar valores". |
| `Button` | `primary` creme (um por tela), `glass`, `ghost`, `link` para a segunda ação. |
| `Segmented` | pílula de vidro; o ativo é creme e desliza com mola. |
| `Chip` | pílula; ativo creme, inativo vidro. |
| `Tag` | pílula pequena: `accent` (lavagem da luz), `neutral`, `positive`, `negative`. |
| `.glow` | o cartão aceso (fatura, cartão do onboarding). Texto escuro por dentro. Inclina com o dedo. |
| `Roll` | odômetro; respeita "ocultar valores" (desfoca). |
| `ProjectionScrub` | barras acesas pela luz; o mês escolhido acende inteiro; arraste ou setas. |
| `BottomNav` | pílula escura só com ícones (com `aria-label`), destaque que desliza e + creme. |
| `Island` | aviso que sai da Dynamic Island (código chegou, saldos atualizados). |

## Movimento

`--ease` para entradas, `--spring` para o que desliza (segmentado, abas, +). Entradas sobem com fade uma vez por tela.
A luz e o odômetro são o movimento contínuo; o resto responde ao toque. Tudo é interrompível.
