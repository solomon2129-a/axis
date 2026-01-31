/**
 * AXIS — PRODUCTION-READY ARCHITECTURE
 * 
 * Modular structure with clear separation of concerns:
 * - Storage: Persistence layer for journal and tasks
 * - UI: Page navigation and DOM rendering
 * - Tasks: Task state management with completion preservation
 * - Groq: AI integration for task extraction
 * 
 * The key insight: Always preserve completion state when regenerating,
 * using semantic text matching to find old tasks in new lists.
 */

console.log("[Axis] Script loaded successfully");

// ============================================================================
// SIMPLE AUTH CONTROLLER – decides which UI to show based on Firebase state
// ============================================================================

const SimpleAuthController = (() => {
  let isAuthenticated = false;
  let authLoading = true;
  let currentUser = null;

  // Update menu visibility based on auth state
  const updateMenuState = (isLoggedIn) => {
    const userInfo = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-menu-btn');
    const menuLoginBtn = document.getElementById('menu-login-btn');
    const menuSignupBtn = document.getElementById('menu-signup-btn');

    if (isLoggedIn) {
      // Logged in: show user info and logout, hide login/signup
      if (userInfo) userInfo.style.display = 'block';
      if (logoutBtn) logoutBtn.classList.remove('hidden');
      if (menuLoginBtn) menuLoginBtn.classList.add('hidden');
      if (menuSignupBtn) menuSignupBtn.classList.add('hidden');
    } else {
      // Logged out: hide user info and logout, show login/signup (if needed in menu)
      if (userInfo) userInfo.style.display = 'none';
      if (logoutBtn) logoutBtn.classList.add('hidden');
      // Login/signup in menu stay hidden - users use Start page buttons instead
      if (menuLoginBtn) menuLoginBtn.classList.add('hidden');
      if (menuSignupBtn) menuSignupBtn.classList.add('hidden');
    }
  };

  // ---------- Intro animation – scramble on the start-title element ----------
  // Separated out so router can trigger it when the Start page is rendered
  const runIntro = () => {
    const textEl = document.querySelector('.start-title');
    if (!textEl) return;

    const target = 'Axis.';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const length = target.length;
    let startTime = null;
    const duration = 4000;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);
      const resolveCount = Math.floor(t * length);
      let display = '';
      for (let i = 0; i < length; i++) {
        if (i < resolveCount) display += target[i];
        else display += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      textEl.textContent = display;
      if (t < 1) requestAnimationFrame(step);
      else {
        textEl.textContent = target;
        startIntroSequence();
        sessionStorage.setItem('introDone', '1');
      }
    };
    requestAnimationFrame(step);
  };

  function startIntroSequence() {
    const tagline = document.querySelector('.start-tagline');
    if (tagline) tagline.textContent = 'Clutter → Clarity';
    const buttons = document.querySelector('.start-buttons');
    // allow CSS `.intro-done` to handle visibility
    if (buttons) buttons.style.opacity = '';
    setTimeout(() => document.body.classList.add('intro-done'), 100);
  }

  const replay = () => {
    sessionStorage.removeItem('introDone');
    const tagline = document.querySelector('.start-tagline');
    const buttons = document.querySelector('.start-buttons');
    if (tagline) tagline.style.opacity = '';
    if (buttons) buttons.style.opacity = '';
    document.body.classList.remove('intro-done');
    runIntro();
  };

  // Show public UI (start page visible)
  const showPublic = () => {
    console.log('[SimpleAuth] Showing public UI');
    
    // Hide all pages
    document.querySelectorAll('.page').forEach((p) => p.classList.remove('page-active'));
    
    // Do not force a specific public page here; routing determines which public page is shown

    // Hide axis header
    const axisHeader = document.getElementById('axis-header');
    if (axisHeader) axisHeader.classList.remove('visible');

    // Hide floating dock
    const dock = document.querySelector('.floating-dock');
    if (dock) dock.style.display = 'none';

    // Update menu state: hide user info and logout
    updateMenuState(false);


    // Init UI handlers for auth pages
    if (typeof AuthUIModule !== 'undefined' && AuthUIModule.init) AuthUIModule.init();

    // Resilient fallback: ensure start buttons always navigate even if AuthUIModule didn't attach handlers
    (function attachStartButtonFallbacks() {
      const startLoginBtn = document.getElementById('start-login-btn');
      const startSignupBtn = document.getElementById('start-signup-btn');

      if (startLoginBtn && !startLoginBtn.dataset.fallbackWired) {
        startLoginBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('LOGIN CLICKED');
          // Make sure any overlay doesn't swallow clicks
          document.querySelectorAll('.modal-overlay, .overlay, #intro-overlay').forEach((o) => {
            if (o && o.style) o.style.pointerEvents = 'none';
          });
          // Prefer AuthUIModule navigation if available
          if (typeof AuthUIModule !== 'undefined' && AuthUIModule.showPage) {
            AuthUIModule.showPage('page-login');
          } else {
            // Robust direct navigation: hide all pages, then show target
            const pages = document.querySelectorAll('.page');
            pages.forEach((p) => {
              p.classList.remove('page-active');
              p.style.display = 'none';
              p.style.opacity = '0';
              p.style.pointerEvents = 'none';
            });
            const target = document.getElementById('page-login');
            if (target) {
              target.classList.add('page-active');
              target.style.display = 'flex';
              target.style.opacity = '1';
              target.style.pointerEvents = 'auto';
              // focus first input for better UX
              const firstInput = target.querySelector('input, button, textarea');
              if (firstInput) firstInput.focus();
              window.scrollTo(0, 0);
            }
          }
          try { history.pushState({}, '', '/login'); } catch (err) { /* ignore */ }
          if (window.route) window.route(window.location.pathname);
        });
        startLoginBtn.dataset.fallbackWired = '1';
      }

      if (startSignupBtn && !startSignupBtn.dataset.fallbackWired) {
        startSignupBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('SIGNUP CLICKED');
          document.querySelectorAll('.modal-overlay, .overlay, #intro-overlay').forEach((o) => {
            if (o && o.style) o.style.pointerEvents = 'none';
          });
          if (typeof AuthUIModule !== 'undefined' && AuthUIModule.showPage) {
            AuthUIModule.showPage('page-signup');
          } else {
            const pages = document.querySelectorAll('.page');
            pages.forEach((p) => {
              p.classList.remove('page-active');
              p.style.display = 'none';
              p.style.opacity = '0';
              p.style.pointerEvents = 'none';
            });
            const target = document.getElementById('page-signup');
            if (target) {
              target.classList.add('page-active');
              target.style.display = 'flex';
              target.style.opacity = '1';
              target.style.pointerEvents = 'auto';
              const firstInput = target.querySelector('input, button, textarea');
              if (firstInput) firstInput.focus();
              window.scrollTo(0, 0);
            }
          }
          try { history.pushState({}, '', '/signup'); } catch (err) { /* ignore */ }
          if (window.route) window.route(window.location.pathname);
        });
        startSignupBtn.dataset.fallbackWired = '1';
      }
    })();
    // (Intro functions moved to module scope so router can trigger them)
  };

  // Show private UI (journal page visible)
  const showPrivate = async () => {
    console.log('[SimpleAuth] Showing private UI');
    
    // Clear any old localStorage data from previous user
    try {
      localStorage.removeItem('journal-draft');
      localStorage.removeItem('tasks');
      localStorage.removeItem('journal-entries');
    } catch (e) {
      console.warn('Error clearing localStorage', e);
    }
    
    // Hide all pages
    document.querySelectorAll('.page').forEach((p) => p.classList.remove('page-active'));
    
    // Show journal page
    const journal = document.getElementById('page-journal');
    if (journal) journal.classList.add('page-active');

    // Show axis header
    const axisHeader = document.getElementById('axis-header');
    if (axisHeader) axisHeader.classList.add('visible');

    // Show floating dock
    const dock = document.querySelector('.floating-dock');
    if (dock) dock.style.display = 'flex';

    // Update menu state: show user info and logout
    updateMenuState(true);

    // Load user data from Firestore (if available)
    try {
      // Load user profile (name, email)
      if (typeof AuthModule.loadUserProfile === 'function') {
        const profile = await AuthModule.loadUserProfile(currentUser.uid);
        const userName = profile.name || currentUser.email.split('@')[0];
        
        // Update settings modal with user info
        const settingsNameDisplay = document.getElementById('settings-name-display');
        if (settingsNameDisplay) settingsNameDisplay.textContent = userName;
        
        const settingsEmailDisplay = document.getElementById('settings-email-display');
        if (settingsEmailDisplay) settingsEmailDisplay.textContent = currentUser.email;
        
        // Update journal tagline
        const tagline = document.getElementById('app-tagline');
        if (tagline) tagline.textContent = `Hey, ${userName}...`;
      }
      
      if (typeof AuthModule.loadJournal === 'function') {
          const overlay = document.getElementById('intro-overlay');
          if (overlay) {
            // Hide overlay for private UI; intro animation not needed
            overlay.style.display = 'none';
          }
      }
      if (typeof AuthModule.loadTasks === 'function') {
        const tasksData = await AuthModule.loadTasks(currentUser.uid);
        if (tasksData) {
          TasksModule.setState(tasksData);
          StorageModule.saveTasks(tasksData);
          // Only render tasks if we're on the dashboard (tasks container exists)
          if (DOMModule.getTasksContainer()) {
            TasksModule.render(tasksData);
          }
        }
      }

      // Load journal entries from Firestore
      if (typeof AuthModule.loadJournalEntries === 'function') {
        const entriesData = await AuthModule.loadJournalEntries(currentUser.uid);
        if (entriesData && entriesData.length > 0) {
          console.log('[SimpleAuth] Loaded journal entries from Firestore:', entriesData.length);
          // Store in a global variable so renderJournalHistory can access it
          window.__userJournalEntries = entriesData;
        } else {
          window.__userJournalEntries = [];
        }
      }
    } catch (e) {
      console.warn('Failed to load Firestore data', e);
    }

    // Init UI for private app (dock navigation already wired in script.js)
    if (typeof AuthUIModule !== 'undefined' && AuthUIModule.init) AuthUIModule.init();
  };

  // Firebase auth state listener
  const handleAuthChange = async (user) => {
    authLoading = true;
    if (user) {
      isAuthenticated = true;
      currentUser = user;
      window.__axisAuthenticated = true;
      await showPrivate();
    } else {
      isAuthenticated = false;
      currentUser = null;
      window.__axisAuthenticated = false;
      // Clear all user data from localStorage on logout
      try {
        localStorage.removeItem('journal-draft');
        localStorage.removeItem('tasks');
        localStorage.removeItem('journal-entries');
        console.log('[SimpleAuth] Cleared user data on logout');
      } catch (e) {
        console.warn('Error clearing localStorage', e);
      }
      showPublic();
    }
    authLoading = false;
  };

  const init = async () => {
    if (!window || !window.firebaseReady) {
      console.warn('Firebase not ready');
      authLoading = false;
      showPublic();
      return;
    }
    try {
      await window.firebaseReady;
      if (window.firebaseAuth && window.firebaseDb) {
        if (typeof AuthModule !== 'undefined' && AuthModule.init) {
          AuthModule.init(window.firebaseAuth, window.firebaseDb);
        }
        if (typeof AuthModule !== 'undefined' && AuthModule.onAuthStateChange) {
          AuthModule.onAuthStateChange(handleAuthChange);
        }
      } else {
        console.warn('Firebase auth/db missing');
        authLoading = false;
        showPublic();
      }
    } catch (e) {
      console.error('Firebase init error', e);
      authLoading = false;
      showPublic();
    }
  };

  // expose init and some helpers used by the router
  return { init, runIntro, replay, showPrivate };
})();

