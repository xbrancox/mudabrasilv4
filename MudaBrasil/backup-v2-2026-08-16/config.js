/* ============================================================
   MUDABRASIL · CONFIGURAÇÃO CENTRAL (v2.1 FINAL)
   ÚNICO arquivo que você edita para lançar.
   modo: 'beta' (teste) | 'producao' (oficial)
   Os [colchetes] são placeholders: troque pelos dados reais.
   v2/v2.1: adiciona versao, icm, decadencia, newsBoost e fontes
   regionais (notas 12/13 + feedback do fundador 13/08).
   CONTRATO MB_CONFIG 100% intacto — nada renomeado ou removido.
============================================================ */
const MB_CONFIG = {
  versao: '2.1.0',
  modo: 'beta',

  /* ---------- IDENTIDADE ---------- */
  nome: 'MudaBrasil',
  razaoSocial: '[MUDABRASIL TECNOLOGIA CÍVICA LTDA — a definir na abertura da ME]',
  cnpj: '[CNPJ a definir]',
  endereco: '[endereço completo a definir]',
  dominio: 'mudabrasil.com.br',

  /* ---------- CONTATO ---------- */
  emails: {
    contato:  'contato@mudabrasil.com.br',
    dpo:      'dpo@mudabrasil.com.br',
    denuncia: 'denuncia@mudabrasil.com.br',
    anuncie:  'anuncie@mudabrasil.com.br'
  },
  pix: '[chave Pix a definir]',
  redes: { instagram:'#', tiktok:'#', youtube:'#', x:'#', linkedin:'#', facebook:'#' },

  /* ---------- KILL SWITCHES (liga/desliga) ---------- */
  publicidadeAtiva: false,               // anúncios genéricos (home) — desligado no lançamento
  bibliotecaTransparenciaAtiva: false,   // biblioteca pública de anúncios

  /* ---------- NOTÍCIAS AUTOMÁTICAS ---------- */
  noticiasAutomaticas: true,
  noticiaCacheMin: 60,                   // cache em minutos (60 = 1h) → chave mb_news_v3
  newsSources: [
    { nome:'G1 · Política',     url:'https://g1.globo.com/rss/g1/politica',                          cat:'Política',          confiavel:true },
    { nome:'G1 · Brasil',       url:'https://g1.globo.com/rss/g1/brasil',                            cat:'Cidadania',         confiavel:true },
    { nome:'BBC News Brasil',   url:'https://feeds.bbci.co.uk/portuguese/rss.xml',                   cat:'Política',          confiavel:true },
    { nome:'Agência Brasil',    url:'https://agenciabrasil.ebc.com.br/feed/ultimasnoticias/feed.xml', cat:'Cidadania',         confiavel:true },
    { nome:'G1 · SP',           url:'https://g1.globo.com/rss/g1/sp/sao-paulo',                      cat:'Regional',          confiavel:true },
    { nome:'G1 · RJ',           url:'https://g1.globo.com/rss/g1/rj/rio-de-janeiro',                 cat:'Regional',          confiavel:true },
    { nome:'G1 · MG',           url:'https://g1.globo.com/rss/g1/mg/minas-gerais',                   cat:'Regional',          confiavel:true }
  ],
  newsTopics: ['Política','Regional','Eleitoral & Reforma','Transparência','Cidadania','Inclusão','Economia','Tecnologia & Voto'],
  newsBoost: ['Política','Eleitoral & Reforma','Regional'],  // v2: vitrine prioriza política nacional+regional (feedback 13/08)

  /* ---------- ICM · Índice de Confiança MudaBrasil (nota 13) ---------- */
  icm: {
    versao: 'v1.0',
    vigenteDesde: '2026-08-14',
    pesos: { resposta: 0.40, cumprimento: 0.35, devolucao: 0.25 }
  },

  /* ---------- DECAIMENTO DO VOTO (nota 13) ----------
     Peso por idade: cheio até 90 dias → decaimento linear até 0,5
     aos 180 dias → piso 0,5. O voto nunca morre; só esfria. */
  decadencia: { cheioDias: 90, pisoDias: 180, piso: 0.5 },

  /* ---------- TUR GUIADO (v2.2) ----------
     Tour opcional no 1º acesso ao site. Pula se mb_tour_done=1. */
  tourAtivo: true,

  /* ---------- GLOSSÁRIO CÍVICO INLINE (v2.2) ----------
     Termos que aparecem sublinhados pontilhados em notícias/PLs/Entenda.
     Ao tocar, abre tooltip com definição curta. Educa sem interromper. */
  glossario: {
    'suplência': 'Suplência = entra o próximo da lista DO PARTIDO quando uma cadeira vagará. O MudaBrasil propõe que entre o mais votado PELO POVO.',
    'quociente eleitoral': 'Número mínimo de votos pra um partido eleger 1 cadeira no sistema proporcional. Define quem "passa" e quem "arrasta" outros.',
    'fidelidade partidária': 'Regra (Res. TSE 22.610/2007) que permite PERDER o mandato se o deputado votar contra a orientação do partido.',
    'recall': 'Revogação do mandato pelo povo. No MudaBrasil hoje é termômetro (sem valor jurídico); no futuro, proposta de reforma com travas.',
    'ICP-Brasil': 'Infraestrutura de Chaves Públicas Brasileira — a assinatura digital com valor jurídico no Brasil (MP 2.200-2/2001).',
    'Gov.br': 'Plataforma oficial de identidade digital do governo federal. Fase final do MudaBrasil: login com Gov.br.',
    'LGPD': 'Lei Geral de Proteção de Dados (Lei 13.709/2018). Regula como tratamos seus dados. No MudaBrasil, o livro público usa pseudônimo, não CPF.',
    'voto revogável': 'Voto que o eleitor PODE TIRAR DE VOLTA a partir da posse, durante o mandato, se o político não corresponder.',
    'decaimento do voto': 'Peso do voto cai com o tempo: cheio até 90 dias → até 0,5 aos 180 dias → piso 0,5. O voto nunca morre; só esfria.',
    'posse': 'Ato formal em que o eleito assume o mandato. A janela de revogação (R5) abre A PARTIR DA POSSE, não no dia da eleição.',
    'pseudônimo': 'Identificador que NÃO revela quem você é. No livro público do MudaBrasil, seu voto aparece com pseudônimo, nunca com CPF/nome.',
    'ledger': 'Registro público e imutável (caderneta) de transações. Fase final: o MudaBrasil usa ledger pra auditoria externa total.',
    'PL': 'Projeto de Lei — proposta em tramitação na Câmara ou Senado. No Congresso Espelho, você opina sobre PLs reais.'
  },

  /* ---------- MURAL DE CONQUISTAS (v2.2) ----------
     Casos (mock) onde a pressão cidadã funcionou. Combate o "nada muda".
     Fase final: alimentado por dados reais de cobranças respondidas. */
  conquistas: [
    { titulo: 'Vereadora responde em 2h após 8 mil cobranças', det: 'Maria Santos (PT-SP) publicou prestação de contas após pressão no Radar.', data: '2026-08-10', icone: 'fa-bullhorn', cor: 'var(--accent)' },
    { titulo: 'Promessa de creche sai do papel após cobrança', det: 'PL da creche foi protocolado após 14.320 cobranças cidadãs registradas.', data: '2026-08-05', icone: 'fa-school', cor: 'var(--gold)' },
    { titulo: 'Deputado publica agenda após selo "Não verificado"', det: 'Carlos Mendes (PSDB) entrou no verificar.html pra conseguir o selo azul.', data: '2026-07-28', icone: 'fa-certificate', cor: 'var(--blue)' }
  ]
};