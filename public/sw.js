// Service Worker do GiGaGym PWA
// Estrategia: cache first para assets e network first para navegacao

const SCOPE_PATH = new URL(self.registration.scope).pathname;
const BASE_PATH = SCOPE_PATH === '/' ? '' : SCOPE_PATH.replace(/\/$/, '');
const CACHE_NAME = 'GiGaGym-v4';

function withBase(path) {
  return `${BASE_PATH}${path}`;
}

const STATIC_ASSETS = [
  withBase('/'),
  withBase('/index.html'),
  withBase('/manifest.json'),
  withBase('/icons/icon-72x72.png'),
  withBase('/icons/icon-96x96.png'),
  withBase('/icons/icon-128x128.png'),
  withBase('/icons/icon-144x144.png'),
  withBase('/icons/icon-152x152.png'),
  withBase('/icons/icon-192x192.png'),
  withBase('/icons/icon-384x384.png'),
  withBase('/icons/icon-512x512.png'),
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(withBase('/index.html'), networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => caches.match(withBase('/index.html')))
    );
    return;
  }

  const isStaticAsset =
    url.pathname.includes('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.json');

  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
            }
          })
          .catch(() => {});

        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
        }
        return networkResponse;
      });
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    event.waitUntil(Promise.resolve());
  }
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Hora do treino!',
    icon: withBase('/icons/icon-192x192.png'),
    badge: withBase('/icons/icon-72x72.png'),
    vibrate: [100, 50, 100],
    data: { url: withBase('/') },
    actions: [
      { action: 'open', title: 'Abrir app' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
  };

  event.waitUntil(self.registration.showNotification('GiGaGym', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data?.url || withBase('/')));
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