// Initialize simple auth controller on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SimpleAuthController.init();
});

// Router: simple client-side routing for public pages
window.route = function(pathname) {
  const path = (pathname || window.location.pathname || '/').replace(/\/?$/, '') || '/';
  const isAuth = !!window.__axisAuthenticated;

  if (isAuth) {
    // Authenticated users go to journal
    SimpleAuthController.showPrivate();
    try { history.replaceState({}, '', '/journal'); } catch (e) {}
    return;
  }

  // Public routing
  if (path === '/' || path === '') {
    // Ensure a fresh intro animation each time the start page is shown.
    // Remove any previous flag so the scramble runs again.
    sessionStorage.removeItem('introDone');
    if (typeof AuthUIModule !== 'undefined' && AuthUIModule.showPage) AuthUIModule.showPage('page-start');
    if (SimpleAuthController.runIntro) SimpleAuthController.runIntro();
    return;
  }

  if (path === '/login') {
    if (typeof AuthUIModule !== 'undefined' && AuthUIModule.showPage) AuthUIModule.showPage('page-login');
    return;
  }

  if (path === '/signup') {
    if (typeof AuthUIModule !== 'undefined' && AuthUIModule.showPage) AuthUIModule.showPage('page-signup');
    return;
  }

  // Unknown -> start
  if (typeof AuthUIModule !== 'undefined' && AuthUIModule.showPage) AuthUIModule.showPage('page-start');
  if (!sessionStorage.getItem('introDone') && SimpleAuthController.runIntro) SimpleAuthController.runIntro();
};

