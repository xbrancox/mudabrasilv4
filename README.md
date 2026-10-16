# 🗳️ MeuVoto — Plataforma Cívica

Plataforma cívica de **revogação do voto** com foco em **transparência total**.

## 🎨 Identidade Visual (Nova Logomarca)

A plataforma utiliza a logomarca oficial **MeuVoto** com smartphone azul e check verde ("Meu voto coloca, meu voto tira."):

- **SVG Vetorial:** `icon.svg` (escala perfeita sem perda)
- **PNG Transparente:** `assets/logo/logo-meuvoto.png` (992×616)
- **Ícones Otimizados:**
  - Header: `header-icon-48.png` (desktop) e `header-icon-36.png` (mobile)
  - Footer & App: `footer-icon.png` (48px)
  - Favicon: `favicon-16/32/48.png` + `favicon.ico`
  - PWA: `icon-192.png` e `icon-512.png`
  - Redes Sociais: `og-image.png` (1200×630)

> Todas as variantes de alta resolução foram salvas em `Downloads/MeuVoto_Logos/` para uso em materiais de marketing e imprensa.

---

> ? **Modo duplo de dados:** com o servidor Node rodando, o site exibe a **lista REAL
> de 513 deputados federais** (dados abertos da Cï¿½mara dos Deputados, com fotos) **e o
> Termï¿½metro de Confianï¿½a ao vivo** (votos reais colocados no navegador). Aberto sem
> servidor (ex.: `file://`), cai automaticamente no **modo demo** com dados sintï¿½ticos ï¿½
> sempre funcional, nunca quebra.
>
> ??? **"Meu voto coloca, meu voto tira."** O Termï¿½metro ï¿½ um *termï¿½metro de confianï¿½a*
> ("IBOPE em tempo real"): um ï¿½ndice agregado e anï¿½nimo de apoio contï¿½nuo a cada
> parlamentar. Protï¿½tipo de pesquisa/opiniï¿½o ï¿½ **sem valor legal e sem vï¿½nculo com
> eleiï¿½ï¿½es oficiais**.
>
> ? **Tempo real de verdade:** cada voto, revogaï¿½ï¿½o ou "manter" ï¿½ transmitido aos
> navegadores conectados em milissegundos via **SSE** (`GET /api/stream`), com polling
> como rede de seguranï¿½a. A home exibe um painel **"??? Plataforma ao vivo"** com os
> nï¿½meros reais, atualizando no ar quando alguï¿½m vota em outra aba.
>
> ??? **Produï¿½ï¿½o de verdade:** as urnas vivem num **SQLite nativo do Node**
> (`node:sqlite`, zero dependï¿½ncias de npm), com migraï¿½ï¿½o automï¿½tica de urnas antigas
> em JSON, persistï¿½ncia que sobrevive a reinï¿½cios e atualizaï¿½ï¿½o automï¿½tica dos dados
> pï¿½blicos a cada 24 h.

## ?? Atualizaï¿½ï¿½es ï¿½ 04/09/2026

- **??? Como votou (votaï¿½ï¿½es nominais) na ficha:** deputados federais via sondagem
  das votaï¿½ï¿½es do Plenï¿½rio (`/votacoes/{id}/votos`) com cache de sessï¿½o compartilhado;
  senadores via histï¿½rico completo do Senado (`/senador/{codigo}/votacoes`) ï¿½ 8 mais
  recentes na ficha e histï¿½rico inteiro com "Ver todas" e scroll infinito (blocos de 50).
  Badges: Sim = verde, Nï¿½o = vermelho, presentes/ausï¿½ncias em cinza.
- **?? Proxy `/api/camara/*`:** o CORS da Cï¿½mara ï¿½ instï¿½vel e `/deputados/{id}` nunca
  envia `Access-Control-Allow-Origin` ï¿½ com backend ativo, todas as chamadas da Cï¿½mara
  vï¿½o same-origin pelo proxy. Em hosts estï¿½ticos (GitHub Pages), o frontend usa o
  Railway como proxy automaticamente.
- **?? Verificaï¿½ï¿½o de polï¿½ticos ponta a ponta:** `solicitar` envia `politicianId`,
  `confirmar` checa `data.ok`, o selo grava no SQLite e passa a aparecer no
  `/api/candidatos`; o link do e-mail redireciona para a home com toast. Domï¿½nios
  autorizados: `@camara.leg.br`, `@senado.leg.br`, `@senador.leg.br`, `@tse.jus.br`.
- **?? Bateria de testes verde:** `test-engine` 25/25 (migraï¿½ï¿½o, carga 10k, SSE,
  persistï¿½ncia, fallback JSON), `test-thermometer` 21/21 (voto ? cï¿½digo ? revogaï¿½ï¿½o),
  `test-live` 4/4 (SSE entre pï¿½ginas), `test-render` 6 pï¿½ginas sem erros.
  Novos: `tests/e2e-votos-ficha.js`, `tests/e2e-pages.js`, `tests/e2e-verificacao.js`.
- **?? Correï¿½ï¿½es:** ids de senadores sem prefixo duplicado (`senado-senado-*`),
  `idDeputadoAutor` (parï¿½metro correto das proposiï¿½ï¿½es), mï¿½tricas sintï¿½ticas removidas
  da ficha (sï¿½ dados reais), `config.js` em mesma origem quando servido pelo backend,
  consent-note/trendChart restabelecidos no meu-voto.html.

---

## ?? Como Executar

