/* ==========================================================================
   firebase-auth.js — Google Sign-In initialization and user state management
   Load this script FIRST on every page, before any calculator code
   ========================================================================== */
window.MCA = window.MCA || {};

(function(){
  /* Paste your Firebase config here (from Firebase Console → Project Settings → Web App Config)
     Get it at: https://console.firebase.google.com → Select Project → Settings (gear icon) → Project Settings → Web App Config */
  const firebaseConfig = {
    projectId: "rvce-mca-grade-calc",
    appId: "1:398744365411:web:e07e68f0f8ae317da74b56",
    storageBucket: "rvce-mca-grade-calc.firebasestorage.app",
    apiKey: "AIzaSyAi2ERW8Y8ev7K0LwnB07K9lcINaJQgFSg",
    authDomain: "rvce-mca-grade-calc.firebaseapp.com",
    messagingSenderId: "398744365411"
  };

  /* RVCE MCA student email format: <name(s)>.mca<YY>@rvce.edu.in
     where YY is the enrollment year — 24, 25, 26, or 27 for the current
     batches. Extend the (24|25|26|27) group as new batches enroll. */
  const RVCE_MCA_EMAIL = /^[a-z]+(\.[a-z]+)*\.mca(24|25|26|27)@rvce\.edu\.in$/i;

  let initialized = false;

  function initializeFirebase(){
    if(initialized || !window.firebase) return;
    initialized = true;

    try {
      window.firebase.initializeApp(firebaseConfig);
      window.MCA.auth = window.firebase.auth();
      window.MCA.firestore = window.firebase.firestore();

      // Listen for auth state changes globally
      window.MCA.auth.onAuthStateChanged((user) => {
        if(user){
          // Restrict to RVCE MCA students only: <name>.mca<YY>@rvce.edu.in
          // (YY = 24/25/26/27, the year they enrolled)
          if(!RVCE_MCA_EMAIL.test(user.email)){
            console.warn('Non-MCA-format email sign-in attempt, signing out:', user.email);
            window.MCA.auth.signOut();
            window.MCA.currentUser = null;
            dispatchAuthEvent('auth-rejected', { reason: 'Not an RVCE MCA student email' });
            updateAuthUI({ rejected: true });
            return;
          }
          window.MCA.currentUser = user;
          console.log('Signed in as:', user.email);
          dispatchAuthEvent('signed-in', { user, email: user.email, uid: user.uid });
          // Update UI
          updateAuthUI();
        } else {
          window.MCA.currentUser = null;
          console.log('Signed out');
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
  };

  window.MCA.signOut = function(){
    if(!window.MCA.auth) return;
    window.MCA.auth.signOut().catch(err => {
      console.error('Sign-out failed:', err.message);
      window.MCA.util.toast('Sign-out failed: ' + err.message, 'error');
    });
  };

  /* Save marks to Firestore under current user's document
     courseCode: e.g., "MCA121A" or "MCA121A:cie"
     marks: number or object with values to save
     Returns a Promise */
  window.MCA.saveMarks = function(courseCode, marks){
    if(!window.MCA.currentUser){
      return Promise.reject(new Error('Not signed in'));
    }
    const userId = window.MCA.currentUser.uid;
    const data = { [courseCode]: marks };
    if(window.firebase && window.firebase.firestore){
      data.lastUpdated = window.firebase.firestore.FieldValue.serverTimestamp();
    }
    return window.MCA.firestore
      .collection('userMarks')
      .doc(userId)
      .set(data, { merge: true })
      .catch(err => {
        console.error('Save marks failed:', err);
        window.MCA.util.toast('Could not save marks', 'error');
        throw err;
      });
  };

  /* Load marks from Firestore for current user
     courseCode: e.g., "MCA121A" or "MCA121A:cie"
     Returns a Promise that resolves to the value or null if not found */
  window.MCA.getMarks = function(courseCode){
    if(!window.MCA.currentUser) return Promise.resolve(null);
    const userId = window.MCA.currentUser.uid;
    return window.MCA.firestore
      .collection('userMarks')
      .doc(userId)
      .get()
      .then(doc => {
        if (doc.exists && Object.prototype.hasOwnProperty.call(doc.data(), courseCode)) {
          return doc.data()[courseCode];
        }
        return null;
      })
      .catch(err => {
        console.error('Load marks failed:', err);
        return null;
      });
  };

  /* Delete marks from Firestore for current user
     courseCode: e.g., "MCA121A" or "MCA121A:cie" */
  window.MCA.deleteMarks = function(courseCode){
    if(!window.MCA.currentUser) return Promise.reject(new Error('Not signed in'));
    const userId = window.MCA.currentUser.uid;
    return window.MCA.firestore
      .collection('userMarks')
      .doc(userId)
      .update({
        [courseCode]: window.firebase.firestore.FieldValue.delete()
      })
      .catch(err => {
        console.error('Delete marks failed:', err);
        return null;
      });
  };

  // Load Firebase SDK from CDN if not already loaded
  if(!window.firebase){
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js';
    script.async = true;
    script.onload = () => {
      // Load Auth
      const authScript = document.createElement('script');
      authScript.src = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js';
      authScript.async = true;
      authScript.onload = () => {
        // Load Firestore
        const fsScript = document.createElement('script');
        fsScript.src = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js';
        fsScript.async = true;
        fsScript.onload = () => {
          initializeFirebase();
          dispatchAuthEvent('firebase-ready');
        };
        document.head.appendChild(fsScript);
      };
      document.head.appendChild(authScript);
    };
    script.onerror = () => {
      console.error('Failed to load Firebase SDK');
      dispatchAuthEvent('firebase-load-error');
    };
    document.head.appendChild(script);
  } else {
    // Firebase already loaded, initialize now
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', initializeFirebase);
    } else {
      initializeFirebase();
    }
  }

  // Export for external access
  window.MCA.isSignedIn = () => !!window.MCA.currentUser;
  window.MCA.currentUser = null;
})();
