# MudaBrasil v3 — Guia de deploy e changelog

## Como publicar (Netlify Drop — 5 minutos)
1. Acesse **app.netlify.com/drop**
2. Arraste a **pasta inteira** (este diretório com todos os arquivos)
3. Pronto: `mudabrasil-XXXX.netlify.app` (depois aponte o domínio próprio `mudabrasil.com.br` em Domain settings)

**Checklist antes do 1º real de anunciante:** ver [[01 Leis]] — checklist legal completo (ME, contador, INPI, DPO, advogado).

## Estrutura de arquivos (v3)
| Arquivo | O que é | Novidade v3 |
|---|---|---|
| `index.html` | Site (Home/Radar/Congresso/Conferir/Notícias/Entenda/Admin) | Bento grid, EKG Pulso do Brasil, ⌘K, Conta de Confiança, Ágora 2.0, mural de conquistas, hash-routing, OG tags |
| `app/index.html` | App (votar) | Onboarding scrollytelling, motion do voto, passkey simulada, trilha cívica gamificada, modo disfarce, alinhamento |
| `conferir.html` | Conferência/revogação (R1) | Valida dígito verificador + formato correto da cédula do app |
| `verificar.html` | KYC do político (selo azul) | Acessibilidade completa |
| `tokens.css` | **NOVO** Design system único | Cores/glass/bento/motion/EKG/scrollytelling num só lugar |
| `core.js` | **NOVO** Base compartilhada | Helpers + CANDIDATOS + POLÍTICOS + escape anti-XSS — acaba com a duplicação em 4 arquivos |
| `config.js` | MB_CONFIG v3 | + trilha, disfarce, alinhamento, portalAnunciantesAtiva (bug), glossário com quiz |
| `manifest.webmanifest` | **NOVO** PWA | App instalável com atalhos (Votar / Meu voto / Conferir) |
| `sw.js` | **NOVO** Service worker | Offline completo; cédula funciona sem internet |
| `icon.svg` | **NOVO** Logo/ícone | Favicon + PWA (urna com check teal) |
| `api/icm.json` | **NOVO** API pública do ICM | JSON versionado para a imprensa |
| `widget-icm.js` | **NOVO** Widget embeddável | `<div data-mb-icm="maria">` em qualquer portal |
| `robots.txt` | Bloqueia /anunciantes | — |

## O que foi implementado (mapa das ideias)
- **A1** Conta de Confiança (extrato: depósito/promessa/cobrança/resposta/estorno) — Radar
- **A2** Motion do voto (selo ✓ voando ao votar; ↩︎ volta ao revogar) + haptics
- **A3** Home "Pulso do Brasil" (EKG em canvas, sem lib) + termômetro honesto + mapa Leaflet com atribuição OSM corrigida
- **A4** Onboarding scrollytelling no app (4 capítulos → instruções R9)
- **A5** PWA: manifest + service worker + offline + ícone
- **A6** Busca global ⌘K (políticos, PLs, páginas, ações, tema)
- **A7** Modo disfarce calculadora (sai com 202613 e =) + pânico por chacoalhar mantido
- **A8** Cartão 9:16 para Stories/TikTok + Web Share API (nível 2)
- **A9** Login passkey simulado (mesma pegada "segurança do Pix")
- **A10** Bento grid + tipografia fluida + contraste do dourado corrigido no claro
- **B1** Score de alinhamento pessoal (mock determinístico; ganho p/ votos nominais reais da Câmara)
- **B2** API pública do ICM (api/icm.json) + widget embeddável (widget-icm.js)
- **B3** Contracheque do mandato (ilustrativo, com nota honesta)
- **B4** Mural de conquistas (config.conquistas) no Entenda
- **B5** Trilha cívica gamificada: 13 micro-aulas com quiz, XP e sequência (🔥)
- **B6** Ágora 2.0: argumentos PRÓ/CONTRA empilhados e votáveis — sem IA
- **B7** Comparador pré-preenchido com a watchlist
- **C2** PWA completo · **C3** Design system único · **C4** Correções: XSS (escape em todo conteúdo externo), SRI nos 4 CDNs, atribuição OSM, nav com href (teclado), hash-routing (refresh mantém a seção), dourado AA no claro, reduced-motion em todos os arquivos, bug do formato da cédula app→site, bug portalAnunciantesAtiva, OG tags/favicon

## Contrato técnico respeitado (nota 10)
- Chaves **NÃO renomeadas** (19 existentes) — apenas adicionadas: `mb_xp`, `mb_streak`, `mb_aulas`, `mb_disfarse`
- Terminologia oficial: "voto contínuo e revogável" (nunca "voto-espelho" na UI), "Aprovo/Não aprovo", "Cobrar cumprimento", aba "Entenda", "votos revogáveis"
- R1–R11 todas preservadas (R1 anti-print · R2 branco/nulo · R3 popup · R4 código único · R5 janela pós-posse · R6 mascarado · R7 localidade/DF · R8 popup simulação · R9 instruções+pânico · R10 revisão com trocar · R11 ranking com crédito)
- Bug-fixes 1–7 mantidos (cache versionado mb_news_v3, renderPitches ao abrir Espalhe, thumbnail inteligente, popup 1×, anúncios no kill switch, demo discreto, login só antes do código + 10s com nomes + pânico só chacoalhar + sticky sem botão + "Ver meu voto" só se votou)
- ICM v1.0 e decaimento (90d→0,5@180d) intactos

## Chaves localStorage (v3)
Existentes: `mb_local, mb_sess, mb_ballot, mb_codigo, mb_janela, mb_rev, mb_pub, mb_news_v3, mb_site_pop, mb_theme, mb_cobrancas, mb_watchlist, mb_voto_pl, mb_pls_v1, mb_manter, mb_agora_<id>`
Novas v3: `mb_xp, mb_streak, mb_aulas, mb_disfarse` (+ `mb_mostra_<cargo>` para o "mostrar" por cargo do Meu voto)
