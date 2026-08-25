/* ==========================================================================
   pwa-register.js — registers the service worker for offline support.
   Loaded on every page. Registration itself is fire-and-forget; failures
   (unsupported browser, dev server without HTTPS, etc.) are logged but
   never block the page.
   ========================================================================== */
(function(){
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('Service worker registration failed (non-fatal):', err);
      });
    });
  }
})();
