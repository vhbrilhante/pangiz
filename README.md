# pangiz

App de finanças pessoais que responde uma pergunta: **quanto posso investir, e em que mês?**

PWA em Next.js + TypeScript + Tailwind. Os dados ficam no `localStorage` do aparelho por enquanto.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # testes do motor de projeção
npm run build && npm start
```

No celular, abra o endereço (por exemplo via Tailscale) e use "Adicionar à tela de início".

No desktop, abra `/simulador` (http://localhost:3000/simulador): o app roda dentro de uma moldura de iPhone 15,
com atalhos para cada tela e para recomeçar com dados de exemplo ou do zero.

## Site (GitHub Pages)

https://vhbrilhante.github.io/pangiz/ abre uma entrada para escolher:

- **landing page** (`public/landing/index.html`, HTML estático, cópia da landing da pasta do projeto);
- **app mobile**: no computador abre em `/simulador` (moldura de iPhone), no celular abre `/app` em tela cheia.

## Fluxo (segue o Figma)

1. `/boas-vindas`: 3 telas de onboarding (cartão prateado, visão total do saldo, projeções)
2. `/cadastro` e `/login`
3. `/verificacao`: código de 6 dígitos
4. `/conectar`: escolher bancos, sincronizando, sucesso
5. `/inicio`: bento com o saldo, o widget de investimentos (abre a projeção), o de faturas (abre cartões) e o próximo pagamento

Além do Figma:

- `/projecao`: o diferencial. Saldo mês a mês (6, 12 ou 24 meses), quanto dá para investir em cada mês sem passar da reserva, detalhe de cada mês e aviso de dados desatualizados.
- `/lancar` (botão +): gasto, receita, compra parcelada ou conta fixa, mostrando o impacto na projeção antes de salvar.
- `/cartoes`: fatura em aberto, limite, próximas faturas e parcelamentos.
- `/perfil`: contas (com "corrigir saldo"), contas fixas e renda, sair, apagar dados.
- `/transacoes`: lista completa.
- `/saldo-inicial`: caminho manual, só saldo e renda, para quem não quer conectar banco.

## O que ainda é simulado

- **Login e verificação**: não há servidor. Qualquer código de 6 dígitos funciona.
- **Conectar bancos**: carrega dados de exemplo (`src/lib/demo.ts`). A integração real (Open Finance ou importar extrato CSV/OFX) é o próximo passo grande.
- **Apple, Google e Face ID**: só os botões.

## Como a projeção funciona

Tudo em `src/lib/projection.ts`, com testes em `projection.test.ts`.

- Parte do saldo das contas hoje.
- Contas fixas e parcelas em boleto caem no dia delas.
- Compras no cartão de um mês viram a fatura do mês seguinte; parcelas no cartão entram na fatura do mês da parcela.
- "Pode investir" no mês M é o quanto dá para tirar no fim de M sem que o saldo fique abaixo da reserva em nenhum dia depois, até o fim do horizonte. O cálculo é guloso: sugere investir o mais cedo possível.

## Estrutura

```
src/
  app/                 telas (App Router)
    (app)/             abas com a navegação de baixo
  components/          ui.tsx (botões, campos, vidro), visuals.tsx (cartão 3D, gráficos, nav)
  lib/
    types.ts           modelo de dados
    projection.ts      motor da projeção
    store.tsx          estado + localStorage
    demo.ts            bancos e dados de exemplo
    dates.ts, format.ts, categories.ts
```
