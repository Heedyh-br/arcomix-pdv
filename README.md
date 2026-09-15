# Arcomix PDV

Sistema de PDV para caixa de mercado. Backend (NestJS) e frontend (React) completos,
módulos (a) a (g) implementados. Compilação verificada (`nest build` e `vite build`
rodam sem erro).

## Stack
- **Backend:** NestJS + TypeScript + TypeORM + PostgreSQL
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Auth:** JWT (Passport) + RBAC por perfil (Operador / Supervisor / Administrador)

## Como rodar local

### Backend
```bash
cd backend
cp .env.example .env   # ajuste host/usuário/senha do Postgres
npm install
npm run start:dev
```
Cria as tabelas automaticamente (`synchronize`, só em dev). O primeiro Administrador
precisa ser inserido direto no banco (o endpoint `POST /usuarios` já exige um
Administrador logado pra criar os demais).

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Crie um `.env` com `VITE_API_URL=http://localhost:3000` se o backend não estiver na
porta padrão.

## Cobertura de RF/RNF por módulo

**(a) Autenticação e perfis** — `src/auth`, `src/users`
RNF03 (login/senha, JWT, perfis, guards reutilizáveis). Base pra RF10/RF11
(`AuthService.validarSupervisor`).

**(b) Cadastro de produtos** — `src/produtos`
RF12 (CRUD com código de barras único), RF13 (consulta de estoque).

**(c) Abertura de caixa** — `src/caixa`
RF08 (abre com fundo de troco, operador, data/hora; bloqueia caixa duplicado).

**(d) Fluxo de venda** — `src/vendas`, `src/hardware`
RF01 (busca por código de barras), RF02 (inserção manual), RF03 (venda por peso,
`peso × preço/kg`), RF04 (cancelar item antes do pagamento), RF05 (total/troco
automáticos, troco só em dinheiro), RF06 (pagamento misto — N pagamentos por
venda), RF07 (cupom fiscal simulado, campos equivalentes a NFC-e/SAT — RNF04).
RNF01 (busca de produto é O(1) por índice único de código de barras). RNF05
(cada item/pagamento é persistido na hora — venda recuperável via
`GET /vendas/em-andamento`). RNF07 (leitor, balança, impressora e gaveta são
interfaces em `src/hardware`, com mocks — troque só o `provide: useClass` no
`hardware.module.ts` quando integrar hardware real).

**(e) Fechamento de caixa** — `src/caixa`
RF09 (compara valores contados x registrados, calcula divergência por forma de
pagamento).

**(f) Cancelamentos e descontos com autorização de supervisor** — dentro de
`src/vendas/vendas.service.ts`
RF10 (`cancelarVendaFinalizada` — exige login/senha de Supervisor, respeita prazo
configurável), RF11 (`aplicarDesconto` — acima do limite configurável, exige
Supervisor). RNF08 (ambos geram log em `src/auditoria`).

**(g) Relatórios** — `src/relatorios`
RF14 (por caixa e por período, segmentado por forma de pagamento; só
Supervisor/Administrador).

## O que ficou como [Suposição] configurável (não fixo no código)
Tabela `configuracoes_sistema` (`src/configuracao`), editável só por Administrador:
- `limite_desconto_percentual` (padrão 10%)
- `prazo_cancelamento_horas` (padrão 2h)

## Requisitos NÃO totalmente implementados (e por quê)
- **RNF02 (offline até 4h):** o padrão está desenhado (persistência imediata a
  cada alteração + endpoint idempotente seria o próximo passo), mas a fila local
  em IndexedDB e a sincronização automática ao reconectar no frontend ainda não
  foram implementadas nesta entrega — depende de mais uma rodada de trabalho no
  front dedicada a isso.
- **RNF04 (fiscal real):** o cupom simulado tem os campos equivalentes a uma
  NFC-e/SAT, mas não há integração real com SEFAZ nem homologação fiscal —
  isso depende de certificado digital e credenciamento, fora do escopo de código.
- **RNF07 (hardware real):** só os mocks estão implementados; leitor/balança/
  impressora/gaveta físicos exigem os drivers/SDKs do fabricante.
- **Telas de frontend:** login, tela pós-login e o design system (cores/tipografia)
  estão prontos; as telas de cadastro de produto, caixa, venda e relatórios ainda
  são só API — a UI dessas ainda não foi construída.

## Deploy no Netlify — leitura importante
Netlify serve muito bem o **frontend** (é só apontar `frontend/` como base, ele já
lê o `netlify.toml` incluso). O **backend NestJS não roda bem no Netlify**: Netlify
não hospeda servidor Node persistente, só funções serverless (stateless, com
timeout curto) — e este backend usa pool de conexão com Postgres via TypeORM, JWT
com sessão de até 8h e transações, o que não combina bem com esse modelo. Serviços
como Render, Railway ou Fly.io rodam o backend como está, sem adaptar nada. Depois
de subir o backend em um desses, é só apontar `VITE_API_URL` (nas variáveis de
ambiente do site no Netlify) pra URL pública dele.

## Rodando de graça (sem cartão de crédito)

**1. Banco — Neon (Postgres free, não expira)**
- Crie conta em neon.tech, crie um projeto.
- Copie a "Connection String" (pooled connection).

**2. Backend — Render (free web service)**
- Suba este projeto pro GitHub (repositório pode ser privado).
- No Render: New > Blueprint > aponte pro repositório. Ele lê o `render.yaml`
  da raiz automaticamente e já configura tudo.
- Depois de criado, vá em Environment e cole a connection string do Neon na
  variável `DATABASE_URL`.
- Free tier "dorme" depois de ~15 min sem acesso — o primeiro request depois
  disso demora uns 30-50s pra responder. Normal, não é bug.

**3. Frontend — Netlify (free)**
- No Netlify: Add new site > Import from Git > selecione o repositório,
  **Base directory: `frontend`** (ele já lê o `netlify.toml` de lá).
- Em Site settings > Environment variables, adicione `VITE_API_URL` com a URL
  pública que o Render deu ao backend (algo como
  `https://arcomix-pdv-backend.onrender.com`).
- Redeploy.

Terminada essa configuração, tanto o "acordar" do backend quanto o app em si
ficam 100% grátis nesses três provedores — só fique de olho se algum deles
mudar a política de free tier (isso muda com frequência e eu não tenho busca
na web ativada agora pra confirmar em tempo real).
