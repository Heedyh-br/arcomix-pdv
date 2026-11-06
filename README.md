# Arcomix PDV

Sistema de **Ponto de Venda (PDV) para caixa de mercado**, com API em NestJS e interface em React. Cobre o ciclo de um turno de caixa: login por perfil, abertura de caixa com fundo de troco, venda (por código de barras, manual ou por peso), pagamento misto, descontos e cancelamentos com autorização de supervisor, fechamento com conferência e relatórios.

O projeto nasceu de uma **especificação de requisitos (ERS)** com 14 requisitos funcionais e 8 não funcionais, e cada módulo do código aponta para o requisito que ele atende.




> A API roda no plano gratuito do Render, que "dorme" após ~15 min sem uso. O primeiro acesso pode levar de 30 a 50 segundos.


## Status do projeto

| Parte | Estado |
|---|---|
| API (auth, produtos, caixa, vendas, descontos, cancelamentos, relatórios) | Completa |
| Interface: login, abertura de caixa, tela do turno, fechamento e resumo | Pronta |
| Interface: venda, cadastro de produtos e relatórios | Em desenvolvimento (a API já existe) |
| Modo offline (RNF02) | Planejado |
| Integração fiscal e de hardware reais | Fora do escopo (há simulação e mocks) |

## Funcionalidades

**Perfis e segurança**
- Login com JWT (expira em 8h por padrão) e senhas com hash `bcrypt`
- Três perfis (Operador, Supervisor, Administrador) com controle de acesso por rota
- Log de auditoria para ações sensíveis

**Caixa**
- Abertura com fundo de troco, vinculada ao operador; bloqueia dois caixas abertos para o mesmo operador
- Fechamento comparando o valor contado com o registrado, com divergência por forma de pagamento (dinheiro, débito, crédito e Pix)

**Vendas**
- Busca de produto por código de barras ou inserção manual
- Venda por peso (peso × preço/kg)
- Cancelamento de item antes do pagamento, com total recalculado
- Pagamento misto (vários pagamentos na mesma venda); troco calculado só para dinheiro
- Cupom fiscal simulado, com campos equivalentes a NFC-e/SAT
- Venda persistida desde o primeiro item, podendo ser recuperada após queda do app

**Autorização de supervisor**
- Desconto acima do limite configurável exige login e senha de um Supervisor
- Cancelamento de venda finalizada exige Supervisor e respeita um prazo configurável
- Limite de desconto (padrão 10%) e prazo de cancelamento (padrão 2h) ficam na tabela `configuracoes_sistema`, editável só pelo Administrador

**Relatórios** (Supervisor e Administrador)
- Por caixa e por período, segmentados por forma de pagamento

## Stack

| Camada | Tecnologias |
|---|---|
| Backend | NestJS 10, TypeScript, TypeORM, PostgreSQL, Passport (JWT), bcrypt, class-validator |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Axios |
| Deploy | Render (API), Neon (PostgreSQL), Netlify (frontend) |

## Arquitetura

```
React (Netlify)  ──HTTP/JSON──▶  NestJS API (Render)  ──TypeORM──▶  PostgreSQL (Neon)
                                   ├─ auth / users (JWT + perfis)
                                   ├─ produtos · caixa · vendas
                                   ├─ configuracao · auditoria · relatorios
                                   └─ hardware (interfaces + mocks)
```

**Banco de dados:** PostgreSQL com 10 entidades: `usuarios`, `produtos`, `caixas`, `vendas`, `itens_venda`, `pagamentos`, `cupons_fiscais`, `descontos`, `configuracoes_sistema` e `logs_auditoria`.

**Decisões de projeto**
- **Valores monetários em centavos (inteiros)**, para evitar erro de arredondamento com ponto flutuante.
- **Hardware abstraído por interfaces** (leitor de código de barras, balança, impressora fiscal e gaveta). Hoje há mocks; para integrar um dispositivo real basta trocar a implementação no `hardware.module.ts`.
- **Regras de negócio configuráveis no banco**, e não fixas no código.
- **Persistência imediata** de itens e pagamentos, para a venda sobreviver a uma queda.

## Como rodar localmente

**Pré-requisitos:** Node.js 18+ e PostgreSQL.

### 1. Banco

Crie um banco vazio, por exemplo `arcomix_pdv`.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

No `.env`, para usar o Postgres local, **comente a linha `DATABASE_URL`** (ela é usada só em produção) e ajuste `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`. Defina também um `JWT_SECRET` próprio. A API sobe em `http://localhost:3000` e cria as tabelas sozinha (`DB_SYNCHRONIZE=true`).

### 3. Primeiro usuário administrador

O endpoint `POST /usuarios` exige um Administrador logado, então o primeiro é criado direto no banco. Gere o hash da senha (dentro de `backend/`):

```bash
node -e "console.log(require('bcrypt').hashSync('SUA_SENHA', 10))"
```

E insira o usuário:

```sql
INSERT INTO usuarios (nome, login, senha_hash, perfil)
VALUES ('Administrador', 'admin', '<hash gerado acima>', 'administrador');
```

Depois faça login e crie os demais usuários pela API.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Se a API não estiver em `localhost:3000`, crie `frontend/.env` com `VITE_API_URL=<url da API>`.

## Variáveis de ambiente (backend)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Postgres (produção). Se definida, ignora as `DB_*` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexão local |
| `DB_SYNCHRONIZE` | `true` cria as tabelas automaticamente |
| `JWT_SECRET` | Segredo de assinatura dos tokens |
| `JWT_EXPIRES_IN` | Validade do token (padrão `8h`) |
| `PORT` | Porta da API (padrão `3000`) |

## Endpoints principais

| Método e rota | Perfil | Descrição |
|---|---|---|
| `POST /auth/login` | público | Login, retorna JWT |
| `POST /usuarios` · `GET /usuarios` · `DELETE /usuarios/:id` | Administrador | Gestão de usuários |
| `GET /produtos` · `GET /produtos/codigo-barras/:codigo` | autenticado | Consulta de produtos |
| `POST /produtos` · `PATCH /produtos/:id` | Supervisor, Administrador | Cadastro e edição |
| `POST /caixas/abrir` · `GET /caixas/aberto` · `POST /caixas/:id/fechar` | autenticado | Ciclo do caixa |
| `POST /vendas` · `GET /vendas/em-andamento` | autenticado | Inicia e recupera venda |
| `POST /vendas/:id/itens` · `DELETE /vendas/:id/itens/:itemId` | autenticado | Itens da venda |
| `POST /vendas/:id/descontos` · `POST /vendas/:id/pagamentos` | autenticado | Desconto e pagamento |
| `POST /vendas/:id/cancelar-finalizada` | exige senha de Supervisor | Cancela venda concluída |
| `GET /relatorios/caixa/:id` · `GET /relatorios/periodo` | Supervisor, Administrador | Relatórios |
| `GET /configuracoes` · `PUT /configuracoes/:chave` | Administrador | Regras configuráveis |

## Limitações conhecidas e próximos passos

- Telas de venda, cadastro de produtos e relatórios no frontend
- Modo offline com fila local (IndexedDB) e sincronização ao reconectar
- Trocar `synchronize` por migrations do TypeORM
- Restringir o CORS à origem do frontend (hoje está liberado)
- Testes automatizados
- Integração fiscal real (SEFAZ, certificado digital) e com hardware físico

## Autor

**Edivaldo Pereira dos Santos Júnior** · estudante de Ciência de Dados e Análise e Desenvolvimento de Sistemas · Recife, PE
<!-- TODO: adicione seu LinkedIn e e-mail -->
