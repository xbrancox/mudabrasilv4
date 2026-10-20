/* ==========================================================================
   EXPLORE O MEUVOTO — mini cards das páginas do site
   --------------------------------------------------------------------------
   Os cards NÃO são escritos à mão no HTML: são montados a partir do catálogo
   de páginas do cabeçalho (js/site-header.js → window.MB_PAGINAS). Cada card
   mostra o nome da página, um resumo em linguagem simples do que existe lá
   e um link que leva direto para ela.

   Se o cabeçalho não carregar, a seção fica vazia (sem card quebrado).
   ========================================================================== */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function cardDe(item, href) {
    var icone = '<i class="fa-solid ' + esc(item.icone || 'fa-circle-info') + '"></i>';
    /* O contador só aparece quando o backend responde (id preenchido por
       index.html → carregaExploreStats). Enquanto isso, o selo fica oculto. */
    var selo = item.stat
      ? '<span class="xpc-stat" id="' + esc(item.stat) + '"></span>'
      : '';
    return '<a class="xpc ac-' + esc(item.tom || 'gold') + '" href="' + esc(href) + '">' +
      '<span class="xpc-ic">' + icone + '</span>' +
      '<span class="xpc-t">' + esc(item.rotuloCard || item.rotulo) + '</span>' +
      '<span class="xpc-d">' + esc(item.resumo || '') + '</span>' +
      '<span class="xpc-foot">' +
        '<span class="xpc-cta">' + esc(item.cta || 'Abrir') +
          ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>' +
        selo +
      '</span>' +
    '</a>';
  }

  function render() {
    var grid = document.getElementById('explore-grid');
    if (!grid) return;

    var api = window.MB_PAGINAS;
    if (!api || !api.itens || !api.itens.length) {
      grid.innerHTML = '<p class="muted">Não foi possível carregar as páginas agora. Use o menu do topo para navegar.</p>';
      return;
    }

    var cards = api.itens.filter(function (it) { return it.card && it.resumo; });
    grid.innerHTML = cards.map(function (it) {
      return cardDe(it, api.href(it.chave));
    }).join('');

    /* Contadores ao vivo (votos, revogações, PLs, parlamentares). */
    if (typeof window.carregaExploreStats === 'function') {
      try { window.carregaExploreStats(); } catch (e) { /* silencioso */ }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
