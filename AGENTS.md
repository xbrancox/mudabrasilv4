# AGENTS.md — VotaBrasil / MeuVoto

Regras para qualquer agente de IA (Cursor, Continue, Codex) que editar este repositório.

## Stack real (não invente camadas)

- **Backend**: Node.js >= 22, HTTP puro (`node:http`) — **sem Express, sem Fastify**.
- **Entrada**: `server/index.js` (arquivo grande; edite por função, não reescreva).
- **Banco**: `node:sqlite` nativo, arquivo em `DB_PATH` (produção: `/data/votos.db`, volume do Railway).
- **Estáticos**: HTML/CSS/JS em `pages/`, `css/`, `js/`, servidos pelo próprio servidor e também por GitHub Pages.
- **E-mail**: `server/mailer.js` (nodemailer/SMTP hoje; Resend é migração planejada).
- **Testes**: `node --test` em `tests/`, smoke em `tests/smoke.js`, Playwright em `tests/e2e/`.
- **Deploy**: Docker (`Dockerfile`) no Railway (`railway.toml`), healthcheck `/api/health`.
- **Borda**: Cloudflare (DNS/proxy) para `meu-voto.app`; `_headers` e `_redirects` na raiz.

## Comandos

```bash
npm start              # sobe o servidor (porta 8080)
npm test               # smoke
npm run test:unit      # node --test tests/unit
npm run health:check   # scripts/health_check.js
npm run check          # sintaxe de server/*.js (novo)
```

## Convenções de código

- CommonJS (`require`/`module.exports`), sem `import` ESM no servidor.
- Não adicionar dependência sem justificar: o projeto evita frameworks.
- SQL sempre parametrizado (`?`), nunca interpolar valor em query.
- Toda rota nova precisa de: validação de entrada, resposta de erro em JSON `{ error: "..." }` e teste.
- Logs via `server/logger.js` (JSONL), não `console.log` solto em produção.
- Segredos só em `.env` (já ignorado pelo git). Nunca commitar `.env*`.

## O que NÃO fazer

- Não reescrever `server/index.js` inteiro; faça diffs pequenos e focados.
- Não apagar `scripts/` antigos (`_debug*`, `_fix*`): são histórico, não entram no build.
- Não mexer em `railway.toml`/`Dockerfile` sem rodar build local.
- **Não** alterar DNS, deploy ou variáveis de produção sem confirmação explícita.

## Pendências conhecidas

- `.github/workflows/deploy.yml` e `pages.yml` publicam o mesmo GitHub Pages — duplicidade a resolver.
- `server/index.js` tem mais de 100 KB: candidato a extração por domínio (votos, auth, contato).