window.addEventListener('popstate', () => window.route(window.location.pathname));

// ---------------------------------------------------------------------
// Initial navigation – run the router once on page load so the correct
// page is displayed and the intro animation is triggered on the start
// page. This replaces any previous ad‑hoc fallback logic.
// ---------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  window.route(window.location.pathname);
});

// ============================================================================
// STORAGE MODULE — Manage journal drafts and task persistence
// ============================================================================

const StorageModule = (() => {
  const KEYS = {
    JOURNAL_DRAFT: "axis.journal.v2",
    TASKS: "axis.tasks.v2",
    JOURNAL_ENTRIES: "axis.journal.entries.v1",
  };

  return {
    // Journal persistence (single string)
    getJournalDraft() {
      return localStorage.getItem(KEYS.JOURNAL_DRAFT) || "";
    },

    saveJournalDraft(text) {
      localStorage.setItem(KEYS.JOURNAL_DRAFT, text);
    },

    // Tasks persistence (flat array structure)
    getTasks() {
      try {
        const data = localStorage.getItem(KEYS.TASKS);
        if (!data) return [];
        
        const parsed = JSON.parse(data);
        
        // Handle legacy format { today: [], overall: [] }
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.today || parsed.overall)) {
          console.log("[StorageModule] Converting legacy task format to flat array");
          const converted = [
            ...(parsed.today || []),
            ...(parsed.overall || [])
          ];
          // Save in new format
          this.saveTasks(converted);
          return converted;
        }
        
        // Return as array (handles both new format and edge cases)
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },

    saveTasks(tasks) {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    },

    // Journal entries persistence (array of past journal submissions)
    getJournalEntries() {
      try {
        const data = localStorage.getItem(KEYS.JOURNAL_ENTRIES);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    },

    saveJournalEntry(entry) {
      const entries = this.getJournalEntries();
      entries.push({
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString(),
        id: entry.id || `journal-${Date.now()}`
      });
      localStorage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
    },

    deleteJournalEntry(id) {
      const entries = this.getJournalEntries();
      const filtered = entries.filter(e => e.id !== id);
      localStorage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(filtered));
    },

    // Clear everything (useful for reset)
    clear() {
      localStorage.removeItem(KEYS.JOURNAL_DRAFT);
      localStorage.removeItem(KEYS.TASKS);
      localStorage.removeItem(KEYS.JOURNAL_ENTRIES);
    },
  };
})();

// ============================================================================
// DOM MODULE — Query and update UI elements
// ============================================================================

const DOMModule = (() => {
  // Cache DOM references for performance
  const cache = {};

  const getElement = (id) => {
    if (!cache[id]) {
      cache[id] = document.getElementById(id);
    }
    return cache[id];
  };

  return {
    // Pages
    getJournalPage() {
      return getElement("page-journal");
    },

    getTasksPage() {
      return getElement("page-tasks");
    },

    // Journal page
    getJournalTextarea() {
      return getElement("journal-input");
    },

    getStatusMessage() {
      return getElement("status-message");
    },

    getMakeSenseButton() {
      return getElement("make-sense-btn");
    },

    // Tasks page
    getBackButton() {
      return getElement("back-btn");
    },

    getRegenerateButton() {
      return getElement("regenerate-btn");
    },

    getTasksContainer() {
      return getElement("tasks-container");
    },

    getTasksMeta() {
      return getElement("tasks-meta");
    },
  };
})();

// ============================================================================
// TEXT MATCHING MODULE — Semantic matching for task deduplication
// ============================================================================

