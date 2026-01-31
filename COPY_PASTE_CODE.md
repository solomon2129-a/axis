# COPY-PASTE CODE SNIPPETS

## For index.html

### 1. Add to `<head>` section (after <link rel="stylesheet" href="style.css" />)

```html
  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>
</head>
```

### 2. Replace the script section at END of <body>

REMOVE THIS:
```html
  <script src="script.js"></script>
</body>
```

REPLACE WITH:
```html
  <!-- Auth Modules -->
  <script src="auth.js"></script>
  <script src="routing.js"></script>
  <script src="auth-ui.js"></script>
  
  <!-- Main App Script -->
  <script src="script.js"></script>
</body>
```

---

## For style.css

### Add to END of style.css (before the final closing brace if there is one)

Copy ALL content from CSS_STYLES_TO_ADD.css and paste at the very end.

Or manually add:

```css
/* ============================================================================
   AXIS MENU (Top-Left)
   ============================================================================ */

.axis-header {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 200;
}

.axis-menu-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.axis-menu-btn:hover {
  opacity: 0.8;
}

.axis-menu {
  position: absolute;
  top: 30px;
  left: 0;
  background: rgba(26, 26, 26, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.axis-menu.hidden {
  display: none;
}

.menu-item {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.menu-item.hidden {
  display: none;
}

.user-info {
  padding: 12px 16px;
  cursor: default;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* ============================================================================
   AUTH PAGES - MINIMAL DESIGN
   ============================================================================ */

.start-card,
.auth-card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.start-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.start-title {
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.start-tagline {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
  letter-spacing: 0;
}

.start-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 24px;
}

.start-buttons .btn {
  width: 100%;
}

.auth-header {
  margin-bottom: 32px;
}

.auth-header h2 {
  font-size: 28px;
  color: #ffffff;
  font-weight: 600;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.auth-form input {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px 14px;
  color: #ffffff;
  font-size: 14px;
  font-family: inherit;
}

.auth-form input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.auth-form input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.auth-form .btn {
  width: 100%;
}

.auth-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.link-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  padding: 4px 0;
  font-family: inherit;
  text-decoration: underline;
}

.link-btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

.auth-error {
  color: #ff6b6b;
  font-size: 13px;
  margin-top: 16px;
  min-height: 18px;
}

.auth-success {
  color: #51cf66;
  font-size: 13px;
  margin-top: 16px;
  min-height: 18px;
}
```

---

## For script.js

### 1. Add at the VERY TOP of script.js (before StorageModule)

```javascript
// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firebaseAuth = firebase.auth();
const firebaseDb = firebase.firestore();

// Initialize auth module
AuthModule.init(firebaseAuth, firebaseDb);

```

### 2. Add at the END of script.js (after all other code)

```javascript
// ============================================================================
// AUTH STATE MANAGEMENT
// ============================================================================

let currentUser = null;

// Listen for auth state changes
AuthModule.onAuthStateChange((user) => {
  currentUser = user;

  if (user) {
    // User is logged in
    console.log('[Auth] User logged in:', user.email);
    AuthUIModule.updateUserInfo(user);
    RoutingModule.navigateTo('journal', true);
  } else {
    // User is logged out
    console.log('[Auth] User logged out');
    AuthUIModule.updateUserInfo(null);
    RoutingModule.navigateTo('start', false);
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Auth UI
  AuthUIModule.init();

  // Initialize existing modules
  DOMModule.cacheElements();
  TasksModule.init();

  // Handle dock navigation (only visible when logged in)
  const dockItems = document.querySelectorAll('.dock-item');
  dockItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageName = item.getAttribute('data-page');
      if (currentUser) {
        UIModule.navigateToPage(pageName);
      }
    });
  });
});

// Make Sense button - with auth check
document.addEventListener('DOMContentLoaded', () => {
  const makeSenseBtn = document.getElementById('make-sense-btn');
  if (makeSenseBtn) {
    makeSenseBtn.addEventListener('click', () => {
      if (!currentUser) {
        RoutingModule.navigateTo('start', false);
        return;
      }
      UIModule.handleMakeSense();
    });
  }
});
```

---

## Firebase Credentials

Replace in the Firebase Config:

```
YOUR_API_KEY_HERE → (from Firebase Console > Project Settings)
YOUR_PROJECT.firebaseapp.com → (your Firebase auth domain)
YOUR_PROJECT_ID → (your Firebase project ID)
YOUR_PROJECT.appspot.com → (your Firebase storage bucket)
YOUR_SENDER_ID → (your Firebase messaging sender ID)
YOUR_APP_ID → (your Firebase app ID)
```

To find these:
1. Go to https://console.firebase.google.com
2. Select your project
3. Click the gear icon (⚙️) top-left
4. Click "Project Settings"
5. Scroll down to "Your apps" section
6. Look for a web app config that shows all these values

---

## Firestore Security Rules

In Firebase Console:
1. Click "Firestore Database"
2. Click "Rules" tab
3. Replace entire content with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

Click "Publish"

---

## Files Already Created (Just copy into your folder)

- ✅ auth.js
- ✅ auth-ui.js
- ✅ routing.js
- ✅ firebase-config.js
- ✅ CSS_STYLES_TO_ADD.css (source for style.css additions)

These are already in your folder - no further action needed!

---

## Final Checklist

After making all changes above:

- [ ] index.html has Firebase SDK scripts in <head>
- [ ] index.html script section updated (auth.js, routing.js, auth-ui.js before script.js)
- [ ] style.css has auth styles at the end
- [ ] script.js has Firebase config at the top
- [ ] script.js has auth listener at the bottom
- [ ] Firebase project created
- [ ] Email/Password auth enabled
- [ ] Firestore database created
- [ ] Security rules published
- [ ] auth.js, routing.js, auth-ui.js all in folder
- [ ] Run `npm start` and test the flow

You're done! 🎉
