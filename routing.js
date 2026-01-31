// ============================================================================
// ROUTING MODULE - Handles page navigation and access control
// ============================================================================

const RoutingModule = (() => {
  // Page definitions
  const pages = {
    start: 'page-start',
    login: 'page-login',
    signup: 'page-signup',
    forgotPassword: 'page-forgot-password',
    journal: 'page-journal',
    tasks: 'page-tasks',
  };

  // Auth pages (accessible without login)
  const authPages = ['start', 'login', 'signup', 'forgotPassword'];

  // Protected pages (require login)
  const protectedPages = ['journal', 'tasks'];

  // Internal storage for detached page nodes
  const pageNodes = {};
  const appRoot = document.querySelector('.app');

  // Detach given DOM node and keep reference
  const detachNode = (node) => {
    if (!node) return null;
    const parent = node.parentNode;
    if (parent) parent.removeChild(node);
    return node;
  };

  // Attach node back to the app root
  const attachNode = (node) => {
    if (!node) return;
    // Insert after axis-header if present to preserve layout order
    const axisHeader = appRoot.querySelector('.axis-header');
    if (axisHeader && axisHeader.nextSibling) {
      appRoot.insertBefore(node, axisHeader.nextSibling);
    } else {
      appRoot.appendChild(node);
    }
  };

  // Detach all pages from DOM and store them in pageNodes
  const detachAllPages = () => {
    Object.entries(pages).forEach(([pageName, pageId]) => {
      const node = document.getElementById(pageId);
      if (node) {
        pageNodes[pageName] = detachNode(node);
      }
    });
  };

  // Mount a single page (unmounts any other mounted pages)
  const mountSinglePage = (pageName) => {
    // First remove any currently mounted pages
    Object.keys(pageNodes).forEach((name) => {
      const node = document.getElementById(pages[name]);
      if (node) {
        node.parentNode.removeChild(node);
      }
    });

    // Attach the requested page if we have it stored
    const nodeToAttach = pageNodes[pageName];
    if (nodeToAttach) {
      attachNode(nodeToAttach);
      // ensure it has page-active
      nodeToAttach.classList.add('page-active');
      // Re-bind auth UI handlers for the newly mounted page(s)
      if (typeof AuthUIModule !== 'undefined' && AuthUIModule.init) {
        try { AuthUIModule.init(); } catch (e) { /* ignore binding errors */ }
      }
    }
  };

  // ========== Navigate with Access Control ==========
  const navigateTo = (pageName, isLoggedIn) => {
    // If logged in, allow access to protected pages only
    if (isLoggedIn) {
      if (protectedPages.includes(pageName)) {
        mountSinglePage(pageName);
        updateFloatingDockVisibility(true);
        return true;
      }

      // Redirect logged-in users away from auth pages to journal
      if (authPages.includes(pageName)) {
        mountSinglePage('journal');
        updateFloatingDockVisibility(true);
        return false;
      }
    }

    // If NOT logged in, allow only auth pages
    if (!isLoggedIn) {
      if (authPages.includes(pageName)) {
        mountSinglePage(pageName);
        updateFloatingDockVisibility(false);
        return true;
      }

      // Redirect not-logged-in users to start
      if (protectedPages.includes(pageName)) {
        mountSinglePage('start');
        updateFloatingDockVisibility(false);
        return false;
      }
    }

    return false;
  };

  // ========== Update Floating Dock Visibility ==========
  const updateFloatingDockVisibility = (show) => {
    const dock = document.querySelector('.floating-dock');
    if (dock) {
      if (show) {
        dock.style.display = 'flex';
      } else {
        dock.style.display = 'none';
      }
    }
  };

  // ========== Clear Auth Form Errors ==========
  const clearErrors = () => {
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
    document.getElementById('forgot-error').textContent = '';
    document.getElementById('forgot-success').textContent = '';
  };

  // ========== Show Error in Form ==========
  const showError = (pageType, message) => {
    clearErrors();
    const errorElement = document.getElementById(`${pageType}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      // Auto-clear after 5 seconds
      setTimeout(() => {
        errorElement.textContent = '';
      }, 5000);
    }
  };

  // ========== Show Success Message ==========
  const showSuccess = (pageType, message) => {
    const successElement = document.getElementById(`${pageType}-success`);
    if (successElement) {
      successElement.textContent = message;
      setTimeout(() => {
        successElement.textContent = '';
      }, 5000);
    }
  };

  // Immediately detach pages so none render until routing decides
  // This prevents mixed rendering on initial load
  detachAllPages();

  return {
    navigateTo,
    clearErrors,
    showError,
    showSuccess,
    pages,
    authPages,
    protectedPages,
  };
})();