const TextMatchingModule = (() => {
  /**
   * Normalize text for comparison:
   * - Lowercase for case-insensitive matching
   * - Remove special characters
   * - Collapse whitespace
   * 
   * Example: "Buy Milk!" → "buy milk"
   */
  function normalizeText(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ");
  }

  /**
   * Find old task that matches new task text
   * Uses multiple strategies:
   * 1. Exact normalized match
   * 2. Substring containment
   * 
   * Returns the old task object or null if no match
   */
  function findMatch(newTaskText, oldTasks) {
    const newNorm = normalizeText(newTaskText);

    for (const oldTask of oldTasks) {
      const oldNorm = normalizeText(oldTask.text);

      // Exact match after normalization
      if (oldNorm === newNorm) {
        return oldTask;
      }

      // One-directional containment (handles slight wording changes)
      if (
        oldNorm.includes(newNorm) || 
        newNorm.includes(oldNorm)
      ) {
        return oldTask;
      }
    }

    return null;
  }

  return {
    normalizeText,
    findMatch,
  };
})();

// ============================================================================
// TASKS MODULE — Task state management and UI rendering
// ============================================================================

const TasksModule = (() => {
  let currentState = [];

  /**
   * Remove duplicate tasks from the task list
   * Compares tasks by normalized text to catch similar wording
   */
  function removeDuplicates(tasks) {
    const seen = new Set();
    return (tasks || []).filter(task => {
      const normalized = TextMatchingModule.normalizeText(task.text);
      if (seen.has(normalized)) {
        console.log("[TasksModule] Removing duplicate task:", task.text);
        return false;
      }
      seen.add(normalized);
      return true;
    });
  }

  /**
   * Preserve completion state from old tasks in new task list
   * 
   * When regenerating, match old tasks to new tasks and preserve
   * their "completed" status. This ensures user's progress isn't lost.
   * 
   * Algorithm:
   * 1. For each new task, find matching old task
   * 2. Keep old completion state or default to false if new
   */
  function mergeWithOldState(newTasks, oldTasks) {
    // newTasks is an array, oldTasks is an array
    return (newTasks || []).map((taskText) => {
      const oldTask = TextMatchingModule.findMatch(taskText, oldTasks || []);
      return {
        id: oldTask?.id || `task-${Date.now()}-${Math.random()}`,
        text: taskText,
        completed: oldTask?.completed || false,
      };
    });
  }

  /**
   * Render a single task section (e.g., "Today's Goals")
   */
  function renderSection(title, tasks) {
    const section = document.createElement("div");
    section.className = "task-section";

    // Title
    const titleEl = document.createElement("div");
    titleEl.className = "task-section-title";
    titleEl.textContent = title;
    section.appendChild(titleEl);

    // Empty state
    if (tasks.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "tasks-empty";
      emptyEl.textContent = "No goals in this category";
      section.appendChild(emptyEl);
      return section;
    }

    // Task list
    const listEl = document.createElement("ul");
    listEl.className = "task-list";

    for (const task of tasks) {
      const itemEl = document.createElement("li");
      itemEl.className = "task-item";
      itemEl.style.cssText = "display: flex; align-items: center; gap: 8px; padding: 8px 0;";

      // Checkbox
      const checkboxEl = document.createElement("input");
      checkboxEl.type = "checkbox";
      checkboxEl.className = "task-checkbox";
      checkboxEl.checked = task.completed;
      checkboxEl.id = task.id;

      // Label/text
      const labelEl = document.createElement("label");
      labelEl.htmlFor = task.id;
      labelEl.className = "task-text";
      labelEl.textContent = task.text;
      labelEl.style.cssText = "flex: 1; cursor: pointer; word-break: break-word;";

      // Handle checkbox changes (persist to storage and Firestore)
      checkboxEl.addEventListener("change", () => {
        task.completed = checkboxEl.checked;
        labelEl.classList.toggle("task-completed", task.completed);
        StorageModule.saveTasks(currentState);

        // Also save to Firestore if logged in
        try {
          const user = (typeof AuthModule !== 'undefined' && AuthModule.getCurrentUser) ? AuthModule.getCurrentUser() : null;
          if (user && typeof AuthModule.saveTasks === 'function') {
            AuthModule.saveTasks(user.uid, currentState).catch(() => {});
          }
        } catch (e) {
          // ignore
        }
      });

      // Visual state for completed tasks
      if (task.completed) {
        labelEl.classList.add("task-completed");
      }

      // Create action buttons container
      const actionsContainer = document.createElement("div");
      actionsContainer.style.cssText = "display: flex; gap: 6px; margin-left: auto;";

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.textContent = "✎";
      editBtn.style.cssText = "background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.9rem; padding: 4px 6px; transition: color 0.2s;";
      editBtn.onmouseover = () => editBtn.style.color = "var(--accent)";
      editBtn.onmouseout = () => editBtn.style.color = "var(--text-secondary)";
      editBtn.addEventListener("click", () => {
        const newText = prompt("Edit task:", task.text);
        if (newText && newText.trim()) {
          task.text = newText.trim();
          labelEl.textContent = task.text;
          StorageModule.saveTasks(currentState);
          try {
            const user = (typeof AuthModule !== 'undefined' && AuthModule.getCurrentUser) ? AuthModule.getCurrentUser() : null;
            if (user && typeof AuthModule.saveTasks === 'function') {
              AuthModule.saveTasks(user.uid, currentState).catch(() => {});
            }
          } catch (e) {}
        }
      });

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "✕";
      deleteBtn.style.cssText = "background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.9rem; padding: 4px 6px;";
      deleteBtn.addEventListener("click", () => {
        if (confirm("Delete this task?")) {
          const index = currentState.indexOf(task);
          if (index > -1) {
            currentState.splice(index, 1);
            StorageModule.saveTasks(currentState);
            try {
              const user = (typeof AuthModule !== 'undefined' && AuthModule.getCurrentUser) ? AuthModule.getCurrentUser() : null;
              if (user && typeof AuthModule.saveTasks === 'function') {
                AuthModule.saveTasks(user.uid, currentState).catch(() => {});
              }
            } catch (e) {}
            render(currentState);
          }
        }
      });

      actionsContainer.appendChild(editBtn);
      actionsContainer.appendChild(deleteBtn);

      itemEl.appendChild(checkboxEl);
      itemEl.appendChild(labelEl);
      itemEl.appendChild(actionsContainer);
      listEl.appendChild(itemEl);
    }

    section.appendChild(listEl);
    return section;
  }

  /**
   * Full render of tasks page
   */
  function render(tasks) {
    const container = DOMModule.getTasksContainer();
    container.innerHTML = "";

    // Calculate completed count
    const completedCount = (tasks || []).filter(t => t.completed).length;
    const completedEl = document.getElementById('completed-count');
    if (completedEl) {
      completedEl.textContent = completedCount;
    }

    // Handle empty state
    if (!tasks || tasks.length === 0) {
      container.innerHTML =
        '<div class="tasks-empty">No tasks yet. Start by journaling.</div>';
      return;
    }

    // Render only pending tasks (not completed)
    const pendingTasks = (tasks || []).filter(t => !t.completed);

    if (pendingTasks.length === 0) {
      container.innerHTML =
        '<div class="tasks-empty">All tasks completed! 🎉</div>';
      return;
    }

    // Render single tasks section
    container.appendChild(renderSection("TASKS", pendingTasks));
  }

  return {
    getState: () => currentState,
    setState: (tasks) => {
      currentState = tasks;
    },
    mergeWithOldState,
    removeDuplicates,
    render,
  };
})();

