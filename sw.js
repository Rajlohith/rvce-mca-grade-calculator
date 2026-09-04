/* ==========================================================================
   sw.js — offline caching for the app shell (HTML pages, CSS, JS, icons),
   while every Firebase Authentication, Firestore and Analytics request —
   and every other cross-origin request — always goes straight to the
   network, completely untouched by this service worker.

   Strategy:
   - Cross-origin requests (Firebase/gstatic, Google Fonts, etc.) are never
     intercepted at all: event.respondWith() is simply never called for
     them, so the browser fetches them exactly as it would with no service
     worker installed. This keeps sign-in, Firestore reads/writes and
     saved-data restoration fully live-network — see the module comment at
     the top of js/firebase-auth.js for why that matters.
   - Same-origin navigations (HTML pages) use network-first: the freshest
     copy is always requested first, matching the "no-cache, must-revalidate"
     Cache-Control already set on HTML pages in firebase.json, falling back
     to the last cached copy of that exact page only if the network is
     unreachable. This is what actually makes a previously visited page
     keep working without a connection.
   - Same-origin static assets (css/js/icons/manifest/pdf/json/images) use
     stale-while-revalidate: a cached copy (if any) is served instantly
     while a background fetch refreshes the cache for next time. Every
     versioned JS/CSS URL already changes its own ?v= query string when its
     content changes (see the <script>/<link> tags in every HTML page), so
     a stale cache entry is only ever served up to that one background
     refresh — never indefinitely.
   ========================================================================== */

const CACHE_VERSION = 'mca-calc-v16';

// Extensions this service worker will cache. Everything same-origin that
// doesn't match this and isn't a page navigation (there currently isn't
// anything else on this site) is left untouched, same as cross-origin.
const STATIC_EXT = /\.(?:css|js|png|jpg|jpeg|svg|ico|webmanifest|pdf|json)$/i;

self.addEventListener('install', (event) => {
  // Immediately activate the new service worker without waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up any old caches from previous versions
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('mca-calc-') && key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* Network-first: try the network for the freshest copy of this exact
   request; fall back to whatever was last cached for it if the network is
   unreachable (offline, DNS failure, etc). Every successful network
   response is cached so that fallback has something to use next time. */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

/* Stale-while-revalidate: serve the cached copy immediately if one exists,
   while always kicking off a background fetch to refresh the cache for the
   next request. Falls through to a plain network fetch the first time a
   given asset is requested (nothing cached for it yet). */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);

  const refresh = fetch(request).then(response => {
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  if (cached) {
    // Update the cache in the background, but don't let a failed refresh
    // (offline, etc.) surface as an unhandled promise rejection.
    refresh.catch(() => {});
    return cached;
  }

  const fresh = await refresh;
  if (fresh) return fresh;
  throw new Error('Network unavailable and nothing cached for ' + request.url);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only ever handle same-origin GET requests. Everything else — every
  // Firebase Authentication, Firestore and Analytics call, Google Fonts,
  // and any other cross-origin request — is left completely alone by
  // never calling event.respondWith(), so the browser fetches it exactly
  // as it would with no service worker installed at all.
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  const url = new URL(request.url);
  if (STATIC_EXT.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
  // Anything same-origin that isn't a navigation or a recognized static
  // asset extension falls through untouched, same as cross-origin.
});
