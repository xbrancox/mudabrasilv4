/* MudaBrasil — widget-icm.js · Widget embeddável do ICM para portais e imprensa (B2)
   Uso:  <div data-mb-icm="maria"></div>
         <script src="https://mudabrasil.com.br/widget-icm.js"></script>
   Sem dependências. Renderiza card com saldo ICM + crédito + link. */
(function () {
  'use strict';
  var BASE = (document.currentScript && document.currentScript.src || '').replace(/widget-icm\.js.*$/, '');
  var CORES = { alto: '#00E5C9', medio: '#D4AF37', baixo: '#FF6B6B' };
  function cor(v) { return v >= 60 ? CORES.alto : v >= 40 ? CORES.medio : CORES.baixo; }
  function card(p) {
    return '' +
      '<a href="' + BASE + 'index.html#radar" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:12px;' +
      'font-family:Manrope,system-ui,sans-serif;text-decoration:none;background:#0B132B;color:#EAF0F7;' +
      'border:1px solid #243052;border-radius:14px;padding:14px 18px;box-shadow:0 8px 24px rgba(0,0,0,.25)">' +
      '<span style="font:900 34px Montserrat,sans-serif;color:' + cor(p.icm) + '">' + p.icm + '</span>' +
      '<span style="line-height:1.25">' +
      '<span style="display:block;font-weight:800;font-size:14px">' + p.nome + '</span>' +
      '<span style="display:block;font-size:11.5px;color:#93A4B8">' + p.cargo + ' · ICM ' + p.icm + '/100 · ±' +
      (1 / Math.sqrt(p.n || 1)).toFixed(1) + '</span>' +
      '<span style="display:block;font-size:10.5px;color:#00E5C9;margin-top:3px">fonte: MudaBrasil · mudabrasil.com.br</span>' +
      '</span></a>';
  }
  function montar() {
    var alvos = document.querySelectorAll('[data-mb-icm]');
    if (!alvos.length) return;
    fetch(BASE + 'api/icm.json', { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        Array.prototype.forEach.call(alvos, function (el) {
          var p = (j.politicos || []).filter(function (x) { return x.id === el.getAttribute('data-mb-icm'); })[0];
          if (p) { el.innerHTML = card(p); var l = el.querySelector('a'); if (l) l.href = BASE + 'index.html#radar'; }
          else el.innerHTML = '<a href="' + BASE + '" style="font:600 12px Manrope,sans-serif;color:#93A4B8">ICM não encontrado · mudabrasil.com.br</a>';
        });
      })
      .catch(function () {
        Array.prototype.forEach.call(alvos, function (el) {
          el.innerHTML = '<span style="font:600 12px Manrope,sans-serif;color:#93A4B8">MudaBrasil ICM indisponível agora</span>';
        });
      });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