// ============================================================================
// GROQ MODULE — AI integration for task extraction
// ============================================================================

const GroqModule = (() => {
  /**
   * Call backend to generate tasks from journal text
   * 
   * Backend (server.js) handles:
   * - Sending to Groq API
   * - System prompt with JSON enforcement
   * - Error handling and retries
   * 
   * Returns: { success: boolean, tasks: { today: [], overall: [] } }
   */
  async function generateTasks(journalText) {
    console.log("[GroqModule] Generating tasks from journal...");
    
    const resp = await fetch("/api/grox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: journalText }),
    });

    console.log("[GroqModule] Response status:", resp.status);

    if (!resp.ok) {
      console.error("[GroqModule] Error response received:", resp.status);
      try {
        const errData = await resp.json();
        console.error("[GroqModule] Error from server:", errData);
        throw new Error(errData.error || errData.detail || `HTTP ${resp.status}`);
      } catch (e) {
        if (e instanceof SyntaxError) {
          // Response wasn't JSON
          console.error("[GroqModule] Response was not JSON (status:", resp.status + ")");
          throw new Error(`Server error: HTTP ${resp.status}`);
        }
        throw e;
      }
    }

    let data;
    try {
      data = await resp.json();
    } catch (e) {
      console.error("[GroqModule] Failed to parse response as JSON");
      throw new Error("Server returned invalid JSON response");
    }
    
    console.log("[GroqModule] Success response:", data);
    
    if (!data?.success) {
      console.error("[GroqModule] Response not successful:", data);
      throw new Error(data?.error || "Server returned success:false");
    }

    let tasks = data.tasks;
    
    console.log("[GroqModule] Tasks received:", tasks, "Type:", typeof tasks, "Is array:", Array.isArray(tasks));
    
    // Ensure tasks is an array
    if (!Array.isArray(tasks)) {
      console.warn("[GroqModule] Tasks is not an array, attempting conversion:", tasks);
      // If it's an object with today/overall, flatten it
      if (tasks && typeof tasks === 'object' && (tasks.today || tasks.overall)) {
        console.log("[GroqModule] Converting legacy format to array");
        tasks = [...(tasks.today || []), ...(tasks.overall || [])];
      } else {
        console.error("[GroqModule] Could not convert tasks to array format");
        tasks = [];
      }
    }

    return tasks;
  }

  return {
    generateTasks,
  };
})();

// ============================================================================
// UI MODULE — Page navigation and state updates
// ============================================================================

