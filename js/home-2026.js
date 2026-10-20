/* ============================================================
   HOME 2026 — CARREGAMENTO DE DADOS (v2 - CORRIGIDO)
   Popula: pesquisas presidente, governadores por estado
   Notícias são carregadas inline no index.html (função nufSet)
   ============================================================ */

(function () {
  'use strict';

  console.log('[home-2026] Script carregado');

  // ===== PESQUISAS DE PRESIDENTE =====
  async function carregarPesquisasPresidente() {
    console.log('[home-2026] Iniciando carregamento de pesquisas presidente');
    
    const select = document.getElementById('seletor-pesquisa');
    const card = document.getElementById('pesquisa-card');
    
    if (!select) {
      console.error('[home-2026] ERRO: Elemento #seletor-pesquisa não encontrado no DOM');
      return;
    }
    if (!card) {
      console.error('[home-2026] ERRO: Elemento #pesquisa-card não encontrado no DOM');
      return;
    }

    console.log('[home-2026] Elementos encontrados, buscando dados...');

    let pesquisasData;
    try {
      const resp = await fetch('data/pesquisas-presidente-2026.json');
      console.log('[home-2026] Fetch response:', resp.status, resp.ok);
      
      if (!resp.ok) {
        throw new Error('HTTP ' + resp.status + ' - ' + resp.statusText);
      }
      
      pesquisasData = await resp.json();
      console.log('[home-2026] Dados carregados:', pesquisasData);
      console.log('[home-2026] Número de pesquisas:', pesquisasData.pesquisas?.length || 0);
      
    } catch (err) {
      console.error('[home-2026] ERRO ao carregar pesquisas:', err);
      card.innerHTML = '<div class="pesquisa-vazio"><i class="fa-solid fa-circle-exclamation"></i><p>Erro ao carregar pesquisas: ' + err.message + '</p></div>';
      return;
    }

    if (!pesquisasData.pesquisas || !Array.isArray(pesquisasData.pesquisas)) {
      console.error('[home-2026] ERRO: Estrutura de dados inválida');
      card.innerHTML = '<div class="pesquisa-vazio"><i class="fa-solid fa-circle-exclamation"></i><p>Estrutura de dados inválida.</p></div>';
      return;
    }

    /* O seletor saiu do HTML (era um <select> com rótulos escritos à mão,
       que ficavam desatualizados). Agora os institutos aparecem como mini
       cards gerados a partir do JSON — só os que já divulgaram dados. */
    function valorInstituto(p) {
      return (p.instituto || '').toLowerCase().replace(/\//g, '').replace(/\s/g, '');
    }
    const container = document.getElementById('pesquisa-institutos');
    const divulgadas = pesquisasData.pesquisas.filter(function (p) {
      return p.status === 'divulgada' && p.espontanea;
    });
    const emBreve = pesquisasData.pesquisas.filter(function (p) {
      return p.status !== 'divulgada';
    });
    if (container) {
      container.innerHTML = '';
      divulgadas.forEach(function (p) {
        const card = document.createElement('div');
        card.className = 'pesquisa-mini-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'Ver pesquisa ' + p.instituto);
        const cor = p.status === 'divulgada' ? '#2ECC71' : '#95A5A6';
        card.style.borderColor = cor;
        card.innerHTML =
          '<div style="font-size:24px;margin-bottom:8px">📊</div>' +
          '<div style="font-weight:800;font-size:15px">' + (p.instituto || '') + '</div>' +
          '<div style="font-size:12px;color:var(--muted);margin-top:4px">' + (p.data || '—') + '</div>' +
          '<div style="margin-top:10px;font-size:11px;font-weight:700;color:' + cor + '">● Divulgada</div>';
        card.onclick = function () { select.value = valorInstituto(p); renderizar(valorInstituto(p)); };
        card.onkeydown = function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            select.value = valorInstituto(p);
            renderizar(valorInstituto(p));
          }
        };
        container.appendChild(card);
      });
    }
    /* Mantém o <select> original (agora oculto) como fonte de valor, para
       que o código de renderização e o deep-link continuem funcionando. */
    select.innerHTML = '';
    divulgadas.forEach(function (p) {
      const opt = document.createElement('option');
      opt.value = valorInstituto(p);
      opt.textContent = p.instituto + (p.data ? ' (' + p.data + ')' : '');
      select.appendChild(opt);
    });
    console.log('[home-2026] Mini cards gerados:', divulgadas.length, 'divulgadas,', emBreve.length, 'em breve');

    function renderizar(valor) {
      console.log('[home-2026] Renderizando pesquisa para:', valor);
      
      const pesquisa = pesquisasData.pesquisas.find(p => {
        const nomeInst = (p.instituto || '').toLowerCase().replace(/\//g, '').replace(/\s/g, '');
        const valorLimpo = valor.toLowerCase().replace(/\//g, '').replace(/\s/g, '');
        return nomeInst === valorLimpo || nomeInst.startsWith(valorLimpo);
      });
      
      if (!pesquisa) {
        console.warn('[home-2026] Pesquisa não encontrada para valor:', valor);
        card.innerHTML = '<div class="pesquisa-vazio"><i class="fa-solid fa-circle-exclamation"></i><p>Pesquisa "' + valor + '" não encontrada.</p></div>';
        return;
      }

      console.log('[home-2026] Pesquisa encontrada:', pesquisa.instituto, 'Status:', pesquisa.status);

      // Pesquisa em campo ou sem dados
      if (pesquisa.status === 'em campo' || pesquisa.status === 'em divulgação' || !pesquisa.espontanea) {
        console.log('[home-2026] Pesquisa ainda não divulgada');
        card.innerHTML = `
          <div class="pesquisa-header">
            <h3 class="pesquisa-instituto">📊 PESQUISA ${pesquisa.instituto.toUpperCase()}</h3>
            <p class="pesquisa-meta">Status: <strong>${pesquisa.status || 'Em campo'}</strong></p>
          </div>
          <div class="pesquisa-vazio">
            <i class="fa-solid fa-hourglass-half"></i>
            <p>Esta pesquisa ainda está em campo ou em divulgação. Os resultados serão disponibilizados assim que divulgados pelo instituto.</p>
          </div>
        `;
        return;
      }

      // Pesquisa com dados
      const espont = pesquisa.espontanea;
      const listaCandidatos = Object.keys(espont).filter(n => 
        !n.includes('Indeciso') && !n.includes('Brancos') && !n.includes('Nulos') && !n.includes('Nenhum') && !n.includes('Não sabe')
      );
      const indecisos = espont['Indecisos/Nenhum'] || espont['Brancos/Nulos/Nenhum'] || espont['Indecidos/Nenhum'] || espont['Não sabe'] || 0;

      console.log('[home-2026] Candidatos encontrados:', listaCandidatos);

      // Cores profissionais dos candidatos
      const CORES = {
        'Lula': { partido: 'PT', cor: '#E74C3C', corGrad: 'linear-gradient(90deg, #E74C3C, #C0392B)' },
        'Flávio Bolsonaro': { partido: 'PL', cor: '#1A73E8', corGrad: 'linear-gradient(90deg, #1A73E8, #1557b0)' }
      };

      // Encontrar Lula e Flávio para comparação lado a lado
      const pctLula = espont['Lula'] || 0;
      const pctFlavio = espont['Flávio Bolsonaro'] || 0;
      const vv = pesquisa.votos_validos || {};
      const vvLula = vv['Lula'] || 0;
      const vvFlavio = vv['Flávio Bolsonaro'] || 0;

      // Badge de status da pesquisa
      const statusMap = {
        'divulgada': { label: 'DIVULGADA', cor: '#2ECC71', icon: 'fa-check-circle' },
        'em campo': { label: 'EM CAMPO', cor: '#F39C12', icon: 'fa-clock' },
        'em divulgação': { label: 'EM DIVULGAÇÃO', cor: '#95A5A6', icon: 'fa-hourglass-half' }
      };
      const st = statusMap[pesquisa.status] || statusMap['em campo'];

      // Indicador de atualização constante (relógio ao vivo)
      const agora = new Date();
      const ultimaAtualizacao = pesquisa.data || '08/10/2026';

      // Barras lado a lado dos dois candidatos
      const comparacaoHtml = `
        <div class="pesquisa-duelo">
          <div class="pesquisa-duelo-col azul">
            <div class="pesquisa-duelo-topo">
              <div class="pesquisa-duelo-nome">Flávio Bolsonaro <small>PL</small></div>
              <div class="pesquisa-duelo-pct">${pctFlavio}%</div>
            </div>
            <div class="pesquisa-duelo-track">
              <div class="pesquisa-duelo-fill" style="width:${pctFlavio}%;background:${CORES['Flávio Bolsonaro'].corGrad}"></div>
            </div>
          </div>
          <div class="pesquisa-duelo-col vermelho">
            <div class="pesquisa-duelo-topo">
              <div class="pesquisa-duelo-nome">Lula <small>PT</small></div>
              <div class="pesquisa-duelo-pct">${pctLula}%</div>
            </div>
            <div class="pesquisa-duelo-track">
              <div class="pesquisa-duelo-fill" style="width:${pctLula}%;background:${CORES['Lula'].corGrad}"></div>
            </div>
          </div>
        </div>
      `;

      // Outros candidatos e indecisos
      const outrosHtml = listaCandidatos.filter(n => n !== 'Lula' && n !== 'Flávio Bolsonaro').map(function(nome) {
        const info = CORES[nome] || { partido: '', cor: '#95A5A6', corGrad: 'linear-gradient(90deg,#95A5A6,#7F8C8D)' };
        const pct = espont[nome];
        return `
          <div class="pesquisa-barra-simples">
            <div class="pesquisa-barra-topo">
              <div class="pesquisa-barra-nome">${nome} <small>${info.partido}</small></div>
              <div class="pesquisa-barra-percent">${pct}%</div>
            </div>
            <div class="pesquisa-barra-track">
              <div class="pesquisa-barra-fill" style="width:${pct}%;background:${info.corGrad}"></div>
            </div>
          </div>
        `;
      }).join('');

      const indecisosHtml = indecisos > 0 ? `
        <div class="pesquisa-barra-simples">
          <div class="pesquisa-barra-topo">
            <div class="pesquisa-barra-nome">Indecisos / Brancos / Nulos</div>
            <div class="pesquisa-barra-percent">${indecisos}%</div>
          </div>
          <div class="pesquisa-barra-track">
            <div class="pesquisa-barra-fill" style="width:${indecisos}%;background:linear-gradient(90deg,#5A6E8E,#8A9BA7)"></div>
          </div>
        </div>
      ` : '';

      // Votos válidos lado a lado
      const votosValidosHtml = `
        <div class="pesquisa-votos-validos-pro">
          <div class="pesquisa-vv-card-pro azul">
            <div class="pesquisa-vv-nome-pro">Flávio Bolsonaro</div>
            <div class="pesquisa-vv-percent-pro">${vvFlavio}%</div>
            <div class="pesquisa-vv-label-pro">Votos válidos</div>
          </div>
          <div class="pesquisa-vv-card-pro vermelho">
            <div class="pesquisa-vv-nome-pro">Lula</div>
            <div class="pesquisa-vv-percent-pro">${vvLula}%</div>
            <div class="pesquisa-vv-label-pro">Votos válidos</div>
          </div>
        </div>
      `;

      card.innerHTML = `
        <div class="pesquisa-card-pro">
          <div class="pesquisa-header-pro">
            <div class="pesquisa-instituto-wrap">
              <span class="pesquisa-badge-status" style="background:${st.cor}">${st.icon ? '<i class="fa-solid '+st.icon+'"></i>' : ''} ${st.label}</span>
              <h3 class="pesquisa-instituto-pro">Pesquisa ${pesquisa.instituto}</h3>
            </div>
            <div class="pesquisa-meta-wrap">
              <span><i class="fa-solid fa-calendar"></i> ${pesquisa.data}</span>
              <span><i class="fa-solid fa-hashtag"></i> ${pesquisa.registro_tse}</span>
              <span><i class="fa-solid fa-user-group"></i> ${pesquisa.contratante || '—'}</span>
            </div>
            <p class="pesquisa-meta-pro">
              <strong>Amostra:</strong> ${pesquisa.amostra ? pesquisa.amostra.toLocaleString('pt-BR') : '—'} entrevistas ·
              <strong>Margem de erro:</strong> ±${pesquisa.margem_erro || '—'} p.p. ·
              <strong>2º Turno:</strong> 25/10/2026
            </p>
            <div class="pesquisa-atualizacao">
              <i class="fa-solid fa-sync-alt"></i>
              <span>Última atualização: <strong>${ultimaAtualizacao}</strong> · <span id="pesquisa-relogio">${agora.toLocaleTimeString('pt-BR')}</span></span>
            </div>
          </div>

          <div class="pesquisa-corpo-pro">
            <div class="pesquisa-titulo-secao-pro">Intenções de voto — Espontânea</div>
            ${comparacaoHtml}
            ${outrosHtml}
            ${indecisosHtml}
          </div>

          <div class="pesquisa-titulo-secao-pro" style="margin-top:24px">Votos válidos (exclui brancos, nulos e indecisos)</div>
          ${vvFlavio > 0 || vvLula > 0 ? votosValidosHtml : '<div class="pesquisa-vazio-pro"><p>Dados de votos válidos não disponíveis para esta pesquisa.</p></div>'}
        </div>
      `;
      
      console.log('[home-2026] Pesquisa renderizada com sucesso');
    }

    select.addEventListener('change', function (e) { 
      console.log('[home-2026] Select mudou para:', e.target.value);
      renderizar(e.target.value); 
    });
    
    // Renderizar primeira pesquisa
    const valorInicial = select.value || 'datafolha';
    console.log('[home-2026] Renderizando pesquisa inicial:', valorInicial);
    renderizar(valorInicial);
  }

  // ===== GOVERNADORES 2º TURNO (MINICARDS) =====
  async function carregarGovernadores() {
    console.log('[home-2026] Iniciando carregamento de governadores');

    const grid = document.getElementById('governadores-2turno-grid');

    if (!grid) {
      console.error('[home-2026] ERRO: Elemento #governadores-2turno-grid não encontrado no DOM');
      return;
    }

    console.log('[home-2026] Grid encontrado, buscando dados...');

    let govData, pesqData, fotosData;
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch('data/governadores-2026.json').then(function(r) {
          console.log('[home-2026] Fetch governadores:', r.status, r.ok);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        }),
        fetch('data/pesquisas-governadores-2026.json').then(function(r) {
          console.log('[home-2026] Fetch pesquisas governadores:', r.status, r.ok);
          if (!r.ok) return { pesquisas: {} };
          return r.json();
        }).catch(function(err) {
          console.warn('[home-2026] Pesquisas de governadores não disponíveis:', err.message);
          return { pesquisas: {} };
        }),
        fetch('data/fotos-candidatos-2026.json').then(function(r) {
          console.log('[home-2026] Fetch fotos candidatos:', r.status, r.ok);
          if (!r.ok) return { presidente: {}, governadores: {}, eleitos_1_turno: {} };
          return r.json();
        }).catch(function(err) {
          console.warn('[home-2026] Fotos não disponíveis:', err.message);
          return { presidente: {}, governadores: {}, eleitos_1_turno: {} };
        })
      ]);

      govData = r1;
      pesqData = r2;
      fotosData = r3;

      console.log('[home-2026] Dados de governadores carregados. Estados:', Object.keys(govData.estados || {}).length);

    } catch (err) {
      console.error('[home-2026] ERRO ao carregar governadores:', err);
      grid.innerHTML = '<div class="g2-vazio"><i class="fa-solid fa-circle-exclamation"></i><p>Erro ao carregar dados de governadores: ' + err.message + '</p></div>';
      return;
    }

    if (!govData.estados || Object.keys(govData.estados).length === 0) {
      console.error('[home-2026] ERRO: Nenhum estado encontrado nos dados');
      grid.innerHTML = '<div class="g2-vazio"><i class="fa-solid fa-triangle-exclamation"></i><p>Dados de governadores indisponíveis.</p></div>';
      return;
    }

    // Estados que vão para o 2º turno, em ordem alfabética pelo nome
    const estados2turno = Object.values(govData.estados)
      .filter(function(e) { return e.situacao === '2º turno'; })
      .sort(function(a, b) { return a.nome.localeCompare(b.nome); });

    console.log('[home-2026] Estados no 2º turno:', estados2turno.length);

    if (estados2turno.length === 0) {
      grid.innerHTML = '<div class="g2-vazio"><i class="fa-solid fa-circle-info"></i><p>Nenhum estado em disputa no 2º turno.</p></div>';
      return;
    }

    // Apoios do backend (se disponível)
    let apoioData = { total: 0, porCandidato: [] };
    try {
      const ar = await fetch('/api/turno');
      if (ar.ok) {
        const aj = await ar.json();
        if (aj && aj.ok) apoioData = aj;
      }
    } catch (e) { /* silencioso: seção renderiza sem barras de apoio */ }

    function iniciais(nome) {
      return (nome || '?').trim().split(/\s+/).slice(0, 2)
        .map(function(w) { return w[0] || ''; }).join('').toUpperCase();
    }

    /* Procura a foto do candidato testando variações de grafia (onomástico,
       nome civil em minúsculas, etc.) antes de cair no campo "foto" do JSON. */
    function acharFoto(fotosUf, c) {
      if (!fotosUf) return '';
      const variacoes = [
        c.nomeUrna, c.nome,
        c.nomeUrna ? c.nomeUrna.charAt(0) + c.nomeUrna.slice(1).toLowerCase() : '',
        c.nome ? c.nome.charAt(0) + c.nome.slice(1).toLowerCase() : ''
      ].filter(Boolean);
      for (const v of variacoes) {
        if (fotosUf[v]) return fotosUf[v];
      }
      return c.foto || '';
    }

    function htmlCandidato(c, ufUpper, idx) {
      const fotosUf = fotosData.governadores && fotosData.governadores[ufUpper] || {};
      const fotoUrl = acharFoto(fotosUf, c);
      const ini = iniciais(c.nome);
      const nomeEsc = String(c.nome || '').replace(/"/g, '&quot;');

      const fotoHtml = fotoUrl
        ? '<img class="g2-cand-foto" src="' + fotoUrl + '" alt="' + nomeEsc + '" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'g2-cand-foto g2-cand-foto-fallback\',textContent:\'' + ini + '\'}))">'
        : '<div class="g2-cand-foto g2-cand-foto-fallback">' + ini + '</div>';

      const pct = c.percentual || 0;
      const pctHtml = pct
        ? '<div class="g2-cand-pct">' + pct.toFixed(1).replace('.', ',') + '%<small>1º turno</small></div>'
        : '<div class="g2-cand-pct">—<small>1º turno</small></div>';

      // Barra de apoio (mesmo formato do endpoint /api/turno)
      const candId = '2T-' + ufUpper + '-' + (idx + 1);
      const apoioInfo = (apoioData.porCandidato || []).find(function(p) { return p.candidateId === candId; });
      const apoioCount = apoioInfo ? apoioInfo.total : 0;
      const apoioTotal = apoioData.total || 0;
      const apoioPct = apoioTotal > 0 ? Math.round(apoioCount / apoioTotal * 100) : 0;

      const apoioHtml = apoioTotal > 0 ? `
        <div class="g2-apoio">
          <div class="g2-apoio-label">
            <span class="g2-apoio-count" id="gov-apoio-count-${candId}">${apoioCount} apoio${apoioCount !== 1 ? 's' : ''}</span>
            <span class="g2-apoio-pct" id="gov-apoio-pct-${candId}">${apoioPct}%</span>
          </div>
          <div class="g2-apoio-track"><div class="g2-apoio-fill" id="gov-apoio-barra-${candId}" style="width:${apoioPct}%"></div></div>
        </div>` : '';

      const nomeApoio = String(c.nome || '').replace(/'/g, "\\'");
      const botaoApoio = (typeof BACKEND_OK !== 'undefined' && BACKEND_OK)
        ? `<button class="g2-apoiar" type="button" onclick="apoiarTurno('${candId}','${nomeApoio}')"><i class="fa-solid fa-hand"></i> Apoiar</button>`
        : '';

      return `
        <div class="g2-cand">
          ${fotoHtml}
          <p class="g2-cand-nome">${nomeEsc}</p>
          <span class="g2-cand-partido">${c.partido || '—'}${c.numero ? ' · ' + c.numero : ''}</span>
          ${pctHtml}
          ${apoioHtml}
          ${botaoApoio}
        </div>`;
    }

    const cards = estados2turno.map(function(estado) {
      const ufUpper = estado.uf || '';
      const candidatos = estado.candidatos_2turno || [];
      const duelo = candidatos.map(function(c, i) { return htmlCandidato(c, ufUpper, i); }).join('');

      // Pesquisa mais recente do estado (resumo no rodapé do card)
      const pesquisaEst = pesqData.pesquisas && pesqData.pesquisas[estado.uf ? estado.uf.toLowerCase() : ''];
      let peep = '';
      if (pesquisaEst && pesquisaEst.institutos && pesquisaEst.institutos.length > 0) {
        const p = pesquisaEst.institutos[0];
        peep = '<small><i class="fa-solid fa-chart-simple"></i> ' + (p.instituto || 'pesquisa') + ' · ' + (p.data || '') + '</small>';
      } else {
        peep = '<small>Percentuais do 1º turno (TSE)</small>';
      }

      return `
        <article class="g2-card">
          <header class="g2-head">
            <span class="g2-uf">${ufUpper}</span>
            <div class="g2-titulo">
              <h3>${estado.nome}</h3>
              <small>Disputa o 2º turno</small>
            </div>
          </header>
          <div class="g2-duelo">${duelo}</div>
          <footer class="g2-foot">
            ${peep}
            <a class="g2-link" href="pages/resultados-2026.html"><i class="fa-solid fa-chart-column"></i> Resultados</a>
          </footer>
        </article>`;
    }).join('');

    grid.innerHTML = cards;

    console.log('[home-2026] Grid de governadores 2º turno renderizado (' + estados2turno.length + ' estados)');
  }

  // ===== INICIALIZAR =====
  function init() {
    console.log('[home-2026] Inicializando módulos da home');
    console.log('[home-2026] DOM readyState:', document.readyState);
    
    // Verificar se os elementos existem
    const seletorPesquisa = document.getElementById('seletor-pesquisa');
    const gridGovernadores = document.getElementById('governadores-2turno-grid');

    console.log('[home-2026] Elementos no DOM:');
    console.log('  - #seletor-pesquisa:', seletorPesquisa ? 'SIM' : 'NÃO');
    console.log('  - #governadores-2turno-grid:', gridGovernadores ? 'SIM' : 'NÃO');
    
    carregarPesquisasPresidente();
    carregarGovernadores();
  }

  if (document.readyState === 'loading') {
    console.log('[home-2026] DOM ainda carregando, aguardando DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', init);
  } else {
    console.log('[home-2026] DOM já pronto, inicializando imediatamente');
    init();
  }
})();
