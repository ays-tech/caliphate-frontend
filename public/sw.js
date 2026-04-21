// ── Cache names — bump version to force SW update ─────────────────────
const CACHE_VERSION = 'makhtaba-v4';
const API_CACHE     = 'makhtaba-api-v4';
const IMG_CACHE     = 'makhtaba-img-v4';

// Assets to pre-cache immediately on install
const PRECACHE = [
  '/',
  '/books',
  '/scholars',
  '/about',
  '/contact',
  '/offline.html',
  '/manifest.json',
];

// ── Install ────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE).catch(() => {}))
      // Don't wait for old SW to become inactive — take over immediately
      .then(() => self.skipWaiting())
  );
});

// ── Activate — purge all old cache versions ────────────────────────────
self.addEventListener('activate', (event) => {
  const keep = [CACHE_VERSION, API_CACHE, IMG_CACHE];
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // take control of all open tabs
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Only handle same-origin + known cross-origin (media images)
  const isSameOrigin = url.origin === self.location.origin;
  const isMedia      = url.hostname === 'api.lo9in.com' ||
                       url.hostname.includes('r2.dev') ||
                       url.hostname.includes('cloudflarestorage.com');
  if (!isSameOrigin && !isMedia) return;

  // ── 1. API calls — network first, SHORT timeout, fall back to cache ──
  //    Public list endpoints: books, scholars, events
  //    These should always show fresh data. Cache is only for offline.
  if (isSameOrigin && url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(req, API_CACHE, 4000));
    return;
  }

  // ── 2. Images (scholar photos, book covers) — cache first ────────────
  //    Images rarely change. Serve from cache, update in background.
  const isImage = req.destination === 'image' ||
                  url.pathname.includes('/media/') ||
                  url.pathname.includes('/uploads/') ||
                  isMedia;
  if (isImage) {
    event.respondWith(cacheFirst(req, IMG_CACHE));
    return;
  }

  // ── 3. Page navigation — NETWORK FIRST ────────────────────────────────
  //    This is the key fix for stale data. Always try network first.
  //    Only use cache if genuinely offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            caches.open(CACHE_VERSION)
              .then((cache) => cache.put(req, res.clone()))
              .catch(() => {});
          }
          return res;
        })
        .catch(async () => {
          // Offline: try cached page, then cached homepage, then offline page
          const cached = await caches.match(req) ||
                         await caches.match('/') ||
                         await caches.match('/offline.html');
          return cached || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // ── 4. Static assets (JS, CSS, fonts) — stale-while-revalidate ────────
  //    Serve from cache immediately, update cache in background.
  //    Next.js assets have content-hashed filenames so stale is safe.
  event.respondWith(staleWhileRevalidate(req, CACHE_VERSION));
});

// ── Cache strategies ───────────────────────────────────────────────────

// Network first with timeout — if network is slow, fall back to cache
async function networkFirst(req, cacheName, timeoutMs) {
  const cache      = await caches.open(cacheName);
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(req, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) cache.put(req, res.clone()).catch(() => {});
    return res;
  } catch {
    clearTimeout(timeoutId);
    const cached = await cache.match(req);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: 'Offline', cached: false }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Cache first — serve cached immediately, fetch in background to update
async function cacheFirst(req, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) {
    // Update cache in background
    fetch(req).then((res) => {
      if (res.ok) cache.put(req, res.clone()).catch(() => {});
    }).catch(() => {});
    return cached;
  }
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone()).catch(() => {});
    return res;
  } catch {
    return new Response('Image not available offline', { status: 503 });
  }
}

// Stale-while-revalidate — serve cache, update in background
async function staleWhileRevalidate(req, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);

  const fetchPromise = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone()).catch(() => {});
    return res;
  }).catch(() => null);

  return cached || (await fetchPromise) ||
    new Response('Offline', { status: 503 });
}

// ── Push notifications ─────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); }
  catch { data = { title: 'CaliphateMakhtaba', body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title || 'CaliphateMakhtaba', {
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
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) client.navigate(targetUrl);
            return;
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      })
  );
});

// ── Auto-update subscription when browser rotates keys ────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly:      true,
        applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
      })
      .then((sub) =>
        fetch('/api/push/subscribe', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(sub),
        })
      )
      .catch(() => {})
  );
});


// ── Handle SKIP_WAITING message from the update toast ─────────────────
// When user taps "Update now", we tell the waiting SW to take over
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
