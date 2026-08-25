/* ==========================================================================
   sw.js — service worker for offline support + installability.
   Cache-first for static assets (CSS/JS/fonts/icons), network-first for
   HTML pages (so a deployed content update is picked up quickly while a
   flaky/offline connection still falls back to the last cached copy).
   Firebase/Firestore/auth requests are always passed straight to the
   network — they carry live, per-user data and must never be served
   from cache or intercepted.
   ========================================================================== */

const CACHE_VERSION = 'mca-calc-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;

// Precached on install — the shell needed to render every page offline.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.webmanifest',
  '/css/variables.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/js/util.js',
  '/js/data.js',
  '/js/icons.js',
  '/js/grading.js',
  '/js/engine.js',
  '/js/course-picker.js',
  '/js/input-guard.js',
  '/js/progress.js',
  '/js/site.js',
  '/js/firebase-auth.js',
  '/js/pages/home.js',
  '/pages/scheme.html',
  '/pages/semester.html',
  '/pages/tools.html',
  '/pages/cie-see.html',
  '/pages/final-grade.html',
  '/pages/final-gpa.html',
  '/pages/cgpa.html',
  '/pages/faq.html',
  '/js/pages/scheme.js',
  '/js/pages/semester.js',
  '/js/pages/tools.js',
  '/js/pages/cie-see.js',
  '/js/pages/final-grade.js',
  '/js/pages/final-gpa.js',
  '/js/pages/cgpa.js',
  '/js/pages/faq.js',
  '/js/faqContent.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Never let the service worker touch these — live, authenticated,
// per-user data must always go straight to the network.
const NEVER_CACHE = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'www.gstatic.com/firebasejs',
  'accounts.google.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('SW precache failed (non-fatal):', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('mca-calc-') && key !== STATIC_CACHE && key !== PAGES_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

function isNeverCached(url){
  return NEVER_CACHE.some(host => url.includes(host));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // Only handle same-origin GET requests; let everything else (POST,
  // cross-origin auth/Firestore calls, etc.) pass through untouched.
  if(req.method !== 'GET' || isNeverCached(url)) return;

  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if(isHTML){
    // Network-first for pages: always try to get the freshest deployed
    // version, but fall back to the cached copy (and finally to
    // 404.html) when offline.
    event.respondWith(
      fetch(req)
        .then(res => {
          const resClone = res.clone();
          caches.open(PAGES_CACHE).then(cache => cache.put(req, resClone));
          return res;
        })
        .catch(() =>
          caches.match(req).then(cached => cached || caches.match('/404.html'))
        )
    );
    return;
  }

  // Cache-first for static assets (CSS/JS/fonts/icons): fast repeat
  // loads, with a background network fetch to keep the cache warm.
  event.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req).then(res => {
        if(res && res.status === 200){
          const resClone = res.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(req, resClone));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
