/* ==========================================================================
   firebase-auth.js — Google Sign-In initialization and user state management.
   Load this script FIRST on every page, before any calculator code.

   Notes on what changed from earlier drafts of this file:
   - Uses the "-compat.js" SDK bundles, not the bare "firebase-auth.js" /
     "firebase-firestore.js" modular entry points. The modular bundles don't
     expose the global `firebase.*` namespace this file relies on
     (`firebase.auth()`, `new firebase.auth.GoogleAuthProvider()`, etc.) —
     using them silently breaks sign-in with no obvious error, which is
     what was happening before this was caught and fixed.
   - Firebase Analytics IS loaded (deliberately re-added — the project owner
     wants it for usage insights), but it's fetched in the background after
     Auth (and Firestore, where needed) are ready, on requestIdleCallback —
     see the bottom of this file. It's not on the critical script chain
     any more, since it gates no user-facing feature and was adding to
     Lighthouse's "reduce unused JavaScript" / main-thread-work numbers for
     no benefit to anyone actually using the calculator. The measurementId
     below must exactly match what's registered server-side for this
     Firebase project, or the SDK logs a mismatch warning to the console;
     "G-5XMZFH8N1M" is the value Firebase's own console reported as the
     real one for this project, confirmed from a live browser console log,
     not a placeholder.
   - The Firestore SDK is loaded only on pages that actually use Save
     Progress (set via a `data-needs-firestore="true"` attribute on this
     script's own <script> tag). Pages like the home page, scheme picker,
     or FAQ never call saveMarks/getMarks, so there's no reason to make
     every visitor download and parse the Firestore bundle — this alone
     removes a large chunk of "unused JavaScript" on 5 of the site's 9
     pages, per Lighthouse. It stays on the critical chain (unlike
     Analytics) on the pages that do need it, since a visitor can start
     typing marks and hit Save before an idle callback would've fired.
   - authDomain is this project's own Hosting domain
     (rvce-mca-grade-calc.web.app), not the default *.firebaseapp.com one.
     Firebase Hosting automatically proxies the reserved /__/auth/* paths
     for whichever domain it's serving, so this keeps the auth
     iframe/popup handshake same-origin instead of cross-site — that's
     what was causing both the "Cross-Origin-Opener-Policy policy would
     block the window.closed call" console error during sign-in AND the
     third-party cookies Lighthouse's Best Practices audit was flagging
     (the old firebaseapp.com iframe was setting cookies on a genuinely
     different site from the visitor's point of view). If this ever moves
     back to firebaseapp.com, also revert the CSP frame-src 'self' addition
     and the Cross-Origin-Opener-Policy header added in firebase.json for
     this fix — they won't be needed either way, but frame-src 'self' in
     particular should shrink again to match whatever's actually in use.
   ========================================================================== */

window.MCA = window.MCA || {};

