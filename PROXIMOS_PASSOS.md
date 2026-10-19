# Próximos Passos — VotaBrasil / MeuVoto

**Data:** 19 de outubro de 2026
**Status do código:** ✅ 100% funcional, testes passando, 38 páginas varridas sem defeitos.

---

## P0 — Railway: volume persistente do banco de dados

**Problema:** O SQLite está sendo gravado **dentro do container** (`/app/server/data/votos.db`), que é recriado a cada deploy. Isso significa que **todos os dados (votos, sessões, denúncias, push subscriptions) são perdidos** quando o deploy roda.

**Estado atual:**
```toml
# railway.toml
[env]
DB_PATH = "/data/votos.db"
```

Mas o volume **não está montado** em `/data` no painel do Railway.

**Como corrigir (no painel do Railway):**

1. Acesse https://railway.app/ e abra o projeto **VotaBrasil** (backend)
2. Vá em **Volumes** → **New Volume**
3. Mount path: `/data`
4. Size: 1 GB (suficiente para SQLite por anos)
5. Salve
6. Vá em **Variables** → confirme que `DB_PATH = /data/votos.db` está definido
7. **Redeploy** (Deploy → Redeploy)
8. Aguarde 2-3 minutos e valide:
   ```bash
   curl -s https://meu-voto.app/api/health | jq '.storageArquivo'
   ```
   **Resultado esperado:** `"/data/votos.db"` (não `/app/server/data/votos.db`)

**Risco se não fizer:** Próximo deploy apaga todos os dados de votação e sessões ativas.

---

## P1 — Cloudflare: corrigir DNS e e-mail

### 1. SPF duplicado (permerror = sem proteção)

**Estado atual:** Dois registros TXT de SPF no domínio `meu-voto.app`:
- `v=spf1 include:zoho.com ~all`
- `v=spf1 include:zohomail.com ~all`

**Problema:** Múltiplos SPF causam `permerror` no Gmail/Outlook — e-mails caem em spam ou são rejeitados.

**Correção:**

1. Acesse https://dash.cloudflare.com/ → domínio `meu-voto.app` → **DNS**
2. Delete **ambos** os TXT de SPF existentes
3. Crie **um único** TXT:
   ```
   v=spf1 include:zoho.com include:_spf.resend.com ~all
   ```
   *(Se não usar mais Zoho para envio, use apenas `include:_spf.resend.com`)*
4. Salve

### 2. MX inválido (typo)

**Estado atual:** MX registra `mail.meu-voto.ap` (typo de `.app`)

**Correção:**

1. Em **DNS**, localize o MX: `mail.meu-voto.ap` (prioridade 10)
2. Delete esse registro
3. Se for usar Zoho para recebimento, deixe apenas:
   - `mx.zoho.com` (10)
   - `mx2.zoho.com` (20)
   - `mx3.zoho.com` (30)
4. Se usar **apenas Resend** (envio), não precisa de MX — pode deletar todos.

### 3. DMARC (proteção contra spoofing)

**Estado atual:** `v=DMARC1; p=none;` (só monitora, não protege)

**Correção:**

