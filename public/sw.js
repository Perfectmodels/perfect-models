const STATIC_CACHE = 'pmm-static-next-v2';
const DYNAMIC_CACHE = 'pmm-dynamic-next-v2';
const STATIC_ASSETS = ['/', '/logopmm.jpg', '/logo.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, DYNAMIC_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!['http:', 'https:'].includes(url.protocol)) return;

  if (request.mode === 'navigate' || url.pathname.startsWith('/api/') || url.hostname.includes('firebaseio.com')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && request.mode === 'navigate') {
            const copy = response.clone();
            event.waitUntil(caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, copy)));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/'))),
    );
    return;
  }

  if (/\.(?:png|jpg|jpeg|webp|svg|gif|ico)$/i.test(url.pathname) || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, copy)));
          }
          return response;
        });
      }),
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