**Opï¿½ï¿½o 1 ï¿½ Com dados REAIS (recomendado):**
```bash
node server/index.js
# ? http://localhost:8080
```
Um ï¿½nico comando sobe o site inteiro **e** a API de dados pï¿½blicos.
Requer Node.js 18+ (usa o `fetch` global). **Sem `npm install`** ï¿½ zero dependï¿½ncias.
Com **Node 22.5+** (recomendado), as urnas usam **SQLite nativo** (`node:sqlite`);
em Node mais antigo o servidor cai sozinho no **arquivo JSON atï¿½mico** ï¿½ mesmo
comportamento, outro backend (dï¿½ para forï¿½ar com `MB_STORAGE=json|sqlite`).

**Opï¿½ï¿½o 2 ï¿½ Aberto direto (modo demo):**
```
Dï¿½ um duplo clique em index.html
```
Sem servidor, a API nï¿½o responde e o site usa os 6 candidatos sintï¿½ticos de exemplo.

**Opï¿½ï¿½o 3 ï¿½ Servidor estï¿½tico (modo demo):**
```bash
python -m http.server 8000     # ou: npx serve .
```

> ?? Para **atualizar** os dados reais em cache: `GET /api/candidatos?refresh=1`
> (ou `node -e "require('./server/ingest').fetchDeputados({force:true}).then(r=>console.log(r.count))"`).

---

## ?? Estrutura do Projeto

```
votaBrasil-redesign/
+-- index.html                 # Home ï¿½ hero, painel "Plataforma ao vivo" (dados reais em tempo real), navegaï¿½ï¿½o
+-- css/
ï¿½   +-- design-system.css      # Sistema de design (tokens, componentes, animaï¿½ï¿½es)
+-- js/
ï¿½   +-- candidate-data.js      # Dados DEMO sintï¿½ticos + helpers (formato, integridade)
ï¿½   +-- candidates.js          # Pï¿½gina Candidatos (dual-mode: reais via API ? demo)
ï¿½   +-- thermometer.js         # ??? Termï¿½metro (votar/ver/revogar/manter + ï¿½ndice ao vivo)
ï¿½   +-- live-stream.js         # ? Cliente SSE (window.MBLive): canal principal + polling de seguranï¿½a
ï¿½   +-- shared-ui.js           # UI compartilhada (menu mobile, login, scroll-reveal)
+-- server/                    # ?? Backend (Node.js puro, sem dependï¿½ncias)
ï¿½   +-- index.js               # Servidor: estï¿½ticos + API /api/* + SSE /api/stream + cron de atualizaï¿½ï¿½o
ï¿½   +-- ingest.js              # Ingestï¿½o + cache dos dados reais (Cï¿½mara)
ï¿½   +-- votes.js               # ??? Engine de voto (anonimato, decaimento, revogaï¿½ï¿½o, hook de mudanï¿½a)
ï¿½   +-- db.js                  # ??? Armazenamento das urnas: SQLite nativo (node:sqlite) + fallback JSON
ï¿½   +-- data/
ï¿½       +-- deputados.json     # Cache em disco dos 513 deputados reais
ï¿½       +-- votos.db           # ??? Urnas anï¿½nimas em SQLite (hash do cï¿½digo ï¿½ nunca o cï¿½digo)
ï¿½       +-- votos.json         # Urnas no fallback JSON / legado (migrado para o .db na 1ï¿½ execuï¿½ï¿½o)
ï¿½       +-- .salt              # Sal criptogrï¿½fico do ambiente (gerado na 1ï¿½ execuï¿½ï¿½o)
+-- pages/
ï¿½   +-- candidatos.html        # ? Comparaï¿½ï¿½o de candidatos (dados reais)
ï¿½   +-- termometro.html        # ??? Revogaï¿½ï¿½o do voto + ï¿½ndice de confianï¿½a ao vivo
ï¿½   +-- proposta.html          # Manifesto editï¿½vel da proposta
ï¿½   +-- status.html            # Painel ao vivo: mï¿½tricas reais do termï¿½metro (SSE + fallback demo)
ï¿½   +-- revogar.html           # Fluxo de revogaï¿½ï¿½o com assinaturas e debate
ï¿½   +-- comunidade.html        # Contribuidores e estatï¿½sticas
+-- tests/                     # Testes automatizados + screenshots
    +-- test-engine.js         # ?? Motor em Node puro: decaimento, migraï¿½ï¿½o JSON?SQLite, carga 10k, SSE, persistï¿½ncia pï¿½s-restart, fallback JSON (25 checks)
    +-- test-live.js           # ?? Playwright: tempo real entre pï¿½ginas + fallback demo (13 checks)
    +-- test-thermometer.js    # ?? Playwright: termï¿½metro completo ï¿½ ciclo votar/ver/revogar (19 checks)
    +-- test-render.js         # ?? Playwright: renderizaï¿½ï¿½o das pï¿½ginas (modo real + demo)
    +-- screenshots/           # Evidï¿½ncias visuais de cada fase
```

---

## ?? Design System

Todo o visual ï¿½ controlado por **design tokens** em `css/design-system.css`:

- **Paleta cï¿½vica tecnolï¿½gica**: azul-marinho (`#0A2E5D`), azul primï¿½rio (`#115FCB`) e dourado (`#FFD700`)
- **Gradientes** em logo, botï¿½es, barras e cï¿½rculo de assinatura
- **Textura** sutil de grid no fundo (efeito tecnolï¿½gico)
- **Animaï¿½ï¿½es**: fade-in, scroll-reveal, pulso em aï¿½ï¿½es, shimmer em barras, contadores animados
- **Responsivo**: sidebar vira menu hambï¿½rguer em telas pequenas
- **Acessibilidade**: alto contraste, navegaï¿½ï¿½o por teclado, foco visï¿½vel