1. Em **DNS**, edite o TXT de DMARC (`_dmarc.meu-voto.app`)
2. Substitua por:
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@meu-voto.app; adkim=r; aspf=r; pct=100
   ```
3. Aguarde 1 hora e teste envio para Gmail/Outlook.

### 4. Proxy Cloudflare (opcional — WAF e cache)

**Estado atual:** Nuvem cinza (DNS only) — sem cache, WAF ou proteção de DDoS.

**Para ativar (nuvem laranja):**

1. SSL/TLS → **Full (strict)** (obrigatório antes de ligar o proxy)
2. Em **DNS**, edite o registro A `meu-voto.app` → ative o proxy (nuvem laranja)
3. Teste:
   ```bash
   curl -sI https://meu-voto.app | grep -i cf-ray
   ```
   **Resultado esperado:** header `cf-ray` presente.
4. Se funcionar, ativar **Cache Rules** e **WAF** gradualmente.

**Risco:** Loop de redirecionamento se a origem forçar HTTPS sem SSL Full (strict).

---

## P2 — GitHub Actions: logs e CI

### Deploy duplicado

**Estado:** `deploy.yml` foi tornado **manual**; `pages.yml` continua automático.

**Validação:**
```bash
gh run list --repo xbrancox/mudabrasilv4 --limit 10
```
Deve mostrar apenas **uma** execução de Pages por push.

### Digest (e-mail semanal)

**Estado:** corrigido (YAML válido, Node 22).

**Pré-requisito:** secrets no repositório:
- `RESEND_API_KEY`
- `DIGEST_SECRET` (opcional)

**Teste:**
```bash
gh workflow run digest.yml --repo xbrancox/mudabrasilv4
```

---

## P2.5 — Sal criptográfico versionado no repositório (requer confirmação)

**Problema:** `server/data/.salt` está **rastreado no Git** (apesar de o `.gitignore`
já listar `server/data/.salt` — o ignore só vale para arquivos *novos*). O Dockerfile
faz `COPY . .`, então o sal vai embutido na imagem e é lido de
`server/votes.js` → `path.join(__dirname, 'data', '.salt')` (caminho **fixo**,
ignora o `DB_PATH` do volume).

**Consequência:** o sal é público no repositório. Ele salta o hash
`generateVoteCode`/`verifyVoteCode` (SHA-256 do código + sal). Quem tiver o sal
consegue forjar um código de 20 dígitos "válido" para o hash — **não** ===
consegue decifrar um código emitido (o hash é de mão única), mas a verificação
de posse perde a propriedade de segredo.

**Por que NÃO foi corrigido agora:** rotacionar o sal invalida **todos os
códigos de 20 dígitos já emitidos** aos usuários. É uma mudança de produção
com impacto em dados de terceiros, e o `AGENTS.md` exige confirmação explícita
antes de alterar variáveis/estado de produção.

**Correção proposta (executar com confirmação):**
1. Mover o sal para o volume: `server/votes.js` deve usar
   `process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : path.join(__dirname, 'data')`
   (igual a `server/db.js` e `server/contato.js` já fazem).
2. Copiar o sal atual para o volume **antes** de trocar o código, para não
   invalidar os códigos já emitidos:
   ```bash
   railway run cp /app/server/data/.salt /data/.salt
   ```
3. Só então rodar `git rm --cached server/data/.salt` (o `.gitignore` já cobre).
4. Em seguida, opcionalmente, rotacionar o sal aceitando invalidar os códigos antigos.

**Nota de auditoria:** `tests/test-render.js` apagava `.salt` no início de cada
execução. Isso foi corrigido em 19/10/2026 — o teste não pode mais rotacionar
o sal por acidente.

---

## P2.6 — Dados pessoais de contato dentro do repositório (requer confirmação)

`server/data/contato_mensagens.json` guarda **nome, e-mail, IP e user-agent** de
quem usa o formulário de contato. Em produção o arquivo real fica no volume
(`DB_PATH` → `/data`), então o banco do GitHub só recebe a cópia de
desenvolvimento — mas ela está **rastreada** e por isso sai no `COPY . .` da
imagem Docker.

**Correção proposta:** `git rm --cached server/data/contato_mensagens.json` +
adicionar ao `.gitignore`. Sem impacto em produção (o volume é quem vale) e
remove nomes/e-mails/IPs do repositório público.

---

## P3 — Limpeza de arquivos (✅ JÁ FEITA)

Arquivos órfãos removidos em 19/10/2026:

| Arquivo removido | Motivo |
|---|---|
| `index-old.html` | Backup da home antiga (332 KB, encoding UTF-16 corrompido). A home atual (`index.html`) tem o layout restaurado com duelo e cards. |
| `pages/candidatos.html` | Redirecionamento morto para `parlamentares.html`. |
| `pages/selos.html` | Redirecionamento morto para `cobrancas-ranking.html`. |
| `data/candidatos-2026.json.bak` | Backup de edição. |

Links atualizados para apontar direto ao destino:
- `pages/links.html`: `candidatos.html` → `parlamentares.html`; `selos.html` → `cobrancas-ranking.html`
- `pages/comunidade.html`, `pages/meu-voto.html`, `pages/proposta.html`: `candidatos.html` → `parlamentares.html`
- `tests/test-render.js`: removida a página `candidatos.html` da lista de teste

**Verificado:** 0 referências quebradas em 289 refs / 38 páginas; 37 páginas varridas em 390px e 1280px sem defeitos.

---

## Checklist rápido

- [ ] **Railway:** volume `/data` montado + `DB_PATH` confirmado + redeploy + `/api/health` valida
- [ ] **Cloudflare:** SPF único, MX inválido removido, DMARC `p=quarantine`
- [ ] **Cloudflare (opcional):** proxy ativado com SSL Full (strict)
- [ ] **GitHub:** `gh run list` mostra 1 deploy por push
- [x] **Limpeza:** `index-old.html`, `candidatos.html`, `selos.html` e `.bak` removidos (19/10/2026)
- [ ] **Sal (P2.5):** mover `server/data/.salt` para o volume `/data` e tirar do Git — exige confirmar antes (invalida códigos já emitidos se rotacionado)
- [ ] **LGPD (P2.6):** tirar `server/data/contato_mensagens.json` do Git (nomes/e-mails/IPs no repositório público)

---

## Contato e suporte

Se precisar de ajuda com algum passo, me avise. Posso:
- Gerar os comandos exatos de CLI (Railway, Cloudflare, GitHub)
- Preparar scripts de migração de dados (se o volume for montado)
- Validar DNS após propagação (`dig`, `nslookup`)

**Nenhum token ou senha deve ser compartilhado por chat.** Use `C:\Users\euler\.secrets\` ou logins interativos (`railway login`, `gh auth login`, `cloudflared login`).