const UIModule = (() => {
  let statusTimeout = null;

  /**
   * Display status message with optional auto-clear
   */
  function setStatus(message, options = {}) {
    const statusEl = DOMModule.getStatusMessage();
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.classList.toggle("success", !!options.isSuccess);

    // Auto-clear after delay
    if (options.clearAfter) {
      clearTimeout(statusTimeout);
      statusTimeout = setTimeout(() => {
        statusEl.textContent = "";
      }, options.clearAfter);
    }
  }

  /**
   * Navigate between private pages (journal/tasks)
   */
  function navigateToPage(pageName) {
    // Hide all private pages
    document.getElementById('page-journal')?.classList.remove('page-active');
    document.getElementById('page-tasks')?.classList.remove('page-active');

    // Show target page
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
      targetPage.classList.add('page-active');
      updateDockActiveState(pageName);

      // Render tasks if navigating to tasks page
      if (pageName === 'tasks') {
        TasksModule.render(TasksModule.getState());
      }
    }
  }

  /**
   * Toggle between journal and tasks pages
   */
  function handlePageToggle(pageName) {
    navigateToPage(pageName);
  }

  /**
   * Update which dock item is active
   */
  function updateDockActiveState(pageName) {
    document.querySelectorAll(".dock-item").forEach((item) => {
      item.classList.remove("active");
    });
    const activeItem = document.querySelector(`[data-page="${pageName}"]`);
    if (activeItem) {
      activeItem.classList.add("active");
    }
  }

  /**
   * Internal function to generate tasks from journal text
   * Used by both handleMakeSense and handleRegenerate
   */
  async function generateAndDisplayTasks(journalText, fromMakeSense = true) {
    // Validation
    if (!journalText.trim()) {
      setStatus("Write something first.", { clearAfter: 2000 });
      return;
    }

    // Save draft
    StorageModule.saveJournalDraft(journalText);

    // Also save journal to Firestore if logged in
    try {
      const user = (typeof AuthModule !== 'undefined' && AuthModule.getCurrentUser) ? AuthModule.getCurrentUser() : null;
      if (user && typeof AuthModule.saveJournal === 'function') {
        AuthModule.saveJournal(user.uid, journalText).catch(() => {});
      }
    } catch (e) {
      // ignore
    }

    // Disable appropriate button and show loading
    const btn = fromMakeSense ? DOMModule.getMakeSenseButton() : DOMModule.getRegenerateButton();
    if (btn) btn.disabled = true;
    setStatus("Extracting tasks…");

    try {
      console.log("[UIModule] Calling GroqModule.generateTasks...");
      // Generate tasks from Groq
      let newTasksArray = await GroqModule.generateTasks(journalText);
      
      console.log("[UIModule] Got tasks back:", newTasksArray);

      // Ensure newTasksArray is an array
      if (!Array.isArray(newTasksArray)) {
        console.warn("[UIModule] newTasksArray is not an array, converting:", newTasksArray);
        newTasksArray = [];
      }

      // Get old tasks
      let oldTasks = StorageModule.getTasks();
      
      // Ensure oldTasks is an array
      if (!Array.isArray(oldTasks)) {
        console.warn("[UIModule] oldTasks is not an array, converting:", oldTasks);
        oldTasks = [];
      }
      
      // Append new tasks to old tasks instead of replacing
      let appendedTasks = [
        ...oldTasks,
        ...newTasksArray.map(text => ({
          id: `task-${Date.now()}-${Math.random()}`,
          text: text,
          completed: false
        }))
      ];

      // Remove duplicates
      appendedTasks = TasksModule.removeDuplicates(appendedTasks);
      console.log("[UIModule] After removing duplicates:", appendedTasks);

      // Update state and persist
      TasksModule.setState(appendedTasks);
      StorageModule.saveTasks(appendedTasks);

      // Also save tasks to Firestore if logged in
      try {
        const user = (typeof AuthModule !== 'undefined' && AuthModule.getCurrentUser) ? AuthModule.getCurrentUser() : null;
        if (user && typeof AuthModule.saveTasks === 'function') {
          AuthModule.saveTasks(user.uid, appendedTasks).catch(() => {});
        }
      } catch (e) {
        // ignore
      }

      // Save journal entry with timestamp
      try {
        const journalEntry = {
          text: journalText,
          timestamp: new Date().toISOString(),
          id: `journal-${Date.now()}`,
          tasksGenerated: newTasksArray
        };
        
        // Save to localStorage
        StorageModule.saveJournalEntry(journalEntry);
        
        // Also save to Firestore if logged in
        const user = (typeof AuthModule !== 'undefined' && AuthModule.getCurrentUser) ? AuthModule.getCurrentUser() : null;
        if (user && typeof AuthModule.saveJournalEntry === 'function') {
          await AuthModule.saveJournalEntry(user.uid, journalEntry).catch(() => {});
        }
        
        console.log("[UIModule] Journal entry saved:", journalEntry.id);
      } catch (e) {
        console.warn("[UIModule] Failed to save journal entry:", e);
      }

      // Navigate to tasks page
      setStatus("Tasks extracted. Opening tasks…", { clearAfter: 800 });
      setTimeout(() => {
        navigateToPage("tasks");
      }, 300);
    } catch (err) {
      console.error("[UIModule] Task generation error:", err);
      const errorMsg = err.message || "Could not generate goals";
      setStatus(`❌ ${errorMsg}`, { clearAfter: 4000 });
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  /**
   * Handle "Make Sense" button click
   * 1. Save journal draft
   * 2. Generate tasks via Groq
   * 3. Merge with old state
   * 4. Navigate to tasks page
   */
  async function handleMakeSense() {
    console.log("[UIModule] handleMakeSense called");
    const textarea = DOMModule.getJournalTextarea();
    const journalText = textarea?.value || "";
    console.log("[UIModule] Journal text length:", journalText.length);
    console.log("[UIModule] Journal text:", journalText.substring(0, 100));
    await generateAndDisplayTasks(journalText, true);
  }

  /**
   * Handle "Back" button
   */
  function handleBackToJournal() {
    navigateToPage("journal");
  }

  /**
   * Handle "Regenerate" button
   * Reuse current journal text and generate new goals
   */
  async function handleRegenerate() {
    const journalText = StorageModule.getJournalDraft();
    if (!journalText.trim()) {
      setStatus("No journal entry found.", { clearAfter: 2000 });
      return;
    }
    // Use the internal function with the stored journal text
    await generateAndDisplayTasks(journalText, false);
  }

  // Wire up floating dock navigation for private app (journal/tasks)
  document.querySelectorAll('.dock-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageName = item.getAttribute('data-page');
      
      // Get current page
      const currentPage = document.getElementById('page-journal')?.classList.contains('page-active') ? 'journal' : 'tasks';
      
      if (currentPage === 'journal' && pageName === 'journal') {
        // On journal page: clicking journal icon opens journal history
        if (typeof openJournalHistory === 'function') {
          openJournalHistory();
        }
      } else if (currentPage === 'tasks' && pageName === 'tasks') {
        // On tasks page: clicking tasks icon opens completed tasks modal
        if (typeof openCompletedTasks === 'function') {
          openCompletedTasks();
        }
      } else {
        // Navigate to different page
        UIModule.handlePageToggle(pageName);
      }
    });
  });

  return {
    setStatus,
    navigateToPage,
    handleMakeSense,
    handleBackToJournal,
    handleRegenerate,
    handlePageToggle,
    updateDockActiveState,
  };
})();

// ============================================================================
// INITIALIZATION — Wire up event listeners and load saved state
// ============================================================================

console.log("[Axis] Starting initialization...");

