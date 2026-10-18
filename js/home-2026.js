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

    function renderizar(valor) {
      console.log('[home-2026] Renderizando pesquisa para:', valor);
      
      const pesquisa = pesquisasData.pesquisas.find(p => p.instituto.toLowerCase() === valor);
      
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

      const partidoMap = {
        'Flávio Bolsonaro': { partido: 'PL', cor: 'azul' },
        'Lula': { partido: 'PT', cor: 'vermelho' }
      };

      const barrasHtml = listaCandidatos.map(function(nome) {
        const info = partidoMap[nome] || { partido: '', cor: '' };
        const pct = espont[nome];
        return `
          <div class="pesquisa-barra-item">
            <div class="pesquisa-barra-topo">
              <div class="pesquisa-barra-nome">
                ${nome} <small>${info.partido}</small>
              </div>
              <div class="pesquisa-barra-percent">${pct}%</div>
            </div>
            <div class="pesquisa-barra-track">
              <div class="pesquisa-barra-fill" style="width:${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');

      const indecisosHtml = indecisos > 0 ? `
        <div class="pesquisa-barra-item">
          <div class="pesquisa-barra-topo">
            <div class="pesquisa-barra-nome">Indecisos / Brancos / Nulos</div>
            <div class="pesquisa-barra-percent">${indecisos}%</div>
          </div>
          <div class="pesquisa-barra-track">
            <div class="pesquisa-barra-fill" style="width:${indecisos}%;background:linear-gradient(90deg,#5A6E8E,#8A9BA7)"></div>
          </div>
        </div>
      ` : '';

      const vv = pesquisa.votos_validos || {};
      const vvHtml = Object.keys(vv).map(function(nome) {
        const info = partidoMap[nome] || { cor: '' };
        return `
          <div class="pesquisa-vv-card ${info.cor}">
            <div class="pesquisa-vv-nome">${nome}</div>
            <div class="pesquisa-vv-percent">${vv[nome]}%</div>
            <div class="pesquisa-vv-label">Votos válidos</div>
          </div>
        `;
      }).join('');

      card.innerHTML = `
        <div class="pesquisa-header">
          <h3 class="pesquisa-instituto">📊 PESQUISA ${pesquisa.instituto.toUpperCase()}</h3>
          <p class="pesquisa-meta">
            <strong>${pesquisa.data}</strong> · Registro TSE: <strong>${pesquisa.registro_tse}</strong><br>
            Amostra: <strong>${pesquisa.amostra ? pesquisa.amostra.toLocaleString('pt-BR') : '—'} entrevistas</strong> · Margem de erro: <strong>±${pesquisa.margem_erro} p.p.</strong>
          </p>
        </div>

        <div class="pesquisa-titulo-secao">Intenções de voto (total)</div>
        <div class="pesquisa-barras">
          ${barrasHtml}
          ${indecisosHtml}
        </div>

        <div class="pesquisa-titulo-secao">Votos válidos (exclui brancos, nulos e indecisos)</div>
        <div class="pesquisa-votos-validos">
          ${vvHtml}
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

  // ===== GOVERNADORES POR ESTADO =====
  async function carregarGovernadores() {
    console.log('[home-2026] Iniciando carregamento de governadores');
    
    const select = document.getElementById('seletor-estado');
    const card = document.getElementById('estado-card');
    
    if (!select) {
      console.error('[home-2026] ERRO: Elemento #seletor-estado não encontrado no DOM');
      return;
    }
    if (!card) {
      console.error('[home-2026] ERRO: Elemento #estado-card não encontrado no DOM');
      return;
    }

    console.log('[home-2026] Elementos encontrados, buscando dados...');

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
      
      console.log('[home-2026] Dados de governadores carregados:', govData);
      console.log('[home-2026] Número de estados:', Object.keys(govData.estados || {}).length);
      
    } catch (err) {
      console.error('[home-2026] ERRO ao carregar governadores:', err);
      card.innerHTML = '<div class="pesquisa-vazio"><i class="fa-solid fa-circle-exclamation"></i><p>Erro ao carregar dados de governadores: ' + err.message + '</p></div>';
      return;
    }

    if (!govData.estados || Object.keys(govData.estados).length === 0) {
      console.error('[home-2026] ERRO: Nenhum estado encontrado nos dados');
      card.innerHTML = '<div class="pesquisa-vazio"><p>Dados de governadores indisponíveis.</p></div>';
      return;
    }

    // Popular o select com os estados (ordenados alfabeticamente)
    const estados = Object.entries(govData.estados).sort(function(a, b) { 
      return a[1].nome.localeCompare(b[1].nome); 
    });
    
    console.log('[home-2026] Populando select com', estados.length, 'estados');
    
    select.innerHTML = '<option value="">— Escolha um estado —</option>' +
      estados.map(function(entry) {
        const uf = entry[0];
        const dados = entry[1];
        const situacao = dados.situacao === '2º turno' ? '🔁' : '✅';
        return '<option value="' + uf + '">' + situacao + ' ' + dados.nome + '</option>';
      }).join('');

    console.log('[home-2026] Select populado com sucesso');

    async function renderizar(uf) {
      console.log('[home-2026] Renderizando estado:', uf);

      if (!uf) {
        card.innerHTML = `
          <div class="estado-placeholder">
            <i class="fa-solid fa-hand-pointer"></i>
            <p>Selecione um estado acima para ver os candidatos e pesquisas</p>
          </div>
        `;
        return;
      }

      const estado = govData.estados[uf];
      if (!estado) {
        console.error('[home-2026] ERRO: Estado não encontrado:', uf);
        card.innerHTML = '<div class="pesquisa-vazio"><p>Estado não encontrado: ' + uf + '</p></div>';
        return;
      }

      console.log('[home-2026] Estado encontrado:', estado.nome, 'Situação:', estado.situacao);

      if (estado.situacao === '1º turno') {
        // Eleito no 1º turno
        const eleito = estado.eleito;
        if (!eleito) {
          console.warn('[home-2026] Sem dados do eleito para:', estado.nome);
          card.innerHTML = '<div class="pesquisa-vazio"><p>Dados não disponíveis para ' + estado.nome + '.</p></div>';
          return;
        }
        
        // Buscar foto do eleito
        const ufUpper = uf.toUpperCase();
        const fotosUf = fotosData.eleitos_1_turno && fotosData.eleitos_1_turno[ufUpper];
        const fotoUrl = fotosUf && fotosUf[eleito.nome] || '';
        const iniciais = (eleito.nome || '?').trim().split(/\s+/).slice(0,2).map(w => w[0] || '').join('').toUpperCase();
        const fotoHtml = fotoUrl 
          ? '<img class="estado-eleito-foto" src="' + fotoUrl + '" alt="' + eleito.nome + '" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'estado-eleito-foto estado-eleito-foto-placeholder\',textContent:\'' + iniciais + '\'}))">'
          : '<div class="estado-eleito-foto estado-eleito-foto-placeholder">' + iniciais + '</div>';
        
        const votosHtml = eleito.votos ? '<p class="estado-eleito-votos">' + eleito.votos.toLocaleString('pt-BR') + ' votos válidos</p>' : '';
        const obsHtml = eleito.observacao ? '<p class="estado-eleito-obs"><small>' + eleito.observacao + '</small></p>' : '';
        
        // Barra de progresso para o percentual
        const pct = eleito.percentual || 0;
        const barraHtml = pct > 0 ? `
          <div class="estado-eleito-barra">
            <div class="pesquisa-barra-track">
              <div class="pesquisa-barra-fill" style="width:${pct}%"></div>
            </div>
          </div>
        ` : '';
        
        card.innerHTML = `
          <div class="estado-resultado">
            <span class="estado-situacao">✅ ELEITO NO 1º TURNO</span>
            <h3 class="estado-nome">${estado.nome}</h3>
            <div class="estado-eleito-box">
              ${fotoHtml}
              <div class="estado-eleito-icone"><i class="fa-solid fa-trophy"></i></div>
              <h4 class="estado-eleito-nome">${eleito.nome_completo || eleito.nome}</h4>
              <p class="estado-eleito-partido">${eleito.partido} · Nº ${eleito.numero || '—'}</p>
              <div class="estado-eleito-destaque">${pct ? pct.toFixed(2) + '%' : '—'}</div>
              ${barraHtml}
              ${votosHtml}
              ${obsHtml}
            </div>
          </div>
        `;
        
        console.log('[home-2026] Eleito no 1º turno renderizado');
        
      } else {
        // 2º turno
        const top2 = estado.candidatos_2turno || [];
        console.log('[home-2026] Candidatos no 2º turno:', top2.length);

        // Buscar fotos dos candidatos
        const ufUpper = uf.toUpperCase();
        const fotosUf = fotosData.governadores && fotosData.governadores[ufUpper] || {};

        // Obter dados de apoio do backend (se disponível)
        let apoioData = { total: 0, porCandidato: [] };
        try {
          const ar = await fetch('/api/turno');
          if (ar.ok) {
            const aj = await ar.json();
            if (aj && aj.ok) apoioData = aj;
          }
        } catch (e) { /* silently ignore */ }

        const candidatosHtml = top2.map(function(c, i) {
          const votosHtml = c.votos ? '<span class="estado-candidato-abs">' + c.votos.toLocaleString('pt-BR') + ' votos</span>' : '';
          const pct = c.percentual || 0;
          const pctHtml = pct ? '<div class="estado-candidato-percent">' + pct.toFixed(1) + '%</div>' : '';

          // Buscar foto do candidato (tenta múltiplas variações de nome)
          const nomeBusca = [c.nomeUrna, c.nome, c.nomeUrna ? c.nomeUrna.charAt(0) + c.nomeUrna.slice(1).toLowerCase() : '', c.nome ? c.nome.charAt(0) + c.nome.slice(1).toLowerCase() : ''];
          let fotoUrl = '';
          for (const nb of nomeBusca) {
            if (nb && fotosUf[nb]) { fotoUrl = fotosUf[nb]; break; }
          }
          // Fallback: foto direta do candidato no JSON de segundo turno
          if (!fotoUrl && c.foto) fotoUrl = c.foto;
          const iniciais = (c.nome || '?').trim().split(/\s+/).slice(0,2).map(w => w[0] || '').join('').toUpperCase();
          const fotoHtml = fotoUrl
            ? '<img class="estado-candidato-foto" src="' + fotoUrl + '" alt="' + c.nome + '" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'estado-candidato-foto estado-candidato-foto-placeholder\',textContent:\'' + iniciais + '\'}))">'
            : '<div class="estado-candidato-foto estado-candidato-foto-placeholder">' + iniciais + '</div>';

          // Determinar o candidateId para este governador (formato: 2T-{UF}-{1|2})
          const candId = '2T-' + ufUpper + '-' + (i + 1);
          const apoioInfo = (apoioData.porCandidato || []).find(p => p.candidateId === candId);
          const apoioCount = apoioInfo ? apoioInfo.total : 0;
          const apoioTotal = apoioData.total || 0;
          const apoioPct = apoioTotal > 0 ? Math.round(apoioCount / apoioTotal * 100) : 0;

          // Barra de progresso de apoio
          const apoioBarraHtml = apoioTotal > 0 ? `
            <div class="apoio-barra-wrap" style="margin-top:4px">
              <div class="apoio-barra-label">
                <span class="apoio-barra-count" id="gov-apoio-count-${candId}">${apoioCount} apoio${apoioCount !== 1 ? 's' : ''}</span>
                <span class="apoio-barra-pct" id="gov-apoio-pct-${candId}">${apoioPct}%</span>
              </div>
              <div class="apoio-barra-track"><div class="apoio-barra-fill" id="gov-apoio-barra-${candId}" style="width:${apoioPct}%"></div></div>
            </div>
          ` : '';

          // Botão de apoio (só aparece se houver backend)
          const apoioBtn = (typeof BACKEND_OK !== 'undefined' && BACKEND_OK) ?
            `<button class="btn sm gold" onclick="apoiarTurno('${candId}','${c.nome.replace(/'/g, "\\'")}')"><i class="fa-solid fa-hand"></i> Apoiar</button>` : '';

          return `
          <div class="estado-candidato ${i === 0 ? 'primeiro' : ''}" style="display:flex;align-items:center;gap:14px;padding:14px">
            <div style="flex:none">${fotoHtml}</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                <div style="flex:1">
                  <p class="estado-candidato-nome" style="margin:0 0 2px 0">${c.nome}</p>
                  <p class="estado-candidato-partido" style="margin:0">${c.partido}</p>
                </div>
                <div class="estado-candidato-percent" style="font:900 20px Montserrat;color:var(--gold)">${pctHtml || ''}</div>
              </div>
              ${apoioBarraHtml}
            </div>
            <div style="flex:none;display:flex;gap:8px">
              ${apoioBtn}
            </div>
          </div>
        `;
        }).join('');

        // Pesquisar se há pesquisa deste estado
        const pesquisaEst = pesqData.pesquisas && pesqData.pesquisas[uf];
        let pesquisaHtml = '';
        
        if (pesquisaEst && pesquisaEst.institutos && pesquisaEst.institutos.length > 0) {
          console.log('[home-2026] Pesquisa encontrada para', uf);
          const p = pesquisaEst.institutos[0];
          const esp = p.espontanea || {};
          const nomes = Object.keys(esp).filter(function(n) { 
            return !n.includes('Indeciso') && !n.includes('Brancos') && !n.includes('Nulos') && !n.includes('Nenhum');
          });

          pesquisaHtml = `
            <div style="margin-top:32px;padding-top:28px;border-top:1px dashed rgba(255,215,0,0.2)">
              <div class="disclaimer-pesquisa">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <div><strong>ATENÇÃO:</strong> Pesquisa de opinião para o 2º turno. Não representa votos reais.</div>
              </div>
              <div class="pesquisa-header" style="text-align:left">
                <h3 class="pesquisa-instituto" style="font-size:20px">📊 Pesquisa ${p.instituto}</h3>
                <p class="pesquisa-meta">${p.data} · Registro TSE: <strong>${p.registro_tse}</strong> · Amostra: <strong>${p.amostra ? p.amostra.toLocaleString('pt-BR') : '—'}</strong> · Margem: <strong>±${p.margem_erro} p.p.</strong></p>
              </div>
              <div class="pesquisa-barras" style="margin-top:18px">
                ${nomes.map(function(nome) {
                  var pct = esp[nome];
                  return `
                    <div class="pesquisa-barra-item">
                      <div class="pesquisa-barra-topo">
                        <div class="pesquisa-barra-nome">${nome}</div>
                        <div class="pesquisa-barra-percent">${pct}%</div>
                      </div>
                      <div class="pesquisa-barra-track">
                        <div class="pesquisa-barra-fill" style="width:${pct}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        } else {
          console.log('[home-2026] Sem pesquisa para', uf);
        }

        card.innerHTML = `
          <div class="estado-resultado">
            <span class="estado-situacao segundo-turno">🔁 DISPUTA NO 2º TURNO</span>
            <h3 class="estado-nome">${estado.nome}</h3>
            <div class="estado-candidatos">
              ${candidatosHtml}
            </div>
            ${pesquisaHtml}
          </div>
        `;
        
        console.log('[home-2026] 2º turno renderizado');
      }
    }

    select.addEventListener('change', function (e) { 
      console.log('[home-2026] Select de estado mudou para:', e.target.value);
      renderizar(e.target.value); 
    });
    
    console.log('[home-2026] Governadores inicializado com sucesso');
  }

  // ===== INICIALIZAR =====
  function init() {
    console.log('[home-2026] Inicializando módulos da home');
    console.log('[home-2026] DOM readyState:', document.readyState);
    
    // Verificar se os elementos existem
    const seletorPesquisa = document.getElementById('seletor-pesquisa');
    const seletorEstado = document.getElementById('seletor-estado');
    
    console.log('[home-2026] Elementos no DOM:');
    console.log('  - #seletor-pesquisa:', seletorPesquisa ? 'SIM' : 'NÃO');
    console.log('  - #seletor-estado:', seletorEstado ? 'SIM' : 'NÃO');
    
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
