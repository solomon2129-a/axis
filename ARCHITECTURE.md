# AXIS AUTHENTICATION FLOW

## User Journey Maps

### New User (Sign Up)
```
Start Screen (Axis / Clutter → Clarity)
     ↓ [Click Sign Up]
Sign Up Page (email + password form)
     ↓ [Create Account]
     ↓ (Firebase creates user)
     ↓ (Auth state changes)
Journal Page (redirected automatically)
     ↓ [Axis menu shows user email]
User is authenticated ✅
```

### Returning User (Login)
```
Start Screen (app remembers they're logged out)
     ↓ [Click Login]
Login Page (email + password form)
     ↓ [Sign In]
     ↓ (Firebase verifies credentials)
     ↓ (Auth state changes)
Journal Page (redirected automatically)
     ↓ [Journal text and tasks restored from Firestore]
User is authenticated ✅
```

### Forgot Password
```
Login Page
     ↓ [Click Forgot password?]
Forgot Password Page (email form)
     ↓ [Send Reset Link]
     ↓ (Firebase sends email)
     ↓ [Success message shown]
     ↓ [Auto-redirect to Login after 2 sec]
Login Page (user checks email, clicks link)
     ↓ (Redirected to Firebase reset page)
     ↓ (User creates new password)
Login Page (with new password) ✅
```

### Logout
```
Any Page (Journal or Tasks)
     ↓ [Click "Axis" button (top-left)]
Axis Menu opens
     ↓ [Click "Logout"]
     ↓ (Firebase signs out)
     ↓ (Auth state changes)
Start Screen (redirected automatically) ✅
```

## Technical Architecture

### Auth State Change Listener (Core of the app)
```
App Loads
     ↓
Firebase checks if user is logged in
     ↓
onAuthStateChange fires with (user or null)
     ↓
IF user:
  - Update Axis menu with email
  - Show floating dock
  - Navigate to journal page
  - Load user's data from Firestore
ELSE:
  - Hide Axis menu logout option
  - Hide floating dock
  - Navigate to start page
  - Clear local data
```

### Data Flow

#### When User Logs In:
```
User credentials
     ↓
Firebase Auth validates
     ↓
Auth state changes
     ↓
- Axis menu updates
- Floating dock shows
- Load journal from Firestore
- Load tasks from Firestore
- Display both on pages
```

#### When User Writes and Makes Sense:
```
User writes in textarea
     ↓ [Click "Make Sense"]
     ↓
Groq API extracts tasks
     ↓
Tasks saved to localStorage (instant)
     ↓
Tasks saved to Firestore (background)
     ↓
Journal text saved to Firestore
     ↓
Navigate to Tasks page (shows tasks from Groq)
```

#### When User Logs Out:
```
User clicks logout
     ↓
Firebase signs out
     ↓
Auth state changes to null
     ↓
- Clear auth listeners
- Clear Firestore subscriptions
- Hide floating dock
- Navigate to start screen
- Clear local data
```

#### When User Logs Back In:
```
User logs in
     ↓
Firebase auth succeeds
     ↓
Load journal from Firestore
     ↓
Load tasks from Firestore
     ↓
Display on journal and tasks pages
     ↓
Everything is preserved ✅
```

## Component Relationships

```
index.html (HTML structure)
     ↓
style.css (Visual styling)
     ↓
auth.js (Firebase functions)
routing.js (Page logic)
auth-ui.js (Form/menu interactions)
     ↓
script.js (App initialization + existing logic)
     ↓
Browser loads everything
     ↓
Firebase SDK initializes
     ↓
Auth state listener activates
     ↓
App is ready
```

## State Variables

```
currentUser (global in script.js)
  - null = not logged in
  - { uid, email, ... } = logged in

Auth State (in Firebase)
  - Persists automatically
  - Survives page refresh
  - Cleared on logout
```

## Page Visibility Rules

### Not Logged In:
✅ Visible:
- Start page (default)
- Login page
- Signup page
- Forgot password page

❌ Hidden:
- Journal page → redirects to Start
- Tasks page → redirects to Start
- Floating dock

### Logged In:
✅ Visible:
- Journal page (default)
- Tasks page
- Floating dock
- Axis menu with logout

❌ Hidden:
- Start page → redirects to Journal
- Login page → redirects to Journal
- Signup page → redirects to Journal
- Forgot password page → redirects to Journal

## Key Implementation Details

### Auth Listener (core of routing):
```javascript
AuthModule.onAuthStateChange((user) => {
  if (user) {
    // User logged in
    RoutingModule.navigateTo('journal', true);
  } else {
    // User logged out
    RoutingModule.navigateTo('start', false);
  }
});
```

### Access Control:
```javascript
// In Make Sense button
if (!currentUser) {
  // Not logged in, can't use Make Sense
  RoutingModule.navigateTo('start', false);
  return;
}
// User is logged in, proceed
UIModule.handleMakeSense();
```

### Form Submission:
```javascript
// In Login form
const result = await AuthModule.login(email, password);
if (result.success) {
  // Don't redirect - let auth listener do it
  // Just clear the form
} else {
  RoutingModule.showError('login', result.error);
}
```

## Security Considerations

### Frontend:
- Never store passwords (Firebase handles this)
- Clear forms after successful auth
- Show user-friendly error messages
- Don't expose sensitive data in console

### Firestore Rules:
```firestore
match /users/{userId}/{document=**} {
  allow read, write: if request.auth.uid == userId;
}
```
- Users can only read/write their own data
- Anonymous users cannot access anything

### Firebase Project:
- Keep API key safe (it's public but restricted by rules)
- Use production mode before deploying
- Monitor Firebase usage in console
- Set up billing alerts

## What's NOT Changed

✅ Journal page layout, styling, functionality
✅ Tasks page layout, styling, functionality
✅ Floating dock behavior
✅ Make Sense button (just added auth check)
✅ localStorage (still works as backup)
✅ CSS design system
✅ Groq API integration

## What's Added

✅ Authentication pages (Login, Signup, Forgot Password)
✅ Start/Landing page
✅ Axis menu (user info + logout)
✅ Page routing with access control
✅ Firestore data persistence
✅ Auth state management
✅ Session persistence

---

This architecture keeps auth completely separate from the existing app logic while providing full integration when needed.
