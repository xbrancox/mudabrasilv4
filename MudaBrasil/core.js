/* MudaBrasil — core.js v3 · Base compartilhada (site + app + conferir + verificar)
   Helpers únicos: acaba com a cópia em 4 arquivos. Mantém o contrato da nota 10. */
'use strict';
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const LS={get:(k,d=null)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del:k=>localStorage.removeItem(k)};
/* Escape anti-XSS (C4): OBRIGATÓRIO em todo conteúdo externo (RSS, Ágora, inputs) */
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=n=>Number(n).toLocaleString('pt-BR');
const fmtData=iso=>new Date(iso+(iso.length<=10?'T12:00:00':'')).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
const diaMs=864e5;

/* Tema (persiste mb_theme · respeita prefers-color-scheme) */
function initTema(){const t=LS.get('mb_theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.body.dataset.theme=t}
function toggleTema(){const t=document.body.dataset.theme==='light'?'dark':'light';document.body.dataset.theme=t;LS.set('mb_theme',t)}

/* Toast */
function toast(msg,ms=2600){let el=$('.toast');if(!el){el=document.createElement('div');el.className='toast';el.setAttribute('role','status');document.body.appendChild(el)}el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),ms)}

/* Haptics (A2) */
const hapt=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};

/* Avatar determinístico por nome */
function cor(nome){let h=0;for(const c of nome)h=(h*31+c.charCodeAt(0))>>>0;const cores=['#00E5C9','#D4AF37','#3aa5ff','#7b3ff2','#FF6B6B','#2FDCA8','#F0CB60'];return cores[h%cores.length]}
const avatar=(nome,iniciais)=>`<span class="avatar" style="background:${cor(nome)}">${esc(iniciais||nome.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase())}</span>`;

/* CANDIDATOS mock — fonte única (antes copiada em 4 arquivos).
   Cédula salva no formato do app atual: {tipo: cargoKey, cand: índice} · 'B' = branco · 'N' = nulo */
