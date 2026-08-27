/* ==========================================================================
   splash.js — dismisses the app-launch splash screen (see the inline
   bootstrap snippet at the top of <body> and the #mca-splash rules in
   base.css). Only ever does anything when that snippet actually activated
   the splash for this load (installed/standalone launch, first page of the
   session) — on a normal in-browser page view this file finds nothing to
   do and returns immediately.
   ========================================================================== */
(function(){
  var splash = document.getElementById('mca-splash');
  if(!splash || !document.documentElement.classList.contains('mca-splash-active')) return;

  // Let the pop-in animation actually play instead of the splash vanishing
  // the instant the page happens to load fast on a good connection.
  var MIN_VISIBLE_MS = 600;
  // Safety net: never let the splash outlive this, even if 'load' is slow
  // (e.g. Google Fonts on a bad connection) — the app should never feel
  // stuck behind its own splash screen.
  var MAX_VISIBLE_MS = 2500;

  var start = Date.now();
  var dismissed = false;

  function dismiss(){
    if(dismissed) return;
    dismissed = true;
    var remaining = MIN_VISIBLE_MS - (Date.now() - start);
    setTimeout(function(){
      splash.classList.add('mca-splash-hide');
      document.documentElement.classList.remove('mca-splash-active');
      setTimeout(function(){ splash.remove(); }, 550);
    }, Math.max(0, remaining));
  }

  if(document.readyState === 'complete'){
    dismiss();
  } else {
    window.addEventListener('load', dismiss, { once: true });
    setTimeout(dismiss, MAX_VISIBLE_MS);
  }
})();
