// ============================================================================
// AUTH UI MODULE - Handles all auth page interactions and Axis menu
// ============================================================================

const AuthUIModule = (() => {
  let initialized = false;

  // Simple page navigation for public flow
  const showPage = (pageName) => {
    // Hide all public pages
    ['page-start', 'page-login', 'page-signup', 'page-forgot-password'].forEach((id) => {
      const page = document.getElementById(id);
      if (page) page.classList.remove('page-active');
    });

    // Show target page
    const target = document.getElementById(pageName);
    if (target) {
      target.classList.add('page-active');
      // Ensure it's visible even if CSS was overridden
      target.style.display = 'flex';
      target.style.opacity = '1';
      console.log(`[Auth UI] Showing page: ${pageName}`);
    }
  };

  // Initialize all event listeners
  const init = () => {
    if (initialized) return;

    console.log('[Auth UI] Initializing...');

    // ===== START PAGE =====
    const startLoginBtn = document.getElementById('start-login-btn');
    const startSignupBtn = document.getElementById('start-signup-btn');

    if (startLoginBtn) {
      startLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[Auth UI] start-login-btn clicked');
        // Client-side navigation without page reload
        if (typeof RoutingModule !== 'undefined' && RoutingModule.navigateTo) {
          RoutingModule.navigateTo('login', false);
          // Update browser history
          try {
            history.pushState({}, '', '/login');
          } catch (err) {
            console.warn('History API not available', err);
          }
        } else {
          console.warn('[Auth UI] RoutingModule not available');
        }
      });
    }

    if (startSignupBtn) {
      startSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[Auth UI] start-signup-btn clicked');
        // Client-side navigation without page reload
        if (typeof RoutingModule !== 'undefined' && RoutingModule.navigateTo) {
          RoutingModule.navigateTo('signup', false);
          // Update browser history
          try {
            history.pushState({}, '', '/signup');
          } catch (err) {
            console.warn('History API not available', err);
          }
        } else {
          console.warn('[Auth UI] RoutingModule not available');
        }
      });
    }

    // ===== LOGIN PAGE =====
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const loginForgotBtn = document.getElementById('login-forgot-btn');
    const loginSignupBtn = document.getElementById('login-signup-btn');

    // Handle login form submission with Firebase authentication
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email')?.value.trim() || '';
        const password = document.getElementById('login-password')?.value || '';

        if (!email || !password) {
          if (loginError) loginError.textContent = '❌ Please enter email and password';
          return;
        }

        if (loginForm.querySelector('button[type="submit"]')) {
          loginForm.querySelector('button[type="submit"]').disabled = true;
          loginForm.querySelector('button[type="submit"]').textContent = 'Signing In...';
        }

        const result = await AuthModule.login(email, password);

        if (result.success) {
          if (loginError) loginError.textContent = '';
          console.log('[Auth UI] Login successful, waiting before redirect...');
          // Wait a moment for Firebase auth state to sync before redirecting
          setTimeout(() => {
            console.log('[Auth UI] Redirecting to dashboard...');
            window.location.href = '/dashboard';
          }, 500);
        } else {
          let msg = result.error;
          if (msg.includes('user-not-found')) msg = '❌ Email not found';
          if (msg.includes('wrong-password')) msg = '❌ Incorrect password';
          if (msg.includes('invalid-email')) msg = '❌ Invalid email';
          if (loginError) loginError.textContent = msg;
          
          if (loginForm.querySelector('button[type="submit"]')) {
            loginForm.querySelector('button[type="submit"]').disabled = false;
            loginForm.querySelector('button[type="submit"]').textContent = 'Sign In';
          }
        }
      });
    }

    if (loginForgotBtn) {
      loginForgotBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof RoutingModule !== 'undefined' && RoutingModule.navigateTo) {
          RoutingModule.navigateTo('forgotPassword', false);
          try {
            history.pushState({}, '', '/forgot-password');
          } catch (err) {
            console.warn('History API not available', err);
          }
        } else {
          showPage('page-forgot-password');
        }
      });
    }

    if (loginSignupBtn) {
      loginSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof RoutingModule !== 'undefined' && RoutingModule.navigateTo) {
          RoutingModule.navigateTo('signup', false);
          try {
            history.pushState({}, '', '/signup');
          } catch (err) {
            console.warn('History API not available', err);
          }
        } else {
          showPage('page-signup');
        }
      });
    }

    // ===== SIGNUP PAGE =====
    const signupForm = document.getElementById('signup-form');
    const signupError = document.getElementById('signup-error');
    const signupLoginBtn = document.getElementById('signup-login-btn');

    // Handle signup form submission with Firebase authentication
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('signup-name')?.value.trim() || '';
        const email = document.getElementById('signup-email')?.value.trim() || '';
        const password = document.getElementById('signup-password')?.value || '';
        const confirm = document.getElementById('signup-confirm')?.value || '';

        if (!name || !email || !password || !confirm) {
          if (signupError) signupError.textContent = '❌ Please fill in all fields';
          return;
        }

        if (password !== confirm) {
          if (signupError) signupError.textContent = '❌ Passwords do not match';
          return;
        }

        if (signupForm.querySelector('button[type="submit"]')) {
          signupForm.querySelector('button[type="submit"]').disabled = true;
          signupForm.querySelector('button[type="submit"]').textContent = 'Creating Account...';
        }

        const result = await AuthModule.signup(email, password, name);

        if (result.success) {
          if (signupError) signupError.textContent = '';
          console.log('[Auth UI] Signup successful, waiting before redirect...');
          // Wait a moment for Firebase auth state to sync before redirecting
          setTimeout(() => {
            console.log('[Auth UI] Redirecting to dashboard...');
            window.location.href = '/dashboard';
          }, 500);
        } else {
          let msg = result.error;
          if (msg.includes('email-already-in-use')) msg = '❌ Email already in use';
          if (msg.includes('weak-password')) msg = '❌ Password must be at least 6 characters';
          if (msg.includes('invalid-email')) msg = '❌ Invalid email';
          if (signupError) signupError.textContent = msg;
          
          if (signupForm.querySelector('button[type="submit"]')) {
            signupForm.querySelector('button[type="submit"]').disabled = false;
            signupForm.querySelector('button[type="submit"]').textContent = 'Create Account';
          }
        }
      });
    }

    if (signupLoginBtn) {
      signupLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof RoutingModule !== 'undefined' && RoutingModule.navigateTo) {
          RoutingModule.navigateTo('login', false);
          try {
            history.pushState({}, '', '/login');
          } catch (err) {
            console.warn('History API not available', err);
          }
        } else {
          showPage('page-login');
        }
      });
    }

    // ===== FORGOT PASSWORD PAGE =====
    const forgotForm = document.getElementById('forgot-form');
    const forgotError = document.getElementById('forgot-error');
    const forgotSuccess = document.getElementById('forgot-success');
    const forgotLoginBtn = document.getElementById('forgot-login-btn');

    if (forgotForm) {
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('forgot-email')?.value.trim() || '';

        if (!email) {
          if (forgotError) forgotError.textContent = '❌ Please enter your email';
          return;
        }

        if (forgotForm.querySelector('button[type="submit"]')) {
          forgotForm.querySelector('button[type="submit"]').disabled = true;
          forgotForm.querySelector('button[type="submit"]').textContent = 'Sending...';
        }

        const result = await AuthModule.sendPasswordReset(email);

        if (result.success) {
          if (forgotSuccess) forgotSuccess.textContent = '✓ Reset email sent! Check your inbox.';
          if (forgotError) forgotError.textContent = '';
          document.getElementById('forgot-email').value = '';
          setTimeout(() => showPage('page-login'), 2000);
        } else {
          let msg = result.error;
          if (msg.includes('user-not-found')) msg = '❌ Email not found.';
          if (forgotError) forgotError.textContent = msg;
          
          if (forgotForm.querySelector('button[type="submit"]')) {
            forgotForm.querySelector('button[type="submit"]').disabled = false;
            forgotForm.querySelector('button[type="submit"]').textContent = 'Send Reset Link';
          }
        }
      });
    }

    if (forgotLoginBtn) {
      forgotLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof RoutingModule !== 'undefined' && RoutingModule.navigateTo) {
          RoutingModule.navigateTo('login', false);
          try {
            history.pushState({}, '', '/login');
          } catch (err) {
            console.warn('History API not available', err);
          }
        } else {
          showPage('page-login');
        }
      });
    }

    // ===== AXIS MENU (for logged-in users) =====
    const axisMenuBtn = document.getElementById('axis-menu-btn');
    const axisMenu = document.getElementById('axis-menu');
    const logoutBtn = document.getElementById('logout-menu-btn');

    if (axisMenuBtn && axisMenu) {
      axisMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        axisMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (axisMenu && !axisMenu.contains(e.target) && e.target !== axisMenuBtn) {
          axisMenu.classList.add('hidden');
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('[Auth UI] Logout clicked');
        const result = await AuthModule.logout();
        if (result.success) {
          if (axisMenu) axisMenu.classList.add('hidden');
          console.log('[Auth UI] Logout successful, waiting for auth state to update...');
        }
      });
    }

    // ===== FLOATING DOCK (for private app navigation) =====
    document.querySelectorAll('.dock-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = item.getAttribute('data-page');

        // Hide all private pages
        ['page-journal', 'page-tasks'].forEach((id) => {
          const page = document.getElementById(id);
          if (page) page.classList.remove('page-active');
        });

        // Show target page
        const target = document.getElementById(`page-${pageName}`);
        if (target) {
          target.classList.add('page-active');

          // Update dock active state
          document.querySelectorAll('.dock-item').forEach((btn) => {
            btn.classList.remove('active');
          });
          item.classList.add('active');

          // Render tasks if needed
          if (pageName === 'tasks' && typeof TasksModule !== 'undefined') {
            TasksModule.render(TasksModule.getState());
          }

          console.log(`[Auth UI] Showing private page: ${pageName}`);
        }
      });
    });

    // ===== USER INFO =====
    const updateUserInfo = (user) => {
      const userInfo = document.getElementById('user-info');
      if (user && userInfo) {
        userInfo.textContent = `👤 ${user.email}`;
      }
    };

    initialized = true;
    console.log('[Auth UI] Initialization complete');

    return { updateUserInfo };
  };

  return {
    init,
    showPage,
  };
})();