---

## ??? Mï¿½dulo de Candidatos (destaque)

A pï¿½gina `pages/candidatos.html` ï¿½ o grande diferencial: **ajuda o eleitor a decidir**
comparando candidatos com base em **dados pï¿½blicos oficiais**.

### Modo duplo (automï¿½tico)

| | ?? **Modo Real** (com `node server/index.js`) | ?? **Modo Demo** (sem servidor) |
|---|---|---|
| **Fonte** | API aberta da Cï¿½mara dos Deputados | Dados sintï¿½ticos embutidos |
| **Quantidade** | 513 deputados federais atuais | 6 candidatos de exemplo |
| **Fotos** | Fotos oficiais reais (lazy-load) | Avatares com iniciais |
| **Dados** | Nome, partido, estado, cargo, e-mail, foto | Perfil completo (exemplo) |
| **Selo** | "?? Dados reais ï¿½ Cï¿½mara dos Deputados" | "?? Modo demo ï¿½ dados sintï¿½ticos" |

O frontend tenta `fetch('/api/candidatos')`; se responder com dados reais, usa-os;
caso contrï¿½rio, mantï¿½m o modo demo. **O usuï¿½rio nunca vï¿½ uma pï¿½gina quebrada.**

### Recursos

| Recurso | Descriï¿½ï¿½o |
|---------|-----------|
| ?? **Busca** | Por nome, partido, estado ou ï¿½rea de atuaï¿½ï¿½o |
| ??? **Filtros** | Por estado e partido (e cargo, no modo demo) |
| ?? **Ordenaï¿½ï¿½o** | Ajustada ao modo (nome/partido/estado no real; transparï¿½ncia/votos/processos no demo) |
| ?? **Comparaï¿½ï¿½o** | Atï¿½ 3 candidatos lado a lado, com ? no melhor valor |
| ?? **Detalhes** | Perfil com foto e tabela Indicador/Valor/Fonte |

### ï¿½ndice de Integridade

Quando os dados completos existem (modo demo / enriquecido em produï¿½ï¿½o), cada candidato
recebe um **ï¿½ndice de integridade (0ï¿½100)**:

```
score = transparï¿½ncia
      - (processos judiciais ï¿½ 4)
      - (condenaï¿½ï¿½es ï¿½ 10)
      + ((presenï¿½a - 80) ï¿½ 0.5)
```

No modo real bï¿½sico, o ï¿½ndice aparece apenas quando os dados necessï¿½rios estï¿½o disponï¿½veis.

---

## ??? Termï¿½metro de Confianï¿½a ï¿½ Revogaï¿½ï¿½o do Voto

`pages/termometro.html` ï¿½ o coraï¿½ï¿½o da plataforma: o eleitor **coloca** seu apoio a um
parlamentar, acompanha um **ï¿½ndice de confianï¿½a ao vivo** e pode **tirar** (revogar) ou
**manter** (reafirmar) o voto a qualquer momento. "Meu voto coloca, meu voto tira."

### Como funciona

| Aï¿½ï¿½o | O que acontece |
|------|----------------|
| ??? **Colocar** | Escolhe um parlamentar (busca nos 513 reais) e recebe um **cï¿½digo de voto** (ex.: `A3F9-K2MN-P7Q1-X4TR`) |
| ?? **Ver** | Digita o cï¿½digo e vï¿½ o status do voto ï¿½ **o nome do candidato aparece mascarado por padrï¿½o** (anti-coerï¿½ï¿½o / anti-impressï¿½o) |
| ?? **Manter** | Reafirma o voto e **reinicia o relï¿½gio** do decaimento |
| ? **Tirar (revogar)** | O voto deixa de contar imediatamente ï¿½ e fica visï¿½vel no total de revogaï¿½ï¿½es (transparï¿½ncia) |

### Anonimato (regra inegociï¿½vel ï¿½ LGPD / anti-coerï¿½ï¿½o)

- O servidor **nunca armazena o cï¿½digo bruto**: guarda apenas
  `sha256(cï¿½digo + SALT)` ï¿½ o cï¿½digo nï¿½o ï¿½ recuperï¿½vel, nem por nï¿½s.
- O voto **nï¿½o se vincula a conta, IP ou dispositivo**: quem revoga/prova ï¿½ sï¿½ quem tem
  o cï¿½digo; o site nï¿½o prova que *vocï¿½* votou em alguï¿½m.
- A agregaï¿½ï¿½o (`/api/termometro`) ï¿½ **irreversï¿½vel**: nï¿½o existe rota que mapeie
  eleitor ? candidato.
- **UI nunca revela o candidato votado por padrï¿½o** (nome mascarado com `ï¿½`); hï¿½ um
  botï¿½o "Mostrar" apenas para o prï¿½prio portador do cï¿½digo.
- Sem cadastro, sem e-mail, sem tracking ï¿½ voto = um cï¿½digo que sï¿½ o eleitor conhece.

### Decaimento do voto ("voto nunca morre, sï¿½ esfria")

O peso de cada voto decai com o tempo para refletir **apoio ativo**, nï¿½o inï¿½rcia:

| Idade do voto | Peso |
|---------------|------|
| 0ï¿½90 dias | **1,0** (peso cheio) |
| 90ï¿½180 dias | decaimento linear (1,0 ? 0,5) |
| 180+ dias | **0,5** (piso ï¿½ o voto nunca zera sozinho) |

"Manter meu voto" reinicia a contagem de 90 dias. A UI avisa quando o voto tem
mais de 30 dias sem reafirmaï¿½ï¿½o.

### ï¿½ndice de confianï¿½a (ao vivo)

```
pesoEfetivo(politico) = S peso(voto ativo)          # com decaimento por idade
indice = 100 ï¿½ pesoEfetivo / (pesoEfetivo + 100)    # curva de saturaï¿½ï¿½o (K = 100)
```

A saturaï¿½ï¿½o evita que um ï¿½nico polï¿½tico domine a escala por volume puro ï¿½ o ï¿½ndice
mede **intensidade de apoio ativo**, e a pï¿½gina mostra sempre os nï¿½meros crus ao lado
(votos ativos, revogaï¿½ï¿½es, peso efetivo) para nada ficar oculto.

> **ICM v1.0 (ï¿½ndice de Confianï¿½a VotaBrasil)**: em produï¿½ï¿½o,
> `ICM = 0.40ï¿½resposta + 0.35ï¿½cumprimento + 0.25ï¿½(1 - devoluï¿½ï¿½es usadas)`.
> Este protï¿½tipo implementa a **componente de confianï¿½a** (o ï¿½ndice acima); as demais
> componentes virï¿½o com as fontes de dados de produï¿½ï¿½o (TSE/Transparï¿½ncia/CNJ).

### Proteï¿½ï¿½o, persistï¿½ncia e operaï¿½ï¿½o

- **Anti-brigada**: rate-limit por IP (20 aï¿½ï¿½es/min) no motor de voto.
- **??? Armazenamento** (`server/db.js`): urnas num **SQLite nativo do Node**
  (`node:sqlite`, Node 22.5+) ï¿½ um ï¿½nico arquivo `server/data/votos.db`, transaï¿½ï¿½es
  atï¿½micas, ï¿½ndice por parlamentar. Em Node mais antigo, fallback automï¿½tico para o
  **arquivo JSON atï¿½mico** (tmp + rename); `MB_STORAGE=json|sqlite` forï¿½a o backend.
- **Migraï¿½ï¿½o automï¿½tica**: urnas legadas em `votos.json` sï¿½o importadas para o SQLite
  na primeira inicializaï¿½ï¿½o (o JSON fica como backup histï¿½rico).
- **Durabilidade**: o voto **sobrevive a reinï¿½cios do servidor** (coberto por teste).
- **Atualizaï¿½ï¿½o automï¿½tica**: os dados pï¿½blicos (513 deputados) sï¿½o rebuscados a cada
  24 h por um cron no prï¿½prio processo (`MB_REFRESH_HOURS` ajusta o intervalo).
- **Modo demo**: sem servidor, a pï¿½gina exibe 5 linhas sintï¿½ticas e desabilita a busca ï¿½
  o selo no topo indica sempre a fonte (?? real / ?? demo).

### Painel ao vivo (`pages/status.html`)

O Status lï¿½ `/api/termometro` em tempo real (SSE como canal principal + polling de
15 s de seguranï¿½a): votos ativos, revogados, participantes, top do ï¿½ndice, tendï¿½ncia
de 30 dias e ranking. Sem servidor, cai no modo demo ï¿½ nunca quebra.

### ? Tempo real (SSE)

Cada escrita na urna dispara um hook no motor (`votes.js`), que o servidor traduz em
um **Server-Sent Events** na rota `GET /api/stream`:

```
retry: 10000

event: welcome
data: {"ok":true,"ts":"2026-08-19Tï¿½","totalVotosAtivos":123,"totalRevogados":4}

event: termometro
data: {"tipo":"voto","ts":"2026-08-19Tï¿½","totalVotosAtivos":124,"totalRevogados":4}
```

- `tipo` ï¿½ `voto` | `revogacao` | `manutencao`; o heartbeat `:hb` vai a cada 30 s.
- **O payload sï¿½ carrega totais agregados** ï¿½ nenhum dado individual passa pelo canal
  (mesma regra de anonimato da API: o evento nï¿½o revela quem votou em quem).
- O cliente (`js/live-stream.js`, exposto como `window.MBLive`) usa o SSE como canal
  principal e mantï¿½m **polling de 15 s como rede de seguranï¿½a**: ao receber um evento,
  pausa o polling; apï¿½s 3 falhas do SSE, encerra a conexï¿½o e o polling assume sozinho.
  Sem servidor (`file://`/demo), o SSE nem chega a iniciar ï¿½ o fallback ï¿½ transparente.
- A home exibe os nï¿½meros reais num painel **"??? Plataforma ao vivo"** (votos ativos,
  revogados, participaï¿½ï¿½es e o 1ï¿½ lugar do ï¿½ndice), atualizando no ar quando alguï¿½m
  vota em qualquer outra aba do navegador ï¿½ comprovado em teste E2E (aba da home
  reage a voto feito na aba do termï¿½metro, sem reload).

---

## ?? Integraï¿½ï¿½o com Dados Pï¿½blicos (backend)

O backend (`server/`) jï¿½ estï¿½ **conectado a uma fonte pï¿½blica real**:

- **Cï¿½mara dos Deputados ï¿½ Dados Abertos** ? **INTEGRADO**
  `https://dadosabertos.camara.leg.br/api/v2/deputados`
  ? 513 deputados federais atuais (nome, partido, UF, foto, e-mail), com cache em disco.
- Enriquecimento sob demanda (`/api/candidatos/:id`) tenta o nï¿½ de proposiï¿½ï¿½es por autor.

### Fontes de produï¿½ï¿½o (documentadas para a prï¿½xima etapa)

| Fonte | Dados | Endpoint / URL | Status daqui |
|-------|-------|----------------|--------------|
| **Cï¿½mara dos Deputados** | Deputados, proposituras, presenï¿½a | `dadosabertos.camara.leg.br` | ? **Integrado** |
| **TSE ï¿½ DivulgaDados** | Candidaturas, votos, condenaï¿½ï¿½es, histï¿½rico | `dadosabertos.tse.jus.br` | ? Produï¿½ï¿½o (HTTP 403 neste ambiente) |
| **Portal da Transparï¿½ncia** | Rendimentos, patrimï¿½nio, gastos | `dadosabertos.portaltransparencia.gov.br` | ? Produï¿½ï¿½o (inacessï¿½vel neste ambiente) |
| **Senado Federal** | Senadores, proposituras, votaï¿½ï¿½es | `legis.senado.leg.br` | ? Produï¿½ï¿½o |
| **CNJ** | Processos judiciais, aï¿½ï¿½es | `consultaprocessos.cnj.jus.br` | ? Produï¿½ï¿½o (anti-robï¿½) |

> Em produï¿½ï¿½o, o `server/ingest.js` ganharia mais fontes (TSE, Transparï¿½ncia, CNJ,
> Senado) mescladas por parlamentar, completando transparï¿½ncia, patrimï¿½nio e histï¿½rico
> judicial. O schema jï¿½ estï¿½ pronto para receber esses campos (hoje `null`).

---

## ?? API do Backend

| Rota | Descriï¿½ï¿½o |
|------|-----------|
| `GET /api/candidatos` | Lista de candidatos reais. Query: `?busca=&uf=&partido=&ordem=nome:asc&refresh=1` |
| `GET /api/candidatos/:id` | Detalhe de um candidato + enriquecimento sob demanda |
| `GET /api/status` | Metadados da fonte (origem, aviso) |
| `GET /api/termometro` | ??? ï¿½ndice de confianï¿½a ao vivo: `topN` (ranking por ï¿½ndice), `tendencia` (30 dias), `porUf`, totais |
| `POST /api/voto` | ??? Coloca um voto. Body: `{politicianId, uf?}` ? `{ok, code, ballotId}` |
| `GET /api/voto?code=` | ??? Consulta o status do voto pelo cï¿½digo (nome mascarado, peso atual, dias, `precisaReafirmar`) |
| `POST /api/voto/revogar` | ??? Tira o voto (revoga). Body: `{code}` |
| `POST /api/voto/manter` | ??? Mantï¿½m o voto (reafirma ï¿½ reinicia o relï¿½gio do decaimento). Body: `{code}` |
| `GET /api/stream` | ? SSE ï¿½ eventos em tempo real: `welcome` (totais ao conectar), `termometro` (voto/revogacao/manutencao, sï¿½ totais), heartbeat `:hb` a cada 30 s |

Resposta de `/api/candidatos`:
```json
{ "mode":"real", "source":"Cï¿½mara dos Deputados (dados reais)",
  "total":513, "retornados":513, "doCache":true,
  "atualizadoEm":"2026-08-19T00:59:31.383Z",
  "candidatos":[ { "id":"camara-204379", "name":"Acï¿½cio Favacho",
    "party":"MDB", "state":"AP", "position":"Deputado Federal",
    "photo":"https://www.camara.leg.br/...", "email":"dep.acaciofavacho@camara.leg.br" } ] }
```

Resposta de `POST /api/voto` (colocar):
```json
{ "ok": true, "code": "A3F9-K2MN-P7Q1-X4TR", "ballotId": "a1b2c3ï¿½",
  "politician": { "id":"camara-204379", "name":"Acï¿½cio Favacho" } }
```

Resposta de `GET /api/voto?code=ï¿½` (o nome sï¿½ ï¿½ retornado jï¿½ mascarado):
```json
{ "ok": true,
  "ballot": { "politicianId":"camara-204379", "uf":"AP",
    "createdAt":"2026-08-19Tï¿½", "reaffirmedAt":"2026-08-19Tï¿½",
    "revoked": false, "pesoAtual":1.0, "diasDesdeReafirmacao":0,
    "precisaReafirmar": false } }
```

Resposta de `GET /api/termometro` (agregado irreversï¿½vel ï¿½ nunca revela quem votou em quem):
```json
{ "mode":"real", "ok": true,
  "metodo":"ï¿½ndice de Confianï¿½a VotaBrasil (ICM) ï¿½ componente de confianï¿½a",
  "icm": { "versao":"v1.0", "pesos": { "resposta":0.40, "cumprimento":0.35, "devolucao":0.25 } },
  "decadencia": { "cheioDias":90, "pisoDias":180, "piso":0.5 },
  "totalVotosAtivos":123, "totalRevogados":4, "totalRegistros":127,
  "topN":[ { "politicianId":"camara-204379", "name":"Acï¿½cio Favacho", "party":"MDB",
             "state":"AP", "photo":"https://www.camara.leg.br/...",
             "votosAtivos":40, "revogacoes":1, "pesoEfetivo":39.2, "indice":27.3 } ],
  "porIndice":[ "ï¿½ranking completo, do 1ï¿½ ao ï¿½ltimoï¿½" ],
  "tendencia":[ { "at":"2026-08-19", "ativos":123 } ],
  "porUf": { "AP": 40 } }
```

