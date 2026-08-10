const STATIC_CACHE = 'pmm-static-next-v3';
const DYNAMIC_CACHE = 'pmm-dynamic-next-v3';
const STATIC_ASSETS = ['/', '/logopmm.jpg', '/logo.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => undefined),
  );
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

async function networkFirst(request, fallbackPath = '/') {
  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET' && request.mode === 'navigate') {
      const copy = response.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, copy);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match(fallbackPath);
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const copy = response.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, copy);
    }
    return response;
  } catch {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!['http:', 'https:'].includes(url.protocol)) return;

  // API and page requests must never be served from stale API caches.
  if (request.mode === 'navigate' || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (/\.(?:png|jpg|jpeg|webp|svg|gif|ico)$/i.test(url.pathname) || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
