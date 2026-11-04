/* ==========================================================================
   pwa-install.js — a polite "Add to Home Screen" prompt.

   When it is allowed to appear (all must hold):
   - The app is not already installed / running standalone, and the visitor
     has not installed it before ("installed" is remembered, permanently).
   - The browser can actually install it: Chromium fires beforeinstallprompt
     (native install dialog), or it's iOS Safari (no API; we show the manual
     Share -> Add to Home Screen hint instead). Anything else: stays silent.
   - It's at least the visitor's 2nd separate visit (a new browser session),
     they've interacted with the page, and a few seconds have passed — never
     on a first impression, never mid-load.
   - Not more than once per browser session, and not within 3 days of the
     last time it was shown.
   - Dismissal snoozes it: 14 days, then 45, then 120; after the third
     dismissal it never comes back. Declining the native dialog counts as a
     dismissal too.
   - No modal is open at that moment (it waits and retries instead).
   If localStorage is unavailable nothing can be remembered, so it never
   shows. Styles live in components.css (.pwa-install); no inline scripts.
   ========================================================================== */
(function(){
  'use strict';
  var KEY = 'mca-pwa-install';
  var SESSION_KEY = 'mca-pwa-session';
  var DAY = 86400000;
  var SNOOZE_DAYS = [14, 45, 120];
  var MIN_VISITS = 2;
  var MIN_DELAY_MS = 8000;
  var RESHOW_GAP_MS = 3 * DAY;

  var state = load();
  if(!state) return; // storage unavailable: can't remember choices, so don't prompt

  if(isStandalone()){
    if(!state.installed){ state.installed = true; save(); }
    return;
  }
  if(state.installed) return;

  // Count visits: once per browser session (tab session), not per page.
  try {
    if(!sessionStorage.getItem(SESSION_KEY)){
      sessionStorage.setItem(SESSION_KEY, '1');
      state.visits = (state.visits || 0) + 1;
      save();
    }
  } catch(e){ return; }

  var deferred = null;
  var ios = isIosSafari();
  var interacted = false;
  var started = Date.now();
  var timer = null;
  var banner = null;

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferred = e;
    schedule();
  });
  window.addEventListener('appinstalled', function(){
    state.installed = true; save(); hide(); deferred = null;
  });
  ['pointerdown', 'keydown', 'scroll'].forEach(function(t){
    window.addEventListener(t, function(){
      if(interacted) return;
      interacted = true; schedule();
    }, { passive: true, once: true });
  });
  if(ios) schedule();

  function load(){
    try {
      var raw = localStorage.getItem(KEY);
      var s = raw ? JSON.parse(raw) : {};
      if(!s || typeof s !== 'object') s = {};
      localStorage.setItem(KEY, JSON.stringify(s)); // proves it's writable
      return s;
    } catch(e){ return null; }
  }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }

  function isStandalone(){
    try {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.matchMedia('(display-mode: fullscreen)').matches ||
             window.matchMedia('(display-mode: minimal-ui)').matches ||
             window.navigator.standalone === true;
    } catch(e){ return false; }
  }
  function isIosSafari(){
    var ua = navigator.userAgent || '';
    var iosDevice = /iPhone|iPad|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return iosDevice && /Safari\//.test(ua) && !/FBAN|FBAV|Instagram|Line\/|GSA\//.test(ua);
  }
  function isTouch(){
    try { return window.matchMedia('(pointer: coarse)').matches; } catch(e){ return false; }
  }

  function eligible(){
    if(!(deferred || ios)) return false;
    if((state.visits || 0) < MIN_VISITS) return false;
    var d = state.dismissals || 0;
    if(d >= SNOOZE_DAYS.length) return false;
    var now = Date.now();
    if(state.dismissedAt && now - state.dismissedAt < SNOOZE_DAYS[d - 1] * DAY) return false;
    if(state.lastShown && now - state.lastShown < RESHOW_GAP_MS) return false;
    try { if(sessionStorage.getItem('mca-pwa-shown')) return false; } catch(e){ return false; }
    return true;
  }

  function schedule(){
    if(timer || banner || !interacted && !ios) return;
    if(!eligible()) return;
    var wait = Math.max(0, MIN_DELAY_MS - (Date.now() - started));
    timer = setTimeout(function(){ timer = null; attempt(0); }, wait);
  }

  function attempt(n){
    if(!eligible() || !interacted) return;
    // Don't land on top of an open modal; try again shortly.
    if(document.querySelector('.modal-overlay:not(.hidden)') && n < 6){
      timer = setTimeout(function(){ timer = null; attempt(n + 1); }, 5000);
      return;
    }
    show();
  }

  var SHARE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';

  function show(){
    var inPages = /\/pages\//.test(location.pathname);
    var root = inPages ? '../' : '';
    var mobile = isTouch();
    var title = mobile ? 'Add to Home Screen' : 'Install app';
    var body = ios && !deferred
      ? 'Tap ' + SHARE_SVG + ' then \u201cAdd to Home Screen\u201d for quick, offline access.'
      : 'Quick access, even offline.';

    banner = document.createElement('div');
    banner.className = 'pwa-install';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', title);
    banner.innerHTML =
      '<img src="' + root + 'icons/icon-96.png" width="40" height="40" alt="">' +
      '<div class="pwa-install-text"><b>' + title + '</b>' + body + '</div>' +
      '<div class="pwa-install-actions">' +
        (deferred ? '<button type="button" class="btn sm accent" data-act="install">' + (mobile ? 'Add' : 'Install') + '</button>' : '') +
        '<button type="button" class="btn sm ghost" data-act="dismiss">Not now</button>' +
      '</div>';
    banner.addEventListener('click', function(e){
      var b = e.target.closest('button[data-act]');
      if(!b) return;
      if(b.getAttribute('data-act') === 'install') install(); else dismiss();
    });
    banner.addEventListener('keydown', function(e){ if(e.key === 'Escape') dismiss(); });
    document.body.appendChild(banner);

    state.lastShown = Date.now(); save();
    try { sessionStorage.setItem('mca-pwa-shown', '1'); } catch(e){}
  }

  function hide(){
    if(banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function dismiss(){
    state.dismissals = (state.dismissals || 0) + 1;
    state.dismissedAt = Date.now();
    save(); hide();
  }

  function install(){
    var p = deferred; deferred = null;
    hide();
    if(!p) return;
    p.prompt();
    p.userChoice.then(function(c){
      if(c && c.outcome === 'accepted'){ state.installed = true; save(); }
      else { state.dismissals = (state.dismissals || 0) + 1; state.dismissedAt = Date.now(); save(); }
    }).catch(function(){});
  }
})();