Evento SSE de `GET /api/stream` (apï¿½s um voto ser colocado):
```
event: termometro
data: {"tipo":"voto","ts":"2026-08-19T12:00:00.000Z","totalVotosAtivos":124,"totalRevogados":4}
```

---

## ??? Arquitetura de Infraestrutura

### Backend (Railway)
- **Projeto**: VotaBrasil (`198baa4d-6141-418c-96dd-d7826831249f`)
- **Serviï¿½o**: VotaBrasil (`4d5f569d-9c54-45f5-a25a-b474fb218b18`)
- **Domï¿½nio atual**: `https://meu-voto.app`
- **Regiï¿½o**: Amsterdam (ams)
- **Builder**: RAILPACK (Node 22)
- **Storage**: SQLite nativo (`node:sqlite`) em `/app/server/data/votos.db`
- **Volume**: 500MB persistente

### Frontend (GitHub Pages)
- **Repositï¿½rio**: `xbrancox/votabrasil`
- **Branch**: `main`
- **Workflow**: `.github/workflows/pages.yml`
- **URL**: `https://meu-voto.app/`

### Plano de Migraï¿½ï¿½o de Domï¿½nio
1. **Registrar domï¿½nio**: `omeuvoto.app` (pendente)
2. **Configurar DNS**: CNAME apontando para Railway
3. **Adicionar domï¿½nio custom no Railway**: `railway domain omeuvoto.app`
4. **Atualizar `API_BASE`** em todos os arquivos para `https://api.omeuvoto.app`
5. **Configurar SSL**: Automï¿½tico pelo Railway (Let's Encrypt)

---

## ?? Aviso Legal

- No **modo real**, os nomes, partidos, estados e fotos sï¿½o **dados reais** de
  deputados federais, obtidos dos dados abertos pï¿½blicos da Cï¿½mara dos Deputados.
- No **modo demo**, os candidatos e seus valores (finanï¿½as, processos, votos) sï¿½o
  **fictï¿½cios/sintï¿½ticos**, apenas para demonstrar a arquitetura completa.
- O **Termï¿½metro ï¿½ um protï¿½tipo de pesquisa/opiniï¿½o** ("IBOPE em tempo real"):
  **nï¿½o tem valor legal, nï¿½o ï¿½ urna oficial e nï¿½o vincula a eleiï¿½ï¿½es**. Os votos sï¿½o
  uma manifestaï¿½ï¿½o anï¿½nima de opiniï¿½o que qualquer pessoa pode colocar e revogar.
- A plataforma **nï¿½o solicita voto, nï¿½o promove candidatos e nï¿½o faz campanha** ï¿½
  monitoramento neutro (regra inegociï¿½vel). Nï¿½o constitui recomendaï¿½ï¿½o de voto.
- **Privacidade (LGPD)**: sem cadastro, sem e-mail, sem vinculaï¿½ï¿½o de voto ï¿½ pessoa.
  O servidor guarda apenas o hash do cï¿½digo; a agregaï¿½ï¿½o pï¿½blica ï¿½ irreversï¿½vel.

---

## ??? Prï¿½ximos Passos

1. **ICM completo**: conectar as componentes de **resposta** e **cumprimento**
   (radar de resposta, histï¿½rico de proposiï¿½ï¿½es) para compor o
   `ICM = 0.40ï¿½resposta + 0.35ï¿½cumprimento + 0.25ï¿½(1 - devoluï¿½ï¿½es)`.
2. **Mais fontes reais** no `ingest.js`: TSE (candidaturas/votos), Portal da Transparï¿½ncia
   (patrimï¿½nio/renda), CNJ (processos), Senado (senadores no termï¿½metro) ï¿½ mescladas
   por parlamentar.
3. **Autenticaï¿½ï¿½o real (opcional)** para funcionalidades de conta ï¿½ o voto em si
   permanece anï¿½nimo por cï¿½digo, sem conta obrigatï¿½ria.

> ? **Fase 5 ï¿½ "Produï¿½ï¿½o" (2026-08-19):** urnas em **SQLite nativo** (zero
> dependï¿½ncias) com migraï¿½ï¿½o automï¿½tica do JSON legado, persistï¿½ncia que sobrevive a
> reinï¿½cios, fallback JSON automï¿½tico em Node antigo (`MB_STORAGE`) e atualizaï¿½ï¿½o
> automï¿½tica dos dados pï¿½blicos (cron de 24 h, `MB_REFRESH_HOURS`).
>
> ? **Fase 4 ï¿½ "Plataforma Viva" (2026-08-19):** tempo real via SSE
> (`GET /api/stream`, ~7 ms do voto ao navegador), painel "Plataforma ao vivo" na
> home com dados reais, e suï¿½te de testes do motor (decaimento exato, carga de 10.000
> votos, latï¿½ncia SSE).
>
> ? **Fase 6 ï¿½ "Conclusï¿½o" (2026-08-20):**
> - **Integraï¿½ï¿½o Senado Federal**: nova rota `/api/senadores` + merge na `/api/candidatos`
>   (513 deputados + 81 senadores = 594 candidatos totais). Fonte:
>   `legis.senado.leg.br/dadosabertos` (JSON/XML com fallback gracioso se WAF bloquear).
> - **Health check**: `GET /api/health` ï¿½ uptime, backend de armazenamento (SQLite/JSON),
>   totais de votos ativos/revogados, status do cron de atualizaï¿½ï¿½o.
> - **Encerramento gracioso**: handlers para `SIGINT`/`SIGTERM` fecham o banco SQLite
>   ordenadamente antes de sair (nenhuma urna perdida, nenhum arquivo corrompido).
> - **Headers de privacidade/seguranï¿½a** em todas as respostas JSON:
>   `X-Content-Type-Options: nosniff` + `Referrer-Policy: no-referrer`.
> - **Testes validados**: 25/25 (engine) + 19/19 (thermometer) + 13/13 (live) + render
>   = **70 checks passando** (Node puro + Playwright E2E + SSE real + persistï¿½ncia pï¿½s-restart).
> - **Repositï¿½rio**: https://github.com/xbrancox/VotaBrasil

---

Feito com ???? para a transparï¿½ncia cï¿½vica brasileira.

---

## ??? Nova Aba "Parlamentares" (v2.1)

A pï¿½gina **/pages/parlamentares.html** unifica tudo: **Candidatos + Radar Polï¿½tico + Rankings**.

### ? Funcionalidades
- **594 parlamentares** (513 deputados + 81 senadores) com dados reais
- **?? Busca avanï¿½ada** com filtros: estado, partido, cargo, verificados
- **??? Radar Cï¿½vico**: feed ao vivo de reclamaï¿½ï¿½es, apoios e respostas
- **?? Rankings**: mais reclamados, mais apoiados, melhor avaliados, mais respondem
- **?? Selo de verificaï¿½ï¿½o**: somente polï¿½ticos verificados respondem
- **?? Login via Google OAuth ou Telefone (SMS OTP)** ï¿½ sem Gov.br
- **?? Reclamaï¿½ï¿½es + Apoios + Respostas** com moderaï¿½ï¿½o IA + humana
- **Sem limite** de reclamaï¿½ï¿½es/apoios por eleitor (identificado por hash)
- **Sem prazo** para resposta (vai para estatï¿½sticas/grï¿½ficos)
- **?? Links oficiais** para Cï¿½mara, Senado, TSE, Portal da Transparï¿½ncia

### ?? Domï¿½nios autorizados para verificaï¿½ï¿½o
- `@camara.leg.br` (deputados)
- `@senado.leg.br` / `@senador.leg.br` (senadores)
- `@tse.jus.br` (Tribunal Superior Eleitoral)

### ??? Arquivos novos
- `server/auth.js` ï¿½ login Google + telefone (SMS OTP)
- `server/verificacao.js` ï¿½ selo via domï¿½nio de e-mail
- `server/reclamacoes.js` ï¿½ reclamaï¿½ï¿½es, apoios, respostas, rankings
- `pages/parlamentares.html` ï¿½ aba unificada
- `js/parlamentares.js` + `js/parlamentar-auth.js` ï¿½ lï¿½gica
- `css/parlamentares.css` ï¿½ design com cores, fontes e animaï¿½ï¿½es premium

### ?? Endpoints novos
```
POST /api/auth/{google,otp/send,otp/verify}        Login
GET  /api/auth/me                                  Sessï¿½o atual
POST /api/auth/logout                              Sair

POST /api/verificacao/iniciar                      Iniciar verificaï¿½ï¿½o
GET  /api/verificacao/confirmar?token=...          Confirmar
GET  /api/verificacao/dominios                     Domï¿½nios autorizados
GET  /api/verificacao/stats                        Estatï¿½sticas
GET  /api/verificacao/politico/:id                 Status de um polï¿½tico

POST /api/reclamacoes                              Criar reclamaï¿½ï¿½o
GET  /api/reclamacoes?politicianId=...             Listar
POST /api/apoios                                   Criar apoio
GET  /api/apoios?politicianId=...                  Listar
POST /api/respostas                                Resposta (sï¿½ verificado)
GET  /api/rankings                                 Rankings pï¿½blicos
GET  /api/estatisticas/politico/:id                Stats detalhadas
```

### ?? Fluxo de teste (modo dev)
```bash
node server/index.js
# ? http://localhost:8080/pages/parlamentares.html
# 1. Login: "google:seu@email.com:Seu Nome"
# 2. Abrir qualquer parlamentar
# 3. Reclamar / Apoiar (com sessï¿½o ativa)
# 4. Verificar: e-mail institucional com domï¿½nio autorizado
```

### ?? Deploy (setembro/2026)
- **Front:** GitHub Pages ï¿½ automï¿½tico a cada push na `main` (workflow `pages.yml`).
- **Backend:** Railway ï¿½ automï¿½tico a cada push na `main` (Source repo conectado,
  auto-deploy ON). Manual, se um dia precisar: `railway up --service votabrasil-redesign`.
- **Manutenï¿½ï¿½o automï¿½tica** (workflow `manutencao.yml`): snapshot de notï¿½cias
  diï¿½rio (09:15), backup do SQLite diï¿½rio (09:45, artifact 14 dias), candidaturas
  TSE diï¿½rias (10:05), enriquecimento de produï¿½ï¿½o/presenï¿½a semanal (seg 10:30).
  Executar manualmente: aba Actions ? "Manutenï¿½ï¿½o automï¿½tica" ? Run workflow.
- **Dados de candidatos 2026:** `node scripts/baixar-candidatos-tse.js`
  (regenera `data/candidatos-2026.json` a partir dos CSVs oficiais do TSE
  via espelho diï¿½rio `leofn/tse-candidatos-2026`).

---

## ð§ª Testes & Qualidade

### Executar testes

```bash
# Smoke test (verifica mÃ³dulos, DB, denÃºncias, cÃ³digos de voto)
npm test

# Testes unitÃ¡rios (13 testes â db.js, ballots, denÃºncias, politicos, vote_codes)
npm run test:unit

# Testes de integraÃ§Ã£o (11 testes â health, candidatos TSE, denÃºncias, backup)
# Setup automÃ¡tico: o teste inicia o servidor (spawn), aguarda healthcheck via polling
# e o encerra com SIGTERM ao final. NÃ£o Ã© necessÃ¡rio rodar o server manualmente.
npm run test:integration

# Health check (verifica server, DB, cache, backup)
npm run health:check
```

**Resultados atuais:**
| SuÃ­te | Testes | Status |
|-------|--------|--------|
| Smoke test | 9 | â Passando |
| UnitÃ¡rios | 13 | â Passando |
| IntegraÃ§Ã£o | 11 | â Passando |

### Logs persistentes (server/logger.js)
O backend usa um logger own-built (`server/logger.js`) que escreve em stdout (sempre) e, quando habilitado, em arquivo JSONL em `server/data/logs/app.log`. Isso permite rastrear falhas de requisiÃ§Ã£o sem depender de testes manuais.

**VariÃ¡veis de ambiente:**
| VariÃ¡vel | Valor | DescriÃ§Ã£o |
|----------|-------|-----------|
| `LOG_FILE` | `1` ou `true` | Habilita escrita em arquivo (desligado em desenvolvimento) |
| `LOG_LEVEL` | `debug` / `info` / `warn` / `error` | Filtro de nÃ­veis (padrÃ£o: `info`) |
| `LOG_DIR` | caminho | Diretorio dos logs (padrÃ£o: `server/data/logs`) |
| `LOG_MAX_SIZE` | bytes | Tamanho mÃ¡ximo do arquivo antes de rotacionar (padrÃ£o: 10 MB) |
| `LOG_MAX_FILES` | inteiro | NÃºmero mÃ¡ximo de arquivos retidos na rotaÃ§Ã£o (padrÃ£o: 5) |

**RotaÃ§Ã£o:** quando o arquivo atingir `LOG_MAX_SIZE`, o logger rotaciona automaticamente (app.log â app.log.1 â app.log.2 â¦), mantendo os `LOG_MAX_FILES` mais recentes e deletando os mais antigos. NÃ£o hÃ¡ perda de dados nÃ£o escritos.

**Exemplo de uso em produÃ§Ã£o (Railway):**
```toml
[env]
LOG_FILE = "1"
LOG_LEVEL = "info"
LOG_MAX_SIZE = "10485760"
LOG_MAX_FILES = "5"
```

**Exemplo de entrada de log (JSONL):**
```jsonl
{"ts":"2026-10-16T20:48:00.123Z","level":"error","msg":"requisiÃ§Ã£o falha","meta":{"method":"POST","path":"/api/voto","status":500,"error":"SQLite indisponÃ­vel","ip":"127.0.0.1","ms":42}}
```

**Endpoints de observabilidade:**
- `GET /api/health` â saÃºde do serviÃ§o (uptime, storage, totais, stats do log, endpoint de mÃ©tricas). Configurado como healthcheck no Railway (`railway.toml`) e no Cloudflare.
- `GET /api/metrics` â mÃ©tricas no formato **Prometheus text/plain** (sem dependÃªncias externas). Inclui:
  - `http_requests_total` (counter por mÃ©todo, path, status)
  - `http_request_duration_ms` (histogram por path e mÃ©todo)
  - `node_memory_heap_used`, `node_memory_rss`, `node_uptime_seconds`, etc.
- `GET /api/admin/backup` â dump JSON de todas as tabelas (protegido por `BACKUP_TOKEN`).

### Testes de seguranÃ§a
```bash
# Verificar headers de seguranÃ§a
curl -sS -D - -o /dev/null http://localhost:8080/api/health | grep -iE "(x-content|x-frame|strict|content-security)"

# OWASP ZAP (autoâcontainer)
docker run --rm -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:8080
```

### Monitoramento com Prometheus + Grafana (opcional)

O endpoint `/api/metrics` fornece dados no formato nativo do Prometheus. Para visualizar:

```bash
# 1. Instale e inicie o Prometheus
docker run -d -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# 2. Adicione ao prometheus.yml (exemplo):
# scrape_configs:
#   - job_name: 'meuvoto'
#     static_configs:
#       - targets: ['meu-voto.app:8080']
#     metrics_path: /api/metrics
#     scrape_interval: 15s

# 3. Acesse o dashboard: http://localhost:9090
# 4. (Opcional) Grafana: docker run -d -p 3000:3000 grafana/grafana
```

### CI/CD (GitHub Actions)
- Toda `push` ou `pull request` para `main` roda automaticamente os testes.
- Fluxograma de execuÃ§Ã£o no [` .github/workflows/ci.yml`](.github/workflows/ci.yml).
- Deploy manual: `railway up`.

### ð DocumentaÃ§Ã£o
- **[`INFRAESTRUTURA.md`](INFRAESTRUTURA.md)** â Arquitetura completa, endpoints, deploy, seguranÃ§a, backup, LGPD, testes e governanÃ§a.
