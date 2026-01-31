# Firebase Authentication Setup for Axis

## Files Created:
✅ `auth.js` - Firebase auth logic
✅ `auth-ui.js` - UI interactions for auth pages
✅ `routing.js` - Page routing and access control
✅ `firebase-config.js` - Firebase configuration reference

## Files Already Updated:
✅ `index.html` - Added auth pages and Axis menu HTML

## Files That Need Manual Updates:

### 1. UPDATE `index.html` - Add Firebase SDK

**Location:** In the `<head>` section, add BEFORE the closing `</head>` tag:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>
```

**Location:** At the end of `<body>`, before closing `</body>`, update the scripts in this order:

```html
  <!-- Auth Modules -->
  <script src="auth.js"></script>
  <script src="routing.js"></script>
  <script src="auth-ui.js"></script>
  
  <!-- Main App Script -->
  <script src="script.js"></script>
</body>
```

### 2. UPDATE `script.js` - Add Firebase Initialization and Auth Listener

**At the VERY TOP of script.js, add this BEFORE the StorageModule:**

```javascript
// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
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

**At the END of script.js, add this AFTER all modules but BEFORE DOMContentLoaded:**

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

  // Initial state - Routing will handle based on auth state
  // Don't navigate here, wait for auth state change listener
});

// Handle Make Sense button with auth check
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

### 3. IMPORTANT: Update Groq endpoint calls

**In your `UIModule.handleMakeSense()` function**, after successfully getting tasks, add:

```javascript
// Save to Firebase
if (currentUser) {
  const savedJournal = await AuthModule.saveJournal(currentUser.uid, journalText);
  const savedTasks = await AuthModule.saveTasks(currentUser.uid, tasks);
}
```

### 4. Get Your Firebase Credentials

Go to [Firebase Console](https://console.firebase.google.com/):
1. Create a new project (or use existing)
2. Go to Project Settings (gear icon)
3. Copy your Firebase config values and paste them in script.js where marked "YOUR_..."

### 5. Firebase Security Rules

In Firebase Console > Firestore > Rules, set:

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

### 6. Style.css Update

Add the CSS styles to `style.css` at the end (before the closing brace).
All styles have been provided in a separate message.

## What This Gives You:

✅ **Start Screen** - "Axis" / "Clutter → Clarity" with Login/Signup buttons
✅ **Login Page** - Email/password with "Forgot password?" and signup link
✅ **Signup Page** - Create account with password confirmation
✅ **Forgot Password** - Reset password via email
✅ **Axis Menu** - Top-left button showing user email and logout option
✅ **Access Control** - Journal/Tasks hidden until logged in
✅ **Automatic Redirects** - Based on auth state
✅ **Floating Dock** - Only visible when logged in
✅ **Cloud Persistence** - Journal and tasks saved to Firestore (once integrated)

## Testing Checklist:

- [ ] Open app → should see Start screen
- [ ] Click "Sign Up" → sign up with email/password
- [ ] Redirect to journal page → Axis menu shows email
- [ ] Click Axis menu → see logout button
- [ ] Write something, click Make Sense
- [ ] Switch to Tasks page via dock
- [ ] Click Logout → redirects to Start screen
- [ ] Click "Login" → login with same email
- [ ] Journal and tasks should be preserved
