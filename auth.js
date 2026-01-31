// ============================================================================
// FIREBASE AUTH MODULE - Handles all authentication logic
// ============================================================================

const AuthModule = (() => {
  // Get Firebase instance (initialized in script.js)
  let auth, db;

  const init = (firebaseAuth, firebaseDb) => {
    // Prefer passed instances, but fall back to global firebase if unavailable
    auth = firebaseAuth || (typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null);
    db = firebaseDb || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
    console.log('[AuthModule] init called. auth set?', !!auth, 'db set?', !!db);
  };

  // ========== Auth State Listener ==========
  const onAuthStateChange = (callback) => {
    if (!auth) return;
    return auth.onAuthStateChanged((user) => {
      callback(user);
    });
  };

  // ========== Login ==========
  const login = async (email, password) => {
    // Ensure auth is ready; wait for firebaseReady if needed
    if (!auth && typeof window !== 'undefined' && window.firebaseReady) {
      try {
        await window.firebaseReady;
      } catch (e) {
        console.error('Failed awaiting firebaseReady:', e);
      }
    }
    // If still no auth, attempt to initialize Firebase using the exposed config
    if (!auth && typeof firebase !== 'undefined' && typeof window !== 'undefined' && window.firebaseConfig && window.firebaseConfig.apiKey) {
      try {
        // Initialize only once
        if (!firebase.apps || firebase.apps.length === 0) {
          firebase.initializeApp(window.firebaseConfig);
        }
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('[AuthModule] Firebase initialized on‑demand');
      } catch (e) {
        console.error('Failed on‑demand Firebase init:', e);
      }
    }
    // Fallback to global firebase auth only if a Firebase app has been initialized
    if (!auth && typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && firebase.auth) {
      auth = firebase.auth();
    }
    // Validate that Firebase config (apiKey) is present
    if (auth && auth.app && auth.app.options && !auth.app.options.apiKey) {
      console.error('Firebase config missing apiKey');
      return { success: false, error: 'Firebase configuration error (missing apiKey)' };
    }
    if (!auth) {
      console.error('AuthModule.login called but auth still undefined');
      return { success: false, error: 'Authentication service not initialized' };
    }
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ========== Sign Up ==========
  const signup = async (email, password, name) => {
    // Ensure auth is ready; wait for firebaseReady if needed
    if (!auth && typeof window !== 'undefined' && window.firebaseReady) {
      try {
        await window.firebaseReady;
      } catch (e) {
        console.error('Failed awaiting firebaseReady for signup:', e);
      }
    }
    // If still no auth, attempt on‑demand Firebase init using exposed config
    if (!auth && typeof firebase !== 'undefined' && typeof window !== 'undefined' && window.firebaseConfig && window.firebaseConfig.apiKey) {
      try {
        if (!firebase.apps || firebase.apps.length === 0) {
          firebase.initializeApp(window.firebaseConfig);
        }
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('[AuthModule] Firebase initialized on‑demand (signup)');
      } catch (e) {
        console.error('Failed on‑demand Firebase init (signup):', e);
      }
    }
    // Fallback to global firebase auth only if a Firebase app has been initialized
    if (!auth && typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && firebase.auth) {
      auth = firebase.auth();
    }
    if (!auth) {
      console.error('AuthModule.signup called but auth still undefined');
      return { success: false, error: 'Authentication service not initialized' };
    }
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      // Store user profile with name in Firestore
      if (db) {
        await db.collection('users').doc(result.user.uid).set({
          name: name || '',
          email: email,
          createdAt: window.firebase && window.firebase.firestore ? window.firebase.firestore.Timestamp.now() : new Date(),
        }, { merge: true });
      }
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ========== Forgot Password ==========
  const sendPasswordReset = async (email) => {
    try {
      await auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ========== Logout ==========
  const logout = async () => {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ========== Get Current User ==========
  const getCurrentUser = () => {
    return auth ? auth.currentUser : null;
  };

  // ========== Save Journal to Firestore ==========
  const saveJournal = async (userId, journalText) => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      await db.collection('users').doc(userId).collection('journal').doc('current').set({
        text: journalText,
        updatedAt: window.firebase && window.firebase.firestore ? window.firebase.firestore.Timestamp.now() : new Date(),
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error saving journal:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== Load Journal from Firestore ==========
  const loadJournal = async (userId) => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      const docRef = await db.collection('users').doc(userId).collection('journal').doc('current').get();
      return docRef.exists ? docRef.data().text : '';
    } catch (error) {
      console.error('Error loading journal:', error);
      return '';
    }
  };

  // ========== Save Tasks to Firestore ==========
  const saveTasks = async (userId, tasks) => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      await db.collection('users').doc(userId).collection('tasks').doc('current').set({
        data: tasks,
        updatedAt: window.firebase && window.firebase.firestore ? window.firebase.firestore.Timestamp.now() : new Date(),
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error saving tasks:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== Load Tasks from Firestore ==========
  const loadTasks = async (userId) => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      const docRef = await db.collection('users').doc(userId).collection('tasks').doc('current').get();
      return docRef.exists ? docRef.data().data : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  };

  // ========== Load User Profile ==========
  const loadUserProfile = async (userId) => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      const docRef = await db.collection('users').doc(userId).get();
      return docRef.exists ? docRef.data() : { name: '', email: '' };
    } catch (error) {
      console.error('Error loading user profile:', error);
      return { name: '', email: '' };
    }
  };

  // ========== Update User Profile ==========
  const updateUserProfile = async (userId, profileData) => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      await db.collection('users').doc(userId).set(profileData, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== Save Journal Entry to Firestore ==========
  const saveJournalEntry = async (userId, entry) => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      const entriesRef = db.collection('users').doc(userId).collection('journal-entries');
      await entriesRef.doc(entry.id).set({
        text: entry.text,
        timestamp: window.firebase && window.firebase.firestore ? window.firebase.firestore.Timestamp.fromDate(new Date(entry.timestamp)) : new Date(entry.timestamp),
        tasksGenerated: entry.tasksGenerated || []
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving journal entry:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== Load Journal Entries from Firestore ==========
  const loadJournalEntries = async (userId) => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      const snapshot = await db.collection('users').doc(userId).collection('journal-entries').orderBy('timestamp', 'desc').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        timestamp: doc.data().timestamp?.toDate?.() ? doc.data().timestamp.toDate().toISOString() : doc.data().timestamp,
        tasksGenerated: doc.data().tasksGenerated || []
      }));
    } catch (error) {
      console.error('Error loading journal entries:', error);
      return [];
    }
  };

  return {
    init,
    onAuthStateChange,
    login,
    signup,
    sendPasswordReset,
    logout,
    getCurrentUser,
    saveJournal,
    loadJournal,
    saveTasks,
    loadTasks,
    loadUserProfile,
    updateUserProfile,
    saveJournalEntry,
    loadJournalEntries,
  };
})();
