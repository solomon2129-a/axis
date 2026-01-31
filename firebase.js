// Client-side Firebase initializer.
// Fetches the Firebase config from the server (reads environment variables)
// and initializes Firebase (compat SDK). Exposes `window.firebaseAuth` and
// `window.firebaseDb` and a `window.firebaseReady` promise that resolves
// once initialization completes.

/*
 * Direct Firebase initialization (no fetch). This file replaces the previous
 * version that retrieved the config from `/api/firebase-config`. The config
 * is now hard‑coded (the values you supplied) and the initialization uses the
 * Firebase **compat** SDK that is already loaded via the CDN script tags in
 * `index.html`.
 *
 * The module still exposes the same globals (`window.firebaseApp`,
 * `window.firebaseAuth`, `window.firebaseDb`, `window.firebaseReady` and
 * `window.firebaseConfig`) so the rest of the codebase does not need to be
 * changed.
 */
(function () {
  // ---------------------------------------------------------------------
  // Firebase configuration – replace with your own values if they change.
  // ---------------------------------------------------------------------
  const cfg = {
    apiKey: "AIzaSyAGCOZc6wABrKl5N2rjGLAzSn_8x44PYgM",
    authDomain: "axis-921b6.firebaseapp.com",
    projectId: "axis-921b6",
    storageBucket: "axis-921b6.firebasestorage.app",
    messagingSenderId: "433756161092",
    appId: "1:433756161092:web:63fabfd6667f1c036b6811",
    measurementId: "G-RPR9YFTH5K"
  };

  // Expose the raw config for any on‑demand init logic elsewhere.
  window.firebaseConfig = cfg;

  // ---------------------------------------------------------------------
  // Initialise Firebase (compat SDK). The CDN scripts are already loaded in
  // `index.html`, so `firebase` should be available globally.
  // ---------------------------------------------------------------------
  if (typeof firebase === "undefined" || !firebase.initializeApp) {
    console.error("Firebase SDK not loaded (firebase global missing)." );
    // Resolve the ready promise with null so callers can handle the failure.
    window.firebaseReady = Promise.resolve(null);
    return;
  }

  // Guard against double initialisation – `firebase.apps` holds all created apps.
  const app = (firebase.apps && firebase.apps.length > 0)
    ? firebase.apps[0]
    : firebase.initializeApp(cfg);

  const auth = firebase.auth();
  const db = firebase.firestore();

  // Expose instances globally for the rest of the codebase.
  window.firebaseApp = app;
  window.firebaseAuth = auth;
  window.firebaseDb = db;

  // Resolve a promise so other modules can `await window.firebaseReady`.
  window.firebaseReady = Promise.resolve({ app, auth, db });
})();