const CARGOS=[
 {key:'presidente',nome:'Presidente',n:4},{key:'governador',nome:'Governador',n:3},
 {key:'senador',nome:'Senador',n:2},{key:'depfederal',nome:'Deputado Federal',n:3},{key:'depestadual',nome:'Deputado Estadual/Distrital',n:2}
];
const CAND={
 presidente:[{nome:'Ana Fontes',sigla:'PV',num:51},{nome:'Rui Bacelar',sigla:'PSD',num:55},{nome:'Cida Moraes',sigla:'PT',num:13},{nome:'Otto Prado',sigla:'PL',num:22}],
 governador:[{nome:'Helena Cruz',sigla:'PSB',num:40},{nome:'Marcos Vilela',sigla:'MDB',num:15},{nome:'Tereza Kahn',sigla:'NOVO',num:30}],
 senador:[{nome:'Paulo Anchieta',sigla:'PSDB',num:45},{nome:'Lúcia Ferraz',sigla:'REDE',num:18}],
 depfederal:[{nome:'Beto Sampaio',sigla:'PP',num:11},{nome:'Vera Lins',sigla:'PCdoB',num:65},{nome:'Ivan Duarte',sigla:'Republicanos',num:10}],
 depestadual:[{nome:'Nina Torres',sigla:'PSOL',num:50},{nome:'Caio Bittar',sigla:'Cidadania',num:23}]
};
function nomeCand(tipo,idx){const c=(CAND[tipo]||[])[idx];return c?`${c.nome} (${c.sigla} ${c.num})`:(idx==='B'?'Branco':idx==='N'?'Nulo':'—')}
const UFS=['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

/* Código de verificação (R4): 20 dígitos + dígito verificador mod 10 — igual ao app atual */
function genCode(){let d='MB'+Date.now().toString().slice(-8);let s='';for(let i=0;i<19;i++)s+=Math.floor(Math.random()*10);const dv=(sum=>(10-sum%10)%10)([...s].reduce((a,c,i)=>a+(+c)*(i%2?1:2),0));return s+dv}
function validCode(code){const c=String(code||'').replace(/\D/g,'');if(c.length!==20)return false;const s=c.slice(0,19),dv=+c[19];const calc=( [...s].reduce((a,ch,i)=>a+(+ch)*(i%2?1:2),0));return((10-calc%10)%10)%10===dv}

/* Decaimento do voto (nota 10): cheio 90d → linear até 0,5 aos 180d → piso */
function pesoVoto(ts){const cfg=MB_CONFIG.decadencia;const dias=(Date.now()-ts)/diaMs;if(dias<=cfg.cheioDias)return 1;if(dias>=cfg.pisoDias)return cfg.piso;return 1-(1-cfg.piso)*(dias-cfg.cheioDias)/(cfg.pisoDias-cfg.cheioDias)}

/* POLÍTICOS pilotos do Radar (3: alta/misto/baixo) — agora com Conta de Confiança (A1),
   Contracheque ilustrativo (B3) e alinhamento mock (B1) */
const POLITICOS=[
 {id:'maria',nome:'Maria Silva',cargo:'Deputada Federal (SP)',partido:'PV',icm:82,n:1240,variacao:+2,selo:true,
  comp:{resposta:95,cumprimento:80,devolucao:6},
  promessas:[{t:'Concluir a creche do bairro Norte',st:'cumprida',lastro:'Diário Oficial 12/03/2026'},{t:' votar contra aumento próprio',st:'andamento',lastro:'PL 1234/2026'},{t:'Publicar agenda semanal',st:'cumprida',lastro:'gabinete.br/agenda'}],
  extrato:[{d:'2026-03-12',t:'Depósito',desc:'2.140 votos de confiança ativos',icon:'fa-arrow-down'},{d:'2026-05-02',t:'Promessa',desc:'Creche do bairro Norte registrada com lastro',icon:'fa-file-signature'},{d:'2026-06-10',t:'Cobrança',desc:'4.312 eleitores cobraram cumprimento',icon:'fa-bullhorn'},{d:'2026-07-01',t:'Resposta',desc:'Respondeu oficialmente em 2 dias',icon:'fa-reply'},{d:'2026-08-01',t:'Cumprimento',desc:'Obra incluída no plano executivo',icon:'fa-circle-check'}],
  contracheque:{salario:41500,gabinete:98200,custoDia:456,nota:'Valores ilustrativos — fonte oficial no futuro (Câmara/Legis)'},
  agenda:{pl1234:'aprova',pl2026:'rejeita',pl45:'aprova',pl2100:'rejeita',pl88:'aprova',pl1500:'rejeita'},
  resposta:{prazo:'2 dias',direito:'Não acionado — cumpriu sem necessidade.'}},
 {id:'carlos',nome:'Carlos Rocha',cargo:'Deputado Federal (MG)',partido:'PSD',icm:54,n:980,variacao:-3,selo:true,
  comp:{resposta:50,cumprimento:55,devolucao:30},
  promessas:[{t:'Transparência da verba de gabinete',st:'andamento',lastro:'nota oficial'},{t:'Audiências públicas mensais',st:'nao',lastro:'—'},{t:'PL da saúde preventiva',st:'andamento',lastro:'PL 2100/2026'}],
  extrato:[{d:'2026-03-12',t:'Depósito',desc:'980 votos de confiança ativos',icon:'fa-arrow-down'},{d:'2026-04-18',t:'Promessa',desc:'Audiências mensais registradas',icon:'fa-file-signature'},{d:'2026-06-02',t:'Cobrança',desc:'1.204 eleitores cobraram',icon:'fa-bullhorn'},{d:'2026-07-15',t:'Silêncio',desc:'Sem resposta oficial há 60 dias',icon:'fa-hourglass-half'},{d:'2026-08-02',t:'Estorno',desc:'294 eleitores revogaram a confiança',icon:'fa-rotate-left'}],
  contracheque:{salario:41500,gabinete:98200,custoDia:456,nota:'Valores ilustrativos — fonte oficial no futuro (Câmara/Legisp)'},
  agenda:{pl1234:'rejeita',pl2026:'rejeita',pl45:'aprova',pl2100:'aprova',pl88:'rejeita',pl1500:'aprova'},
  resposta:{prazo:'—',direito:'Usou o direito de resposta em 02/05/2026.'}},
 {id:'joao',nome:'João Lima',cargo:'Senador (RJ)',partido:'PL',icm:31,n:1510,variacao:-8,selo:false,
  comp:{resposta:15,cumprimento:22,devolucao:51},
  promessas:[{t:'Dobrar investimento em segurança',st:'nao',lastro:'LOA 2026 (corte)'},{t:'Seminário mensal aberto',st:'nao',lastro:'—'},{t:' votar a favor da transparência',st:'nao',lastro:'votação nominal 45'}],
  extrato:[{d:'2026-03-12',t:'Depósito',desc:'1.510 votos de confiança ativos',icon:'fa-arrow-down'},{d:'2026-04-01',t:'Promessa',desc:'Segurança: dobrar investimento',icon:'fa-file-signature'},{d:'2026-05-20',t:'Cobrança',desc:'8.940 eleitores cobraram',icon:'fa-bullhorn'},{d:'2026-06-30',t:'Quebra',desc:'Votou contra a própria promessa (PL 45)',icon:'fa-triangle-exclamation'},{d:'2026-07-10',t:'Estorno',desc:'771 eleitores revogaram a confiança',icon:'fa-rotate-left'}],
  contracheque:{salario:41000,gabinete:105000,custoDia:449,nota:'Valores ilustrativos — fonte oficial no futuro (Senado)'},
  agenda:{pl1234:'rejeita',pl2026:'aprova',pl45:'rejeita',pl2100:'rejeita',pl88:'aprova',pl1500:'rejeita'},
  resposta:{prazo:'—',direito:'Não respondeu.'}}
];

/* PLs fallback "em bom português" (mesmos 6 do contrato) + votos mock p/ alinhamento (B1) */
const PLS_FALLBACK=[
 {id:'pl1234',num:'PL 1234/2026',tema:'Transparência',resumo:'Todo gabinete deve publicar online onde vai cada real da verba pública.',oficial:'Proposta exige publicação mensal e detalhada dos gastos de gabinete.'},
 {id:'pl2026',num:'PL 2026/2026',tema:'Saúde',resumo:'Previne antes de remediar: mais recursos para UBS e exames de rotina.',oficial:'Amplia repasse federal para atenção primária e rastreamento.'},
 {id:'pl45',num:'PL 45/2026',tema:'Segurança pública',resumo:'Transparência total das ações de polícia e uso de verbas de segurança.',oficial:'Cria painel público unificado de ações e gastos em segurança.'},
 {id:'pl2100',num:'PL 2100/2026',tema:'Educação',resumo:'Escola em tempo integral em regiões de maior vulnerabilidade.',oficial:'Programa nacional de ampliação da jornada escolar.'},
 {id:'pl88',num:'PL 88/2026',tema:'Tecnologia',resumo:'Governo aberto por padrão: dados públicos legíveis por máquina.',oficial:'Estabelece política de dados abertos em todos os órgãos.'},
 {id:'pl1500',num:'PL 1500/2026',tema:'Cidadania',resumo:'Facilita o acompanhamento de PLs por qualquer cidadão.',oficial:'Simplifica o portal de participação legislativa.'}
];

/* Trilha cívica (B5) */
const Trilha={
 estado:()=>({xp:LS.get('mb_xp',0),streak:LS.get('mb_streak',{last:0,count:0}),feitas:LS.get('mb_aulas',{})}),
 registrar(){const s=this.estado();const hoje=new Date().toISOString().slice(0,10);if(s.streak.last===hoje)return s;if(s.streak.last===new Date(Date.now()-diaMs).toISOString().slice(0,10))s.streak.count++;else s.streak.count=1;s.streak.last=hoje;LS.set('mb_streak',s.streak);return s},
 acertar(id){const s=this.estado();if(s.feitas[id])return s;s.feitas[id]=new Date().toISOString();LS.set('mb_aulas',s.feitas);const xp=LS.get('mb_xp',0)+(MB_CONFIG.trilha.xpPorAula||10);LS.set('mb_xp',xp);return this.registrar()}
};

/* Registro do Service Worker (PWA — A5/C2) */
function registrarSW(caminho){if('serviceWorker'in navigator){addEventListener('load',()=>navigator.serviceWorker.register(caminho).catch(()=>{}))}}
