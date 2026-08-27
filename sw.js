/* ==========================================================================
   sw.js — service worker for offline support + installability.

   CACHE_VERSION must be bumped on every deploy that changes any cached
   file's content. This project has no build step and no content-hashed
   filenames (e.g. site.abc123.js), so the browser and the service worker
   have no other way to know a same-named file's content changed —
   forgetting to bump this is exactly how a returning visitor ends up
   with a stale mix of old cached CSS/JS alongside a freshly fetched
   HTML page, which is a real bug that shipped here previously (visible
   as wildly inconsistent Lighthouse runs and console errors that only
   showed up on a warm cache, not a cold one).

   Strategy, given that constraint: network-first for EVERYTHING except
   genuinely immutable assets (icons, PDFs) — correctness over raw speed,
   since a build-hashed cache-first setup isn't available here. Firebase
   Hosting's own Cache-Control headers (see firebase.json) still let the
   browser's HTTP cache do its job on top of this for repeat loads within
   the same session.
   ========================================================================== */

const CACHE_VERSION = 'mca-calc-v4';
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const IMMUTABLE_CACHE = `${CACHE_VERSION}-immutable`;

// Precached on install — the shell needed to render every page offline.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.webmanifest',
  '/css/app.css',
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
  '/js/pwa-register.js',
  '/js/pages/home.js',
  '/pages/scheme.html',
  '/pages/semester.html',
  '/pages/tools.html',
  '/pages/cie-see.html',
  '/pages/final-grade.html',
  '/pages/final-gpa.html',
  '/pages/cgpa.html',
  '/pages/faq.html',
  '/pages/guide.html',
  '/js/pages/scheme.js',
  '/js/pages/semester.js',
  '/js/pages/tools.js',
  '/js/pages/cie-see.js',
  '/js/pages/final-grade.js',
  '/js/pages/final-gpa.js',
  '/js/pages/cgpa.js',
  '/js/pages/faq.js',
  '/js/pages/guide.js',
  '/js/faqContent.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Only things that genuinely never change once published — a given PDF
// or icon file is replaced by uploading a new file, not by editing this
// one in place, so cache-first is safe for these specifically.
const IMMUTABLE_EXTENSIONS = /\.(png|jpg|jpeg|svg|ico|pdf)$/;

// Never let the service worker touch these — live, authenticated,
// per-user data must always go straight to the network.
const NEVER_CACHE = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'www.gstatic.com/firebasejs',
  'accounts.google.com',
  'apis.google.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(RUNTIME_CACHE)
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
          .filter(key => key.startsWith('mca-calc-') && key !== RUNTIME_CACHE && key !== IMMUTABLE_CACHE)
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

  if(IMMUTABLE_EXTENSIONS.test(new URL(url).pathname)){
    // Cache-first: these files are safe to serve instantly from cache
    // and only fetched once.
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        if(res && res.status === 200){
          const resClone = res.clone();
          caches.open(IMMUTABLE_CACHE).then(cache => cache.put(req, resClone));
        }
        return res;
      }))
    );
    return;
  }

  // Network-first for everything else — HTML, CSS, and JS. Always tries
  // to get the current deployed version first (so a fresh HTML page can
  // never end up paired with stale CSS/JS from a previous deploy), and
  // only falls back to whatever's cached when there's no network at all.
  event.respondWith(
    fetch(req)
      .then(res => {
        if(res && res.status === 200){
          const resClone = res.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(req, resClone));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(cached => {
          if(cached) return cached;
          const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
          return isHTML ? caches.match('/404.html') : Response.error();
        })
      )
  );
});

