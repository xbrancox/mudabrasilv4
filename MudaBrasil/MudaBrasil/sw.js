/* MudaBrasil — sw.js v3 · PWA offline
   Estratégia: shell cache-first (app funciona offline, inclusive a cédula — localStorage não
   depende de rede) · APIs (notícias/PLs) network-first com fallback pro cache. */
const VERSAO = 'mb-v3.0.0';
const SHELL = [
  './', './index.html', './app/index.html', './conferir.html', './verificar.html',
  './config.js', './core.js', './tokens.css', './icon.svg', './manifest.webmanifest', './robots.txt',
  './api/icm.json', './widget-icm.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // CDNs/APIs externas: browser decide
  const ehApi = url.pathname.includes('/api/') || url.hostname.includes('rss2json') || url.hostname.includes('camara.leg');
  if (ehApi) {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(VERSAO).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { const cp = r.clone(); caches.open(VERSAO).then(c => c.put(e.request, cp)); return r; })));
  }
});
