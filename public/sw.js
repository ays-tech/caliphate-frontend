const CACHE_VERSION = 'makhtaba-v3';
const API_CACHE     = 'makhtaba-api-v3';
const IMG_CACHE     = 'makhtaba-img-v3';

// Pages and assets to pre-cache on install
const PRECACHE = [
  '/',
  '/books',
  '/scholars',
  '/about',
  '/contact',
  '/manifest.json',
  '/offline.html',
];

// ── Install ───────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.addAll(PRECACHE).catch(() => {})
    )
  );
  self.skipWaiting();
});

// ── Activate — purge old caches ───────────────────────────────────────
self.addEventListener('activate', (event) => {
  const keep = [CACHE_VERSION, API_CACHE, IMG_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch strategy ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== 'GET') return;

  // Cross-origin: only handle media images from api.lo9in.com and R2
  const isSameOrigin = url.origin === self.location.origin;
  const isMedia      = url.hostname === 'api.lo9in.com' || url.hostname.includes('r2.dev') || url.hostname.includes('cloudflarestorage.com');
  if (!isSameOrigin && !isMedia) return;

  // ── API calls: network-first, 5s timeout, fall back to cached ──────
  if (url.pathname.startsWith('/api/') && isSameOrigin) {
    event.respondWith(networkFirstWithTimeout(req, API_CACHE, 5000));
    return;
  }

  // ── Images (scholar photos, book covers from backend/R2): cache-first
  const isImage = req.destination === 'image' || url.pathname.includes('/media/') || isMedia;
  if (isImage) {
    event.respondWith(cacheFirst(req, IMG_CACHE));
    return;
  }

  // ── Navigation (pages): network-first, fall back to cache or offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cached = await caches.match(req) || await caches.match('/');
        return cached || caches.match('/offline.html');
      })
    );
    return;
  }

  // ── Everything else (JS/CSS/fonts): stale-while-revalidate ─────────
  event.respondWith(staleWhileRevalidate(req, CACHE_VERSION));
});

// ── Cache strategies ──────────────────────────────────────────────────

async function cacheFirst(req, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return new Response('Image not available offline', { status: 503 });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || (await fetchPromise) || new Response('Offline', { status: 503 });
}

async function networkFirstWithTimeout(req, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(req, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    clearTimeout(timeoutId);
    const cached = await cache.match(req);
    return cached || new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ── Push notifications ────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch { data = { title: 'CaliphateMakhtaba', body: event.data.text() }; }

  const options = {
    body:    data.body   || '',
    icon:    data.icon   || '/icons/icon-192.png',
    badge:   data.badge  || '/icons/icon-192.png',
    tag:     data.tag    || 'makhtaba',
    data:    { url: data.url || '/' },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open',    title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'CaliphateMakhtaba', options)
  );
});

// ── Notification click — open the right page ──────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // If app is already open, focus and navigate
      for (const client of clients) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ── Push subscription change (browser auto-rotated the subscription) ──
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
    }).then((sub) =>
      fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(sub),
      })
    ).catch(() => {})
  );
});
