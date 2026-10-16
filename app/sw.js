const CACHE = 'meuvoto-app-v6-conferir-api';
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon.png',
  '/favicon.ico'
];

// Install event - cache only static assets (NOT HTML)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url => c.add(url).catch(err => console.warn('[SW] Falha ao cachear:', url, err)))
      );
    })
  );
  self.skipWaiting();
});

// Activate event - clear ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[SW] Removendo cache antigo:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

// Fetch event - NETWORK FIRST for HTML, cache-first for static assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // HTML pages: ALWAYS network first (never serve stale HTML)
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '/app' || url.pathname === '/app/') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // Update cache with fresh copy
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => {
          // Fallback: try cache, then offline page
          return caches.match(e.request).then(cached => {
            return cached || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // API calls: ALWAYS network, never cache
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Static assets (CSS, JS, images): cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      });
    })
  );
});

// ==========================================
// Push notifications (ciclo 33)
// ==========================================

self.addEventListener('push', e => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch (err) {
    data = { title: e.data ? e.data.text() : 'MeuVoto' };
  }

  const title = data.title || 'MeuVoto · Atualização';
  const options = {
    body: data.body || 'Você tem uma nova notificação.',
    icon: data.icon || '/icon.png',
    badge: data.badge || '/icon.png',
    vibrate: data.vibrate || [200, 100, 200],
    tag: data.tag || 'meuvoto-notification',
    renoteify: !!data.renotify,
    data: data.data || { url: '/' },
    actions: data.actions || []
  };

  e.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const targetUrl = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil(
    Promise.all([
      fetch('/api/push/vapid-public').then(r => r.ok ? r.json() : null).catch(() => null),
      self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: null
      }).catch(() => null)
    ]).then(async ([vapid, sub]) => {
      if (!vapid || !vapid.publicKey) return;
      const newSub = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid.publicKey)
      });
      return fetch('/api/digest/subscribe-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub.toJSON())
      });
    })
  );
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = self.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
