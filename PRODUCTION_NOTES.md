# AXIS — Production-Ready Implementation

## Overview

Axis is a focused two-page productivity app that combines journaling with AI-powered goal extraction. Write freely, then let Groq AI parse your thoughts into actionable goals.

**Version:** 2.0 Production Release

---

## Architecture

### Modular Design

The codebase is organized into 5 independent modules with single responsibilities:

#### 1. **StorageModule**
Manages all persistence to localStorage:
- `getJournalDraft()` / `saveJournalDraft(text)` — Journal drafts
- `getTasks()` / `saveTasks(tasks)` — Structured goal storage
- `clear()` — Reset all data

```javascript
// Example: Save journal
StorageModule.saveJournalDraft("I want to learn Spanish and exercise more");

// Example: Get tasks
const tasks = StorageModule.getTasks(); // { today: [...], overall: [...] }
```

#### 2. **DOMModule**
Centralized DOM queries with caching:
- Query methods for all interactive elements
- Caches references for performance
- No side effects; only getters

```javascript
// Example: Get textarea
const textarea = DOMModule.getJournalTextarea();

// Example: Get back button
const btn = DOMModule.getBackButton();
```

#### 3. **TextMatchingModule**
Semantic task matching to preserve completion state:
- `normalizeText(text)` — Standardize for comparison
- `findMatch(newTaskText, oldTasks)` — Fuzzy match algorithm

**Critical for UX:** When regenerating goals, old task completion states are preserved by matching new tasks to old ones. This means if you check "Buy Milk" off, and later regenerate goals with "Buy milk!" (slight wording change), it will still be marked as complete.

```javascript
// Example: Find if "Buy Milk!" matches old task
const oldTasks = [
  { id: "1", text: "Buy Milk", completed: true }
];
const match = TextMatchingModule.findMatch("Buy Milk!", oldTasks);
// Returns: { id: "1", text: "Buy Milk", completed: true }
```

**Matching Strategies:**
1. Exact normalized match: "Buy Milk" === "buy milk!"
2. Substring containment: Handles slight rewording

#### 4. **TasksModule**
State management for goals:
- `getState()` / `setState(tasks)` — Manage current tasks
- `mergeWithOldState(newTasks, oldTasks)` — **Key function** that preserves completion state
- `render(tasks)` — Render to DOM

```javascript
// Example: Merge preserves checked state
const newTasks = { today: ["Buy Milk!"], overall: [] };
const oldTasks = { today: [{ id: "1", text: "Buy Milk", completed: true }], overall: [] };
const merged = TasksModule.mergeWithOldState(newTasks, oldTasks);
// Result: { today: [{ id: "1", text: "Buy Milk!", completed: true }], overall: [] }
```

#### 5. **GroqModule**
AI integration (backend communication only):
- `generateTasks(journalText)` — Single async function

The actual Groq API call happens in `server.js`; this module just orchestrates the fetch.

```javascript
// Example: Generate goals from journal
const tasks = await GroqModule.generateTasks("I feel overwhelmed...");
// Returns: { today: ["Write report", "Call therapist"], overall: [...] }
```

#### 6. **UIModule**
High-level user interactions:
- `navigateToPage(pageName)` — Switch between journal/tasks
- `setStatus(message, options)` — Display feedback
- `handleMakeSense()` — Main workflow
- `handleBackToJournal()` — Navigation
- `handleRegenerate()` — Reuse current journal

This is where the event handlers wire up and orchestrate the flow.

---

## User Flow

### 1. Journal Page (Page 1)
```
User Types Journal
    ↓
Auto-saved to localStorage every 800ms
    ↓
User clicks "Make Sense" (or Cmd/Ctrl+Enter)
    ↓
Journal saved to storage
    ↓
```

### 2. Task Generation
```
Journal sent to Groq AI via backend
    ↓
Groq responds with JSON: { today: [...], overall: [...] }
    ↓
New tasks merged with old tasks (preserving completion state)
    ↓
Tasks saved to localStorage
    ↓
```

### 3. Tasks Page (Page 2)
```
Tasks rendered with checkboxes
    ↓
User can check/uncheck goals
    ↓
Completion state saved to localStorage on change
    ↓
User clicks "Regenerate" to create new goals
    ↓
Returns to Journal Page
    ↓
New goals generated but completion state preserved
```

---

## Data Model

### Journal
```javascript
// Single string stored in localStorage
"I had a good day but felt scattered. Want to focus on health and learning."
```

### Tasks
```javascript
{
  today: [
    { id: "uuid-1", text: "Exercise for 30 minutes", completed: false },
    { id: "uuid-2", text: "Read 1 chapter", completed: true },
  ],
  overall: [
    { id: "uuid-3", text: "Learn Spanish", completed: false },
    { id: "uuid-4", text: "Build a healthier sleep routine", completed: false },
  ]
}
```

