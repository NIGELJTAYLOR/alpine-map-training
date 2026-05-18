/**
 * Alpine Map Training service worker.
 *
 * Strategy:
 *   - Document navigations: network-first, cache the response on success,
 *     fall back to the cached copy when offline, fall back to /~offline
 *     when neither is available.
 *   - Static assets (Next.js _next/static, fonts, SVGs, images): cache-first.
 *     Next hashes asset filenames, so a new deploy gets new URLs and the old
 *     ones quietly age out.
 *   - Other GETs: stale-while-revalidate.
 *
 * Bump CACHE_VERSION when we ship a meaningful change that needs to evict
 * the runtime cache. Static-asset cache evicts itself by URL change.
 */

const CACHE_VERSION = "v2";
const RUNTIME_CACHE = `amt-runtime-${CACHE_VERSION}`;
const STATIC_CACHE = `amt-static-${CACHE_VERSION}`;
const OFFLINE_URL = "/~offline";
const SHELL = ["/", "/~offline", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      // Best-effort precache the shell. Don't fail install if a single URL is missing.
      await Promise.allSettled(SHELL.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.endsWith(`-${CACHE_VERSION}`))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/diagrams/") ||
    url.pathname.startsWith("/static/") ||
    // Companion manual: cache the entire static HTML edition so it
    // opens offline. Pages, images, CSS and the PDF are all served from
    // here. Cache-first so refreshes don't hit the network unnecessarily.
    url.pathname.startsWith("/companion-manual/") ||
    /\.(html|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|otf|eot|css|js|map|pdf)$/i.test(
      url.pathname,
    )
  );
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.status === 200) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.destination === "document") {
      const offline = await cache.match(OFFLINE_URL);
      if (offline) return offline;
    }
    throw new Error("Offline and no cached response.");
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && fresh.status === 200) {
    cache.put(request, fresh.clone());
  }
  return fresh;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((fresh) => {
      if (fresh && fresh.status === 200) {
        cache.put(request, fresh.clone());
      }
      return fresh;
    })
    .catch(() => undefined);
  return cached ?? (await fetchPromise) ?? Promise.reject(new Error("offline"));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // We don't intercept POST/PUT/etc. or non-GET requests.
  if (request.method !== "GET") return;

  // Skip cross-origin (e.g. Google Fonts CDN, Vercel analytics) — let the
  // browser handle them with its own cache.
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Document / navigation: network-first with offline fallback.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets: cache-first.
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else: stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(request));
});

// Allow the page to ask the SW to skip waiting and activate immediately.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
