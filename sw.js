/* ==========================================================================
   sw.js — service worker configured for Network Only strategy.

   Strategy: Network Only for EVERYTHING.
   All requests bypass the cache and go straight to the network.
   ========================================================================== */

const CACHE_VERSION = 'mca-calc-v14';

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
          .filter(key => key.startsWith('mca-calc-'))
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/**
 * Network Only Strategy
 * Directly fetches the resource from the network without checking or saving to local cache.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function networkOnly(request) {
  return fetch(request);
}

self.addEventListener('fetch', (event) => {
  // Route all fetch requests through the Network Only strategy
  event.respondWith(networkOnly(event.request));
});


