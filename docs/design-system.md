# Design system do pangiz · bento verde e preto

Base preta e blocos sólidos, redondos, em grade de bento. As mesmas cores da landing:

- **musgo** (`.paper`, `Card`): o bloco padrão. Saldo, listas, formulários e o widget de faturas;
- **limão** (`.glow`): a resposta, quanto dá pra investir e quando. Um por tela;
- **musgo claro** (`.forest`): a projeção, com o brilho limão subindo do fundo;
- **liquid glass** (`.lg`): só a navegação de baixo e o botão +.

Ícones: Material Symbols Rounded, preenchidos e em negrito (FILL 1, peso 700), em `src/components/icons.tsx`.
Serifa (Hedvig Letters Serif) para números e títulos, Instrument Sans para o resto, tudo em minúsculas.
Os tokens estão em `src/app/globals.css`; os componentes em `src/components/ui.tsx` e `src/components/visuals.tsx`.

## Cor

| Papel | Valor | Token |
|---|---|---|
| base | `#0b0d09` | `page` |
| texto sobre a base | `#eef0e2` | `ink` |
| apoio / rótulos | `#cdd1bf` / `#8e9580` | `ink-soft`, `muted` |
| blocos | `#161d10` (musgo), `#1f2916` (musgo claro) | `--moss`, `--moss-2`, `.paper`, `.forest` |
| limão | `#efff9a` → `#d4f53c` → `#7fae17`, texto `#0b0d09` | `.glow`, `--g1..4`, `lime` |
| linhas | `rgb(238 240 226 / .09)` | `line` |
| positivo / negativo / atenção | `#b9ec6a` / `#ff8f84` / `#ffcf7a` | `positive`, `negative`, `warning` |

- **Cada bloco redefine as cores de dentro.** `ink`, `muted`, `line`, `tile` e `on-ink` mudam por bloco, então
  `bg-tile`, `bg-ink text-on-ink` e `text-muted` funcionam igual em qualquer um deles.
- **O limão é só do dinheiro pra investir (e da marca).** Entradas não ficam verdes: o sinal `+` diz o que é entrada.
- **Início sem excesso:** saldo, widget de investimentos (abre a projeção), widget de faturas (abre cartões) e o próximo pagamento.

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
| `TransactionRow` | linha sem lixeira; com `onDelete`, arrastar para a esquerda revela o apagar. |
| `BottomNav` | liquid glass: abas redondas com rótulo (a ativa clara) e o + em vidro ao lado. |
| `Island`, `Roll`, `Tag`, `useTilt` | como antes: aviso no topo, odômetro, etiqueta, inclinação com o dedo. |

## Movimento

`--ease` para entradas, `--spring` para o que desliza. As micro-interações são a próxima etapa.

## Fluxos (pesquisa de finance trackers, out/2026)

Baseado em `research/reports/Fluxos e UI de finance trackers.md` na pasta do projeto:

- **início** (out/2026, pedido do Victor): bento enxuto. O saldo abre as transações, investimentos abre a projeção,
  faturas abre os cartões. Próximos 30 dias e últimos lançamentos saíram do início; os lançamentos ficam em transações e os pagamentos do mês na projeção.
- **transações**: resumo do mês (entrou / saiu), busca, filtro, um bloco por dia com o total do dia. Valores sempre com sinal,
  não só cor (daltonismo).
- **lançar**: valor primeiro no teclado próprio, depois tipo, categoria e conta.