document.addEventListener("DOMContentLoaded", () => {
  console.log("[Axis] DOMContentLoaded fired");

  // Restore journal draft from storage
  const textarea = DOMModule.getJournalTextarea();
  if (textarea) {
    textarea.value = StorageModule.getJournalDraft();

    // Auto-save draft on input (debounced)
    let saveTimer;
    textarea.addEventListener("input", () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        StorageModule.saveJournalDraft(textarea.value);
      }, 800);
    });

    // Keyboard shortcut: Cmd/Ctrl + Enter = Generate tasks
    textarea.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        UIModule.handleMakeSense();
      }
    });
  }

  // Wire up Make Sense button (only exists on dashboard)
  const makeSenseBtn = DOMModule.getMakeSenseButton();
  if (makeSenseBtn) {
    console.log("[Axis] Make Sense button found and wired");
    makeSenseBtn.addEventListener("click", (e) => {
      console.log("[Axis] Make Sense button clicked");
      UIModule.handleMakeSense();
    });
  } else {
    console.log("[Axis] Make Sense button not on this page (expected if on login/signup)");
  }

  // Load and render any saved tasks (only if on dashboard)
  const tasksContainer = DOMModule.getTasksContainer();
  if (tasksContainer) {
    const savedTasks = StorageModule.getTasks();
    TasksModule.setState(savedTasks);
    TasksModule.render(savedTasks);
  }
  
  // ===== AXIS LOGO & SETTINGS MODAL HANDLERS =====
  
  // Open settings modal directly when clicking Axis logo
  const axisLogoBtn = document.getElementById('axis-logo-btn');
  const settingsBtn = document.getElementById('settings-btn'); // sidebar gear button
  const settingsModal = document.getElementById('settings-modal');
  const settingsClose = document.getElementById('settings-close');
  const settingsLogoutBtn = document.getElementById('settings-logout-btn');
  const settingsNameEdit = document.getElementById('settings-name-edit');
  const settingsNameDisplay = document.getElementById('settings-name-display');
  const settingsNameInput = document.getElementById('settings-name-input');
  const settingsNameSave = document.getElementById('settings-name-save');
  
  // Axis logo click opens settings directly
  // Helper to open the modal with smooth fade‑in
  const openSettings = () => {
    if (!settingsModal) return;
    settingsModal.style.display = 'flex';
    // Trigger CSS opacity transition
    requestAnimationFrame(() => settingsModal.classList.add('show'));
  };

  // Helper to close the modal with fade‑out
  const closeSettings = () => {
    if (!settingsModal) return;
    settingsModal.classList.remove('show');
    // Wait for the transition to finish before hiding the element
    setTimeout(() => {
      settingsModal.style.display = 'none';
    }, 200); // match the CSS transition duration
  };

  if (axisLogoBtn) {
    axisLogoBtn.addEventListener('click', openSettings);
  }
  // Also allow opening via the sidebar settings button (if present)
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettings);
  }
  
  // Close settings modal
  if (settingsClose) {
    settingsClose.addEventListener('click', closeSettings);
  }
  
  // Close modal when clicking overlay
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        closeSettings();
      }
    });
  }
  
  // Edit name in settings
  if (settingsNameEdit && settingsNameDisplay && settingsNameInput) {
    settingsNameEdit.addEventListener('click', (e) => {
      e.preventDefault();
      // Populate input with current name
      settingsNameInput.value = settingsNameDisplay.textContent;
      // Hide the static display element (use inline style to ensure immediate hide)
      settingsNameDisplay.style.display = 'none';
      // Show the input and save button
      settingsNameInput.classList.remove('hidden');
      settingsNameSave.classList.remove('hidden');
      // Hide the edit icon while editing
      settingsNameEdit.classList.add('hidden');
      settingsNameInput.focus();
    });
  }
  
  // Save name
  if (settingsNameSave && settingsNameInput && settingsNameDisplay) {
    settingsNameSave.addEventListener('click', async () => {
      const newName = settingsNameInput.value.trim();
      if (!newName) {
        alert('Name cannot be empty');
        return;
      }
      
      try {
        const user = AuthModule.getCurrentUser();
        if (user && typeof AuthModule.updateUserProfile === 'function') {
          await AuthModule.updateUserProfile(user.uid, { name: newName });
          // Update display text
          settingsNameDisplay.textContent = newName;
          document.getElementById('app-tagline').textContent = `Hey, ${newName}...`;
          // Restore visibility
          settingsNameDisplay.style.display = '';
          settingsNameInput.classList.add('hidden');
          settingsNameSave.classList.add('hidden');
          settingsNameEdit.classList.remove('hidden');
        }
      } catch (e) {
        console.error('Error saving name:', e);
        alert('Failed to save name');
      }
    });
  }
  
  // Logout from settings
  if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener('click', async () => {
      const result = await AuthModule.logout();
      if (result.success) {
        settingsModal.style.display = 'none';
        console.log('[Settings] Logout successful, redirecting to start...');
        // Redirect to start screen instead of dashboard
        window.location.href = '/';
      }
    });
  }

  // ===== JOURNAL HISTORY MODAL HANDLERS =====
  const journalHistoryModal = document.getElementById('journal-history-modal');
  const journalHistoryClose = document.getElementById('journal-history-close');
  const journalHistoryList = document.getElementById('journal-history-list');

  // Function to render journal entries
  const renderJournalHistory = () => {
    if (!journalHistoryList) return;
    
    // Use Firestore entries if logged in, otherwise use localStorage
    let entries;
    if (window.__userJournalEntries && window.__userJournalEntries.length > 0) {
      entries = window.__userJournalEntries;
      console.log('[Journal] Using Firestore entries:', entries.length);
    } else {
      entries = StorageModule.getJournalEntries();
      console.log('[Journal] Using localStorage entries:', entries.length);
    }
    
    if (entries.length === 0) {
      journalHistoryList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No saved journals yet</p>';
      return;
    }

    journalHistoryList.innerHTML = entries.map(entry => `
      <div class="journal-history-item" style="padding: 12px; border-bottom: 1px solid var(--border); cursor: pointer;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1; min-width: 0;">
            <p style="margin: 0 0 4px 0; color: var(--text-secondary); font-size: 0.85rem;">
              ${new Date(entry.timestamp).toLocaleString()}
            </p>
            <p style="margin: 0; word-break: break-word; white-space: pre-wrap; color: var(--text-primary); font-size: 0.95rem;">
              ${entry.text.substring(0, 100)}${entry.text.length > 100 ? '...' : ''}
            </p>
          </div>
          <button class="delete-journal-btn" data-id="${entry.id}" style="margin-left: 8px; background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.2rem;">
            ×
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-journal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this journal entry?')) {
          StorageModule.deleteJournalEntry(id);
          // Also delete from Firestore if logged in
          const user = (typeof AuthModule !== 'undefined' && AuthModule.getCurrentUser) ? AuthModule.getCurrentUser() : null;
          if (user && window.__userJournalEntries) {
            window.__userJournalEntries = window.__userJournalEntries.filter(e => e.id !== id);
            // In production, should also call Firestore delete
          }
          renderJournalHistory();
        }
      });
    });

    // Add click listeners to restore journal text
    document.querySelectorAll('.journal-history-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.querySelector('.delete-journal-btn').getAttribute('data-id');
        const entry = entries.find(e => e.id === id);
        if (entry) {
          const textarea = DOMModule.getJournalTextarea();
          if (textarea) {
            textarea.value = entry.text;
            StorageModule.saveJournalDraft(entry.text);
            closeJournalHistory();
            // Scroll to textarea
            textarea.focus();
          }
        }
      });
    });
  };

  // Open journal history modal
  const openJournalHistory = () => {
    if (!journalHistoryModal) return;
    journalHistoryModal.style.display = 'flex';
    renderJournalHistory();
    requestAnimationFrame(() => journalHistoryModal.classList.add('show'));
  };

  // Close journal history modal
  const closeJournalHistory = () => {
    if (!journalHistoryModal) return;
    journalHistoryModal.classList.remove('show');
    setTimeout(() => {
      journalHistoryModal.style.display = 'none';
    }, 200);
  };

  // Wire up journal history close button
  if (journalHistoryClose) {
    journalHistoryClose.addEventListener('click', closeJournalHistory);
  }

  // Close modal when clicking overlay
  if (journalHistoryModal) {
    journalHistoryModal.addEventListener('click', (e) => {
      if (e.target === journalHistoryModal) {
        closeJournalHistory();
      }
    });
  }

  // Wire up dock item to show journal history when on journal page
  // This will be updated when page navigation happens
  window.openJournalHistory = openJournalHistory;

  // ===== COMPLETED TASKS MODAL HANDLERS =====
  const completedTasksModal = document.getElementById('completed-tasks-modal');
  const completedTasksClose = document.getElementById('completed-tasks-close');
  const completedTasksList = document.getElementById('completed-tasks-list');

  // Function to render completed tasks
  const renderCompletedTasks = () => {
    if (!completedTasksList) return;
    const tasks = TasksModule.getState();
    const completedTasks = (tasks || []).filter(t => t.completed);
    
    if (completedTasks.length === 0) {
      completedTasksList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No completed tasks yet</p>';
      return;
    }

    completedTasksList.innerHTML = completedTasks.map(task => `
      <div class="task-item" style="padding: 12px; border-bottom: 1px solid var(--border); display: flex; gap: 8px;">
        <input type="checkbox" class="task-checkbox" id="${task.id}" checked data-task-id="${task.id}" style="cursor: pointer;" />
        <label for="${task.id}" class="task-text" style="text-decoration: line-through; color: var(--text-secondary); cursor: pointer;">
          ${task.text}
        </label>
      </div>
    `).join('');

    // Add event listeners to checkboxes to uncheck tasks
    document.querySelectorAll('#completed-tasks-list .task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const taskId = checkbox.getAttribute('data-task-id');
        const tasks = TasksModule.getState();
        const task = (tasks || []).find(t => t.id === taskId);
        
        if (task) {
          task.completed = false;
          TasksModule.setState(tasks);
          StorageModule.saveTasks(tasks);
          
          // Save to Firestore if logged in
          try {
            const user = (typeof AuthModule !== 'undefined' && AuthModule.getCurrentUser) ? AuthModule.getCurrentUser() : null;
            if (user && typeof AuthModule.saveTasks === 'function') {
              AuthModule.saveTasks(user.uid, tasks).catch(() => {});
            }
          } catch (e) {
            // ignore
          }
          
          // Update the main view
          TasksModule.render(tasks);
          renderCompletedTasks();
        }
      });
    });
  };

  // Open completed tasks modal
  const openCompletedTasks = () => {
    if (!completedTasksModal) return;
    completedTasksModal.style.display = 'flex';
    renderCompletedTasks();
    requestAnimationFrame(() => completedTasksModal.classList.add('show'));
  };

  // Close completed tasks modal
  const closeCompletedTasks = () => {
    if (!completedTasksModal) return;
    completedTasksModal.classList.remove('show');
    setTimeout(() => {
      completedTasksModal.style.display = 'none';
    }, 200);
  };

  // Wire up completed tasks close button
  if (completedTasksClose) {
    completedTasksClose.addEventListener('click', closeCompletedTasks);
  }

  // Close modal when clicking overlay
  if (completedTasksModal) {
    completedTasksModal.addEventListener('click', (e) => {
      if (e.target === completedTasksModal) {
        closeCompletedTasks();
      }
    });
  }

  // Wire up global function for opening completed tasks
  window.openCompletedTasks = openCompletedTasks;

  // Finally, run the router to render the appropriate public page on load
  if (window.route) window.route(window.location.pathname);
});