---

## Key Decisions

### 1. Modular Over Monolithic
Each module is a self-contained IIFE with no external dependencies. This makes:
- **Testing** easier (each module testable in isolation)
- **Debugging** simpler (clear responsibility boundaries)
- **Future features** like habits or analytics easy to add

### 2. Semantic Matching for Completion Preservation
When regenerating goals, we don't just replace them. We intelligently match old tasks to new ones using text normalization. This means:
- User's progress isn't lost on regeneration
- Slight wording changes (from Groq) don't break state
- UX feels like continuous work, not fresh start

### 3. No Framework Dependencies
Just vanilla HTML/CSS/JavaScript. This gives:
- **No build step** required
- **Instant load** in browser
- **Easy to modify** without tooling knowledge

### 4. Modern Dark Design
- Deep charcoal/navy background (`#0f1015`)
- Glassmorphism effects (backdrop-filter blur)
- Subtle gradient overlays
- Calm, grounding aesthetic (no harsh whites)
- Accent color (`#6b8eff`) for primary actions

---

## Customization Guide

### Add a New Goal Category
Currently: `today` and `overall`

To add a third (e.g., `projects`):

1. **Update server.js system prompt** — Tell Groq to extract `projects` category
2. **Update TasksModule.mergeWithOldState()** — Add `projects` processing
3. **Update TasksModule.render()** — Add `renderSection("Projects", tasks.projects)`

### Change the Accent Color
In `style.css`:
```css
:root {
  --accent: #6b8eff;  /* Change this to your color */
}
```

### Modify System Prompt (Groq)
In `server.js`, find `SYSTEM_PROMPT`. Edit the instructions to change what Groq extracts or how.

### Add Auto-save to a Backend
In `StorageModule.saveTasks()` and `.saveJournalDraft()`, add a fetch call to persist to your server instead of localStorage.

---

## Error Handling

The app gracefully handles:
- **Invalid JSON from localStorage** — Falls back to empty state
- **Groq API failures** — Shows user-friendly error message
- **Network errors** — Displays status and allows retry
- **Missing DOM elements** — Null checks prevent crashes

---

## Performance

### Optimization Techniques
1. **DOM caching** — DOMModule caches element references
2. **Debounced auto-save** — Journal saves after 800ms of inactivity
3. **Event delegation** — Checkbox listeners use closures (no event bubbling)
4. **Minimal reflows** — Batch DOM updates in render functions

### Bundle Size
- **HTML**: ~2 KB
- **CSS**: ~15 KB
- **JavaScript**: ~18 KB
- **Total**: ~35 KB (uncompressed)

---

## Browser Support

- Modern browsers (Chrome, Safari, Firefox, Edge)
- Requires: ES6+, localStorage, CSS Grid/Flexbox
- Mobile-responsive down to 480px width

---

## Future Enhancement Ideas

With this modular architecture, easy to add:

1. **Habit Tracking** — New HabitsModule
2. **Analytics** — Track goal completion rates
3. **Sync** — Backend sync with auto-persistence
4. **Export** — Save goals as markdown/PDF
5. **Voice Input** — Record journal entries
6. **Different AI Models** — Swap Groq for Claude/GPT
7. **Tags/Categories** — Organize goals further

Each feature can be added as a new module without refactoring existing code.

---

## Troubleshooting

### Goals not saving
1. Check browser console for errors
2. Verify localStorage is enabled in browser settings
3. Clear browser cache and reload

### Groq API errors
1. Verify `.env` has valid `GROQ_API_KEY`
2. Check server logs: `node server.js` should show requests
3. Test endpoint: `curl http://localhost:3000/api/grox` (POST with JSON body)

### Styles not loading
1. Hard refresh browser (Cmd+Shift+R on Mac)
2. Verify `style.css` exists in same directory as `index.html`
3. Check browser network tab for 404 errors

---

## Running the App

### Start
```bash
cd /path/to/axis
node server.js
# Opens on http://localhost:3000
```

### Development
No build step needed. Edit files and reload browser.

### Files
- `index.html` — App structure
- `style.css` — Modern dark design (15 KB, well-organized CSS variables)
- `script.js` — Modular JavaScript (532 lines, 5+ modules)
- `server.js` — Express proxy to Groq API

---

## Philosophy

Axis is built on three principles:

1. **Clarity** — Code is easy to understand and modify
2. **Calmness** — UI is peaceful and grounded, not flashy
3. **Continuity** — User's progress is never lost, even on regeneration

The modular architecture makes it easy for others to understand, extend, and maintain.