(function(){
  /* Get this from: Firebase Console → Project Settings (gear icon) →
     General → Your apps → Web app → Config. Firebase web config values
     are not secret — they identify your project, not authenticate
     requests — so it's normal and expected for this to be public in
     client-side source. Actual access control lives in firestore.rules. */
  const firebaseConfig = {
    apiKey: "AIzaSyAi2ERW8Y8ev7K0LwnB07K9lcINaJQgFSg",
    authDomain: "rvce-mca-grade-calc.web.app",
    projectId: "rvce-mca-grade-calc",
    storageBucket: "rvce-mca-grade-calc.firebasestorage.app",
    messagingSenderId: "398744365411",
    appId: "1:398744365411:web:e07e68f0f8ae317da74b56",
    measurementId: "G-5XMZFH8N1M"
  };

  /* RVCE MCA student email format: <name(s)>.mca<YY>@rvce.edu.in
     where YY is the enrollment year — 24, 25, 26, or 27 for the current
     batches. Extend the (24|25|26|27) group as new batches enroll. */
  const RVCE_MCA_EMAIL = /^[a-z]+(\.[a-z]+)*\.mca(24|25|26|27)@rvce\.edu\.in$/i;

  // Block specific account
  const BLOCKED_EMAILS = ["kirankumarab.mca25@rvce.edu.in"];

  // Read this once, synchronously, while this script is the currently
  // executing script — this still works correctly with `defer`.
  const NEEDS_FIRESTORE = !!(document.currentScript && document.currentScript.dataset.needsFirestore === 'true');

  let initialized = false;

  function initializeFirebase(){
    if(initialized || !window.firebase) return;
    initialized = true;

    try {
      window.firebase.initializeApp(firebaseConfig);
      window.MCA.auth = window.firebase.auth();
      if(NEEDS_FIRESTORE && window.firebase.firestore){
        window.MCA.firestore = window.firebase.firestore();
      }

      window.MCA.auth.onAuthStateChanged((user) => {
        if(user){
          if (
            user.email &&
            BLOCKED_EMAILS.includes(user.email.toLowerCase())
          ) {
            console.warn('Blocked account sign-in attempt, signing out:', user.email);

            window.MCA.auth.signOut();
            window.MCA.currentUser = null;

            dispatchAuthEvent('auth-rejected', {
              reason: 'Account is blocked'
            });

            window.MCA.util.toast(
              'Access denied. This account is not permitted to use this site.',
              'error'
            );

            updateAuthUI({ rejected: true });
            return;
          }

          // Restrict to RVCE MCA students only
          if(!RVCE_MCA_EMAIL.test(user.email)){
            console.warn(
              'Non-MCA-format email sign-in attempt, signing out:',
              user.email
            );

            window.MCA.auth.signOut();
            window.MCA.currentUser = null;

            dispatchAuthEvent('auth-rejected', {
              reason: 'Not an RVCE MCA student email'
            });

            updateAuthUI({ rejected: true });
            return;
          }

          window.MCA.currentUser = user;
          dispatchAuthEvent('signed-in', {
            user,
            email: user.email,
            uid: user.uid
          });
          updateAuthUI();

        } else {
          window.MCA.currentUser = null;
          dispatchAuthEvent('signed-out');
          updateAuthUI();
        }
      });
    } catch(err){
      console.error('Firebase initialization failed:', err);
    }
  }

  const GOOGLE_LOGO_SVG = `<svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.91c1.7-1.57 2.69-3.88 2.69-6.64z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.91-2.27c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z"/>
    <path fill="#FBBC05" d="M3.96 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.05l3-2.34z"/>
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3 2.34C4.67 5.16 6.66 3.58 9 3.58z"/>
  </svg>`;

  function signInButtonHTML(extraAttrs){
    return `<button class="btn sm outline sign-in-btn" ${extraAttrs || ''}>${GOOGLE_LOGO_SVG}<span>Sign in with Google</span></button>`;
  }

  /* Render a sign-in button the instant this script runs, on every page,
     rather than leaving the auth area blank until the Firebase SDK has
     finished loading asynchronously from the CDN. Once auth state
     resolves, updateAuthUI() replaces this with the real state
     (signed-in name, or the same button if still signed out). */
  function renderInitialButton(){
    const header = document.getElementById('site-header');
    if(!header) return;
    const authContainer = header.querySelector('.auth-container');
    if(!authContainer || authContainer.innerHTML.trim()) return;
    authContainer.innerHTML = signInButtonHTML();
    authContainer.querySelector('.sign-in-btn').addEventListener('click', () => window.MCA.signInWithGoogle());
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', renderInitialButton);
  } else {
    renderInitialButton();
  }

  function updateAuthUI(opts){
    opts = opts || {};
    const header = document.getElementById('site-header');
    if(!header) return;
    const authContainer = header.querySelector('.auth-container');
    if(!authContainer) return;

    if(opts.rejected){
      authContainer.innerHTML = signInButtonHTML('title="Only RVCE MCA student emails (name.mca25@rvce.edu.in) are allowed"');
      authContainer.querySelector('.sign-in-btn').addEventListener('click', () => window.MCA.signInWithGoogle());
      window.MCA.util.toast('Only RVCE MCA student emails are allowed to sign in', 'error');
      return;
    }

    if(window.MCA.currentUser){
      // Full name, shown in full — CSS wraps it at word boundaries once
      // it exceeds ~35 characters wide, rather than truncating it.
      const rawName = window.MCA.currentUser.displayName || window.MCA.currentUser.email;
      authContainer.innerHTML = `
        <div class="user-menu">
          <span class="user-name">${window.MCA.util.escapeHTML(rawName)}</span>
          <button class="btn sm outline sign-out-btn">Sign Out</button>
        </div>`;
      authContainer.querySelector('.sign-out-btn').addEventListener('click', () => {
        window.MCA.signOut();
      });
    } else {
      authContainer.innerHTML = signInButtonHTML();
      authContainer.querySelector('.sign-in-btn').addEventListener('click', () => {
        window.MCA.signInWithGoogle();
      });
    }
  }

  function dispatchAuthEvent(eventName, detail){
    const event = detail ? new CustomEvent(eventName, { detail }) : new Event(eventName);
    document.dispatchEvent(event);
  }

  // Public API
  window.MCA.signInWithGoogle = function(){
    // The SDK is usually already booted in the background by the idle
    // callback below. On the rare click that beats it there, this just
    // finishes booting first — see ensureFirebaseBooted() at the bottom
    // of this file.
    ensureFirebaseBooted().then(() => {
      if(!window.firebase || !window.MCA.auth){
        window.MCA.util.toast('Firebase not ready yet, try again', 'error');
        return;
      }
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ hd: 'rvce.edu.in' }); // Hint: use RVCE domain
      window.MCA.auth.signInWithPopup(provider).catch(err => {
        console.error('Sign-in failed:', err.message);
        window.MCA.util.toast('Sign-in failed: ' + err.message, 'error');
      });
    }).catch(() => {
      window.MCA.util.toast('Could not load sign-in — check your connection and try again', 'error');
    });
  };

  window.MCA.signOut = function(){
    if(!window.MCA.auth) return;
    window.MCA.auth.signOut().catch(err => {
      console.error('Sign-out failed:', err.message);
      window.MCA.util.toast('Sign-out failed: ' + err.message, 'error');
    });
  };

  function requireFirestore(){
    if(!window.MCA.firestore){
      return Promise.reject(new Error('Firestore is not loaded on this page'));
    }
    return Promise.resolve(window.MCA.firestore);
  }

  /* Save marks to Firestore under current user's document.
     courseCode: e.g., "MCA121A" or "MCA121A:cie"
     marks: number or object with values to save
     Returns a Promise */
  window.MCA.saveMarks = function(courseCode, marks){
    if(!window.MCA.currentUser){
      return Promise.reject(new Error('Not signed in'));
    }

    return requireFirestore().then(firestore => {
      const user = window.MCA.currentUser;
      const userId = user.uid;

      const data = {
        // Student information
        displayName: user.displayName || '',
        email: user.email || '',
        uid: user.uid,
        emailVerified: user.emailVerified || false,
        photoURL: user.photoURL || '',
        providerId: user.providerData?.[0]?.providerId || '',

        // The marks/progress being saved
        [courseCode]: marks
      };

      // Firebase server timestamp
      if(window.firebase && window.firebase.firestore){
        data.lastUpdated =
          window.firebase.firestore.FieldValue.serverTimestamp();
      }

      // Save without overwriting existing marks
      return firestore
        .collection('userMarks')
        .doc(userId)
        .set(data, { merge: true });

    }).catch(err => {
      console.error('Save marks failed:', err);
      window.MCA.util.toast('Could not save marks', 'error');
      throw err;
    });
  };

  /* Load marks from Firestore for current user.
     courseCode: e.g., "MCA121A" or "MCA121A:cie"
     Returns a Promise that resolves to the value or null if not found */
  window.MCA.getMarks = function(courseCode){
    if(!window.MCA.currentUser) return Promise.resolve(null);
    return requireFirestore().then(firestore => {
      const userId = window.MCA.currentUser.uid;
      return firestore.collection('userMarks').doc(userId).get().then(doc => {
        const data = doc.exists ? doc.data() : null;
        return (data && Object.prototype.hasOwnProperty.call(data, courseCode)) ? data[courseCode] : null;
      });
    }).catch(err => {
      console.error('Load marks failed:', err);
      return null;
    });
  };

  /* Delete marks from Firestore for current user.
     courseCode: e.g., "MCA121A" or "MCA121A:cie" */
  window.MCA.deleteMarks = function(courseCode){
    if(!window.MCA.currentUser) return Promise.reject(new Error('Not signed in'));
    return requireFirestore().then(firestore => {
      const userId = window.MCA.currentUser.uid;
      return firestore.collection('userMarks').doc(userId).update({
        [courseCode]: window.firebase.firestore.FieldValue.delete()
      });
    }).catch(err => {
      console.error('Delete marks failed:', err);
      return null;
    });
  };

  // ========================================================================
  // Load the Firebase SDK from the CDN, if it isn't already on the page.
  // Firestore is only pulled in when this page's script tag opted in via
  // data-needs-firestore="true".
  //
  // This no longer kicks off at parse time on every page. Booting Auth
  // pulls in the auth-compat bundle *and* triggers Firebase Hosting's
  // /__/auth/iframe.js sign-in helper — together the largest chunk of
  // unused JS on first load (~130 KiB) and the longest link in the
  // critical request chain (~1.6s), on every single page, even though
  // most visits never touch "Sign in". Booting now happens on whichever
  // of these comes first:
  //   - the browser going idle (background boot, so a returning
  //     signed-in user's name still appears in the header without them
  //     clicking anything)
  //   - the user clicking "Sign in with Google" before idle has fired
  // so it's off the critical rendering path, but a real click never has
  // to wait on an idle callback that hasn't run yet.
  // ========================================================================
  function loadScript(src){
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.async = true;
      el.onload = resolve;
      el.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(el);
    });
  }

  const SDK_BASE = 'https://www.gstatic.com/firebasejs/10.12.0/';

  // Analytics only powers usage insights, not sign-in or any other
  // user-facing feature, so it's fetched in the background once the page
  // is idle rather than sharing the Auth(+Firestore) script chain — keeps
  // main-thread JS work down without dropping analytics coverage.
  function loadAnalyticsWhenIdle(){
    const loadAnalytics = () => loadScript(SDK_BASE + 'firebase-analytics-compat.js')
      .then(() => {
        if(window.firebase.analytics){
          try { window.MCA.analytics = window.firebase.analytics(); } catch(e){ /* analytics blocked (ad-blocker etc.) — non-fatal */ }
        }
      })
      .catch(() => { /* analytics is optional — a failed/blocked load is non-fatal */ });

    if('requestIdleCallback' in window){
      requestIdleCallback(loadAnalytics, { timeout: 3000 });
    } else {
      setTimeout(loadAnalytics, 300);
    }
  }

  let bootPromise = null;

  // Kicks off (once, memoized) loading the Auth SDK — and Firestore, if
  // this page needs it — then initializes Firebase against it. Safe to
  // call repeatedly; every caller shares the same in-flight/resolved
  // promise.
  function ensureFirebaseBooted(){
    if(bootPromise) return bootPromise;

    if(window.firebase){
      // Already on the page somehow — just initialize against it.
      bootPromise = Promise.resolve().then(() => {
        if(document.readyState === 'loading'){
          return new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', () => { initializeFirebase(); resolve(); });
          });
        }
        initializeFirebase();
      });
      return bootPromise;
    }

    bootPromise = loadScript(SDK_BASE + 'firebase-app-compat.js')
      .then(() => loadScript(SDK_BASE + 'firebase-auth-compat.js'))
      .then(() => NEEDS_FIRESTORE ? loadScript(SDK_BASE + 'firebase-firestore-compat.js') : Promise.resolve())
      .then(() => {
        initializeFirebase();
        dispatchAuthEvent('firebase-ready');
        loadAnalyticsWhenIdle();
      })
      .catch(err => {
        console.error(err.message);
        dispatchAuthEvent('firebase-load-error');
        bootPromise = null; // let a later click (e.g. once back online) retry
        throw err;
      });
    return bootPromise;
  }

  if('requestIdleCallback' in window){
    requestIdleCallback(() => ensureFirebaseBooted(), { timeout: 2500 });
  } else {
    setTimeout(ensureFirebaseBooted, 1500);
  }

  // Export for external access
  window.MCA.isSignedIn = () => !!window.MCA.currentUser;
  window.MCA.currentUser = null;
})();
