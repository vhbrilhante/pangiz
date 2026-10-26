# Design system do pangiz · bento verde

Base preta e blocos grandes e redondos empilhados, como cartões numa mesa:

- **claro** (`.paper`): a visão geral, o saldo, listas e formulários;
- **verde** (`.glow`, o degradê lima → verde → verde-água): a resposta, quanto dá pra investir e quando;
- **floresta** (`.forest`): a projeção, com barras redondas;
- **escuro** (`.glass-strong`): detalhe do mês e a navegação.

Serifa (Hedvig Letters Serif) para números e títulos, Instrument Sans para o resto, tudo em minúsculas.
Os tokens estão em `src/app/globals.css`; os componentes em `src/components/ui.tsx` e `src/components/visuals.tsx`.

## Cor

| Papel | Valor | Token |
|---|---|---|
| base | `#0b0c0b` | `page` |
| texto sobre a base | `#f4f3ee` | `ink` |
| apoio / rótulos | `#d3d5cd` / `#9a9d95` | `ink-soft`, `muted` |
| bloco claro | `#f5f4ee`, tiles `#e7e6df`, texto `#121411` | `.paper`, `--paper*` |
| degradê verde | `#eafc9a` → `#c6f25a` → `#7fdd8c` → `#2fb07a`, texto `#0f1f0d` | `.glow`, `--g1..4`, `lime` |
| floresta | `#1d5a3e` → `#0e2e21` | `.forest` |
| escuro | `#1a1c1a` | `.glass-strong` |
| positivo / negativo / atenção | `#9fe39a` / `#ff8f84` / `#ffcf7a` | `positive`, `negative`, `warning` |

- **Cada bloco redefine as cores de dentro.** `ink`, `muted`, `line`, `tile` e `on-ink` mudam por bloco, então
  `bg-tile`, `bg-ink text-on-ink` e `text-muted` funcionam igual em qualquer um deles.
- **Ação é a cor `ink` do bloco** (`bg-ink text-on-ink`): preta no claro e no verde, clara no escuro e no floresta.
- **O verde é o destaque.** Um bloco verde por tela, o botão + e o "simular" da projeção. Barras com sobra pra investir em lima.

## Tipografia

| Token | Tamanho | Uso |
|---|---|---|
| `text-hero` | 64 | reservado para um número de destaque |
| `text-display-xl` | 56 | valor no + |
| `text-display` | 46 | saldo, total da projeção |
| `text-display-sm` | 38 | quanto investir no bloco verde, fatura |
| `text-heading` | 32 | títulos de tela e saudação (serifa) |
| `text-value` | 24 | valores secundários |
| `text-title` / `body-lg` / `body` / `body-sm` | 18 / 16 / 15 / 14 | |
| `text-label` / `caption` / `micro` | 13 / 12 / 11 | pílulas, rótulos, eixo |

`font-display` e `.big` usam a serifa. Microcopy em minúsculas com ` · `; marcas e siglas mantêm a grafia (Open Finance, Face ID).
Dinheiro por `<Money>`/`<Roll>`, com espaço inseparável (`R$ 1.200` nunca quebra) e `−` (U+2212) nos negativos.

## Forma

- **Tudo é redondo.** Botões, pílulas, teclas, barras e abas são `rounded-full`. Pílulas de 44 a 56 px de altura.
- Blocos `rounded-card-lg` (32) com 20 px de respiro, `rounded-card` (28) para cartões internos, `rounded-field` (20) para tiles e campos.
- Blocos a 10 px das bordas e 10 px entre si. Sem bordas: a separação é a cor do bloco.

## Componentes

| Componente | Regra |
|---|---|
| `Screen` | base preta com um respiro de verde (`light`); telas em bento usam `!px-2.5`. |
| `Card` | bloco claro. |
| `Button` | `primary` na cor de ação do bloco; `link` para a segunda ação. |
| `Segmented` / `Chip` | pílulas; o ativo na cor de ação. |
| `ProjectionScrub` | barras redondas no bloco floresta; o mês escolhido em branco, meses com sobra em lima. |
| `BottomNav` | barra escura com botões redondos de 56 px (o ativo claro) e o + verde. |
| `Island`, `Roll`, `Tag`, `useTilt` | como antes: aviso no topo, odômetro, etiqueta, inclinação com o dedo. |

## Movimento

`--ease` para entradas, `--spring` para o que desliza. As micro-interações são a próxima etapa.
