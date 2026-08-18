/* ============================================================
MUDABRASIL · CONFIGURAÇÃO CENTRAL (v2.2 — fontes 100% políticas)
ÚNICO arquivo que você edita para lançar.
modo: 'beta' (teste) | 'producao' (oficial)
Os [colchetes] são placeholders: troque pelos dados reais.
============================================================ */
const MB_CONFIG = {
  versao: '2.2.0',
  modo: 'beta',

  /* IDENTIDADE */
  nome: 'MudaBrasil',
  razaoSocial: '[MUDABRASIL TECNOLOGIA CÍVICA LTDA — a definir na abertura da ME]',
  cnpj: '[CNPJ a definir]',
  endereco: '[endereço completo a definir]',
  dominio: 'mudabrasil.com.br',

  /* CONTATO */
  emails: {
    contato:  'contato@mudabrasil.com.br',
    dpo:      'dpo@mudabrasil.com.br',
    denuncia: 'denuncia@mudabrasil.com.br',
    anuncie:  'anuncie@mudabrasil.com.br'
  },
  pix: '[chave Pix a definir]',
  redes: { instagram:'#', tiktok:'#', youtube:'#', x:'#', linkedin:'#', facebook:'#' },

  /* KILL SWITCHES */
  publicidadeAtiva: false,
  bibliotecaTransparenciaAtiva: false,

  /* NOTÍCIAS — só política nacional + regional (filtro por palavras-chave no site) */
  noticiasAutomaticas: true,
  noticiaCacheMin: 60,
  newsSources: [
    { nome:'G1 · Política',            url:'https://g1.globo.com/rss/g1/politica/',                    cat:'Política', confiavel:true },
    { nome:'Agência Brasil · Política',url:'https://agenciabrasil.ebc.com.br/politica/feed',           cat:'Política', confiavel:true },
    { nome:'BBC News Brasil',          url:'https://feeds.bbci.co.uk/portuguese/rss.xml',              cat:'Política', confiavel:true },
    { nome:'G1 · SP',                  url:'https://g1.globo.com/rss/g1/sp/sao-paulo/',                cat:'Regional', confiavel:true },
    { nome:'G1 · RJ',                  url:'https://g1.globo.com/rss/g1/rj/rio-de-janeiro/',           cat:'Regional', confiavel:true },
    { nome:'G1 · MG',                  url:'https://g1.globo.com/rss/g1/mg/minas-gerais/',             cat:'Regional', confiavel:true }
  ],
  newsTopics: ['Política','Regional','Eleitoral & Reforma','Transparência','Cidadania','Inclusão','Economia','Tecnologia & Voto'],
  newsBoost: ['Política','Eleitoral & Reforma','Regional'],

  /* ICM v1.0 */
  icm: { versao: 'v1.0', vigenteDesde: '2026-08-14', pesos: { resposta: 0.40, cumprimento: 0.35, devolucao: 0.25 } },

  /* DECAIMENTO DO VOTO */
  decadencia: { cheioDias: 90, pisoDias: 180, piso: 0.5 }
};