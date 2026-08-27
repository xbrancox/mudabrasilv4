/* MudaBrasil — config.js v3.1 · ÚNICO arquivo pra editar na hora de lançar */
const MB_CONFIG = {
  versao: 'v3.1',
  modo: 'beta',
  nome: 'MudaBrasil',
  razaoSocial: '[RAZAO SOCIAL]',
  cnpj: '[CNPJ]',
  endereco: '[ENDERECO]',
  dominio: 'mudabrasil.netlify.app',
  emails: { contato:'[contato@dominio]', dpo:'[dpo@dominio]', denuncia:'[denuncia@dominio]', anuncie:'[anuncie@dominio]' },
  pix: '[CHAVE PIX]',
  redes: { instagram:'', x:'', youtube:'', tiktok:'' },
  publicidadeAtiva: true,
  portalAnunciantesAtiva: false,
  bibliotecaTransparenciaAtiva: true,
  noticiasAutomaticas: true,
  noticiaCacheMin: 60,
  newsSources: [
    {nome:'Agência Brasil', url:'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', cat:'Transparência'},
    {nome:'G1 Política',    url:'https://g1.globo.com/rss/g1/politica/',                        cat:'Política'},
    {nome:'G1 SP',          url:'https://g1.globo.com/rss/sp/sao-paulo/',                       cat:'Regional'},
    {nome:'G1 RJ',          url:'https://g1.globo.com/rss/rj/rio-de-janeiro/',                  cat:'Regional'},
    {nome:'G1 MG',          url:'https://g1.globo.com/rss/mg/minas-gerais/',                    cat:'Regional'},
    {nome:'BBC Brasil',     url:'https://feeds.bbci.co.uk/portuguese/rss.xml',                  cat:'Cidadania'}
  ],
  newsTopics: ['Política','Economia','Transparência','Cidadania','Inclusão','Eleitoral','Regional'],
  newsBoost: ['Política','Regional'],
  icm: { versao:'v1.0', vigenteDesde:'2026-08-15', pesos:{resposta:.40, cumprimento:.35, devolucao:.25} },
  decadencia: { cheioDias:90, pisoDias:180, piso:0.5 },
  trilha: { xpPorAula:10 },
  glossario: {
    'suplência':'Quem assume a vaga do parlamentar quando ele se ausenta ou deixa o cargo.',
    'quociente eleitoral':'Cálculo (votos válidos ÷ vagas) que define quantas cadeiras cada partido leva.',
    'fidelidade partidária':'Regra que pune com perda de mandato quem vota contra o partido (Res. TSE 22.610/2007).',
    'emenda parlamentar':'Verba que cada parlamentar destina a obras/projetos no seu reduto.',
    'verba de gabinete':'Dinheiro público pra manter o mandato (assessores, viagens, escritório).',
    'imunidade parlamentar':'Proteção pra opiniões no exercício do mandato — não é escudo pra crimes.',
    'PEC':'Proposta de Emenda à Constituição: muda a Constituição (exige 3/5 em dois turnos nas duas casas).',
    'medida provisória':'Norma com força de lei editada pelo Executivo; o Congresso precisa aprovar depois.',
    'votação nominal':'Voto registrado com nome e sobrenome — dá pra saber como cada um votou.',
    'quórum':'Número mínimo de presentes pra votar; e o tipo de maioria exigida (simples, absoluta, 3/5).',
    'cassação':'Punição que PERDE o mandato por quebra de decoro/crime — é processo, não é recall.',
    'fundo eleitoral':'Dinheiro público que financia campanhas eleitorais.',
    'reeleição':'Possibilidade de se eleger de novo pro mesmo cargo (máx. 1 reeleição seguida no Executivo).'
  },
  conquistas: [
    {d:'2026-07-02', t:'Político respondeu em 2 dias após cobrança pública no Radar.'},
    {d:'2026-06-18', t:'Promessa da creche entrou no plano executivo após 4.312 cobranças.'},
    {d:'2026-05-30', t:'Agenda semanal publicada após selo de verificação.'}
  ]
};