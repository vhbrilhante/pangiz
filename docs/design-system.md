# Design system do pangiz

Escuro, quente e calmo: um preto esfumaçado, vidro discreto, **um** destaque em champanhe por tela e valores grandes em serifa.
Os tokens estão em `src/app/globals.css` (cores em `:root`, escala em `@theme`). Os componentes estão em `src/components/ui.tsx` e `src/components/visuals.tsx`.

A estrutura segue a referência da Wise (uma cor dominante, um único acento, pílulas, display apertado, superfícies planas).
As cores, a tipografia e o tom são os do pangiz.

## Da Wise para o pangiz

| Wise | Papel | pangiz | Token |
|---|---|---|---|
| Forest Ink `#163300` | cor dominante, peso e autoridade | preto quente `#121211` (fundo) e `#1d1d17` (texto sobre champanhe) | `page`, `--champagne-ink` |
| Lime Voltage `#9fe870` | o único acento, um por seção | champanhe `#bdbb9d` → `#e4e1cb` | `champagne`, `champagne-light`, `.champagne` |
| Linen Mist `#e2f6d5` | lavagem do acento: etiquetas e destaques fracos | champanhe a 12% | `champagne-wash` |
| Fog `#e8ebe6` | superfície de cartão | vidro branco a 5,5% com borda de 11% | `glass`, `glass-border` |
| Spruce `#054d28` | superfície escura secundária | `#191917` opaco (folhas) | `raised` |
| Obsidian / Charcoal | display / corpo | creme `#efece3` | `ink` |
| Slate / Pebble | texto de apoio / suave | `#bdb9ae` / `#85827a` | `ink-soft`, `muted` |
| Alarm Red | alerta | terracota `#e7a08c` | `negative` |
| Wise Sans 900 | a voz do display | Newsreader 400, serifa | `font-serif`, `.big` |
| Inter | o trabalho quieto | Geist | `font-sans` |

O que **não** veio da Wise: o tema claro, o verde e o lima, o caixa-alta e o peso 900.
A voz do pangiz é a serifa leve em minúsculas, não o bloco gritado.

## Cor

- **Um destaque por tela.** O champanhe marca a resposta principal: o cartão "pode investir" na Início, a fatura em Cartões, a parte investível no gráfico. Dois champanhes na mesma área competem.
- **Ação ≠ destaque.** A ação principal é creme sólido (`bg-ink text-page`). O champanhe é o que o usuário precisa ver; o creme é o que ele toca.
- **Inversão.** Dentro de `.champagne` as cores de texto viram escuras sozinhas (`--ink`, `--muted` e `--line` são redefinidos). É o equivalente da seção verde-escura da Wise.
- Valores positivos em `positive`, negativos em `negative`. Gastos comuns ficam em `ink`, sem vermelho.

## Superfícies

| Nível | Nome | Uso |
|---|---|---|
| 0 | `page` + fundo esfumaçado (`Backdrop`) | toda tela |
| 1 | `.glass` | cartões, listas, campos, chips inativos |
| 2 | `champagne-wash` | etiquetas de destaque |
| 3 | `.champagne` | o destaque da tela |
| 4 | `bg-ink` | botão principal, chip e aba ativos |

Superfícies opacas (`raised`, `.glass-strong`) só no que flutua: folha do +, navegação inferior.

## Tipografia

A serifa é a voz: valores, títulos e saudação. Quanto maior, mais apertado o tracking (como a Wise faz com a Wise Sans).

| Token | Tamanho | Entrelinha | Tracking | Uso |
|---|---|---|---|---|
| `text-display-xl` | 54 | 1 | −0,03em | saldo da Início, valor no + |
| `text-display` | 44 | 1 | −0,025em | total da Projeção |
| `text-display-sm` | 40 | 1 | −0,02em | valor no cartão champanhe, fatura |
| `text-heading` | 32 | 1,06 | −0,015em | título de tela |
| `text-title` | 26 | 1 | −0,01em | saudação, marca, título de folha |
| `text-value` | 22 | 1 | −0,01em | valores secundários |
| `text-body-lg` | 15 | 1,4 | | botões |
| `text-body` | 14 | 1,45 | | linhas de lista |
| `text-body-sm` | 13 | 1,45 | | parágrafos curtos |
| `text-label` | 12 | 1,35 | | chips, segmentado |
| `text-caption` | 11 | 1,4 | | rótulos e metadados |
| `text-micro` | 10 | 1,2 | | abas, eixo do gráfico |

Microcopy em minúsculas, com ` · ` como separador ("saldo disponível agora", "Nubank · Itaú · atualizado agora").
Dinheiro sempre por `<Money>` ou `<Roll>`; negativo com o sinal de menos tipográfico: `− R$ 126,90`.

## Forma

- **Tudo que se toca é pílula** (`rounded-full`): botões, chips, segmentado, etiquetas, abas, botões de ícone.
- `rounded-field` (16) para campos, teclas e caixas de informação; `rounded-card` (24) para cartões e listas;
  `rounded-card-lg` (28) para cartões de destaque grandes; `rounded-t-sheet` (34) para folhas.
- **Plano por padrão.** A separação vem da borda fina do vidro. Sombra só no que flutua: `shadow-float` (botão +, ícone de sucesso)
  e a sombra própria do `.champagne`. `shadow-sheen` é o brilho de 1px no topo do botão de vidro.

## Componentes

| Componente | Regra |
|---|---|
| `Button` | `primary` creme, um por tela. `glass` para ações neutras. `link` (texto sublinhado) para a segunda ação: nunca dois botões cheios lado a lado. |
| `Segmented` | pílula de vidro; o ativo é creme e desliza entre as opções. |
| `Chip` | pílula; ativo creme, inativo vidro. |
| `Tag` | pílula pequena: `accent` (lavagem champanhe), `neutral`, `positive`, `negative`. |
| `Card` | vidro, `rounded-card`, 18px de respiro. |
| `.champagne` | o destaque da tela. Inclina com o dedo (`useTilt`). |
| `Roll` | valor em odômetro; respeita "ocultar valores" (desfoca). |
| `BottomNav` | 4 abas com pílula que desliza + botão + creme. |
| `Island` | aviso que sai do topo (código chegou, saldos atualizados). |

## Movimento

`--ease` para entradas e transições, `--spring` para o que desliza (pílulas, segmentado, botão +).
Entradas: subida com fade (`animate-rise`, `delay-1..3`) e títulos palavra por palavra (`Rise`). Uma vez por tela, nada em loop.
`prefers-reduced-motion` desliga tudo isso.
