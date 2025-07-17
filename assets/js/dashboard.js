// File: /assets/js/dashboard.js
// Description: Main script for The Hub dashboard with client-side routing and all features integrated.

// --- Firebase & Module Imports ---
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import * as financeUI from './financehelp/finance-ui.js';
import * as publicPagesUI from './public-pages/publisher.js';

// --- TRANSLATION DICTIONARY ---
const translations = {
  en: {
    "sidebar_overview": "Overview",
    "sidebar_lifecv": "Life-CV",
    "sidebar_publications": "Publications",
    "sidebar_public_pages": "Public Pages",
    "sidebar_activity": "Activity"
  },
  xh: {
    "sidebar_overview": "Isishwankathelo",
    "sidebar_lifecv": "i-Life-CV",
    "sidebar_publications": "Ushicilelo",
    "sidebar_public_pages": "Amaphepha Oluntu",
    "sidebar_activity": "Umsebenzi"
  },
  zu: {
    "sidebar_overview": "Ukubuka konke",
    "sidebar_lifecv": "i-Life-CV",
    "sidebar_publications": "Okushicilelwe",
    "sidebar_public_pages": "Amakhasi Omphakathi",
    "sidebar_activity": "Umsebenzi"
  },
  af: {
    "sidebar_overview": "Oorsig",
    "sidebar_lifecv": "Lewens-CV",
    "sidebar_publications": "Publikasies",
    "sidebar_public_pages": "Openbare Bladsye",
    "sidebar_activity": "Aktiwiteit"
  }
};

// --- Core UI & Routing Functions ---

/**
 * Determines the correct path to components based on current location
 * @returns {string} The correct path to the components directory
 */
const getComponentsPath = () => {
  const path = window.location.pathname;
  if (
    path.endsWith('/dashboard/') || 
    path.endsWith('/dashboard/index.html') ||
    path === '/dashboard'
  ) {
    return './components/';
  }
  if (path.includes('/dashboard/')) {
    return '../components/';
  }
  return './components/';
};

/**
 * Route mapping for dashboard pages
 */
const dashboardRouteMap = {
  '/dashboard/overview.html': './overview.html',
  '/dashboard/profile.html': './profile.html',
  '/dashboard/activity.html': './activity.html',
  '/dashboard/commshub/index.html': './commshub/index.html',
  '/dashboard/familyhub/index.html': './familyhub/index.html',
  '/dashboard/finhelp/index.html': './finhelp/index.html',
  '/dashboard/finhelp/assets.html': './finhelp/assets.html',
  '/dashboard/finhelp/expenses.html': './finhelp/expenses.html',
  '/dashboard/finhelp/tax-pack.html': './finhelp/tax-pack.html',
  '/dashboard/finhelp/public-share.html': './finhelp/public-share.html',
  '/dashboard/life-cv/life-cv.html': './life-cv/life-cv.html',
  '/dashboard/lifesync/index.html': './lifesync/index.html',
  '/dashboard/lifesync/assessment.html': './lifesync/assessment.html',
  '/dashboard/publications/index.html': './publications/index.html',
  '/dashboard/publications/editor.html': './publications/editor.html',
  '/dashboard/public-pages/index.html': './public-pages/index.html',
  '/dashboard/public-pages/editor.html': './public-pages/editor.html',
  '/dashboard/training/index.html': './training/index.html',
  '/dashboard/training/assign.html': './training/assign.html',
  '/dashboard/training/host.html': './training/host.html'
};

/**
 * Loads a partial HTML component into a placeholder
 */
const loadComponent = async (componentPath, placeholderId) => {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) {
    console.error(`Placeholder element with id "${placeholderId}" not found`);
    return;
  }
  try {
    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const content = await response.text();
    placeholder.innerHTML = content;
  } catch (error) {
    console.error(`Error loading component ${componentPath}:`, error);
    placeholder.innerHTML = `<div class="load-error">Failed to load component.</div>`;
  }
};

/**
 * Loads page content based on the absolute path and initializes page-specific logic
 */
const loadPageContent = async (absolutePath) => {
  const mainContent = document.getElementById('main-content');
  let relativePath = dashboardRouteMap[absolutePath];
  if (!relativePath) {
    relativePath = '.' + absolutePath.replace('/dashboard', '');
  }
  try {
    const response = await fetch(relativePath);
    if (!response.ok) {
      throw new Error('Page not found: ' + relativePath);
    }
    const html = await response.text();
    mainContent.innerHTML = html;
    routePageLogic(absolutePath, auth.currentUser?.uid);
    setActiveSidebarLink(absolutePath);
  } catch (err) {
    mainContent.innerHTML = `<div class="error-message">Page not found: ${relativePath}</div>`;
  }
};

/**
 * Sets up sidebar links for SPA navigation
 */
const setupSidebarLinks = () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.addEventListener('click', (e) => {
    const target = e.target.closest('a');
    if (target && target.classList.contains('sidebar-link')) {
      const href = target.getAttribute('href');
      if (href && href.startsWith('/dashboard/')) {
        e.preventDefault();
        history.pushState({}, '', href);
        loadPageContent(href);
      }
    }
  });
};

/**
 * Applies the selected theme to the document
 */
const applyTheme = (theme) => {
  document.body.className = theme;
  localStorage.setItem('theme', theme);
};

/**
 * Sets the language and applies translations
 */
const setLanguage = (lang) => {
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    if (translations[lang] && translations[lang][key]) el.innerText = translations[lang][key];
  });
  localStorage.setItem('language', lang);
};

/**
 * Sets up the theme switcher dropdown
 */
const setupThemeSwitcher = () => {
  document.body.addEventListener('click', (e) => {
    const themeOption = e.target.closest('.theme-option');
    if (themeOption) {
      applyTheme(themeOption.getAttribute('data-theme'));
      document.getElementById('theme-menu')?.classList.add('hidden');
    }
  });
};

/**
 * Sets up the language switcher dropdown
 */
const setupLanguageSwitcher = () => {
  document.body.addEventListener('click', (e) => {
    const langOption = e.target.closest('.language-option');
    if (langOption) {
      setLanguage(langOption.getAttribute('data-lang'));
      document.getElementById('language-menu')?.classList.add('hidden');
    }
  });
};

/**
 * Updates the header with user information from Firebase
 */
const updateHeaderUserInfo = async (user) => {
  const userNameEl = document.getElementById('user-name');
  const userAvatarEl = document.getElementById('user-avatar');
  if (!userNameEl || !userAvatarEl) return;
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      userNameEl.textContent = user.displayName || userData.name || user.email;
    } else {
      userNameEl.textContent = user.email;
    }
    if (user.photoURL) userAvatarEl.src = user.photoURL;
  } catch (error) {
    console.error("Error fetching user data:", error);
    userNameEl.textContent = user.email;
  }
};

/**
 * Sets up dropdown menu functionality
 */
const setupDropdown = (buttonId, menuId) => {
  const button = document.getElementById(buttonId);
  const menu = document.getElementById(menuId);
  if (button && menu) {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.user-menu-dropdown').forEach(m => {
        if (m.id !== menuId) m.classList.add('hidden');
      });
      menu.classList.toggle('hidden');
    });
  }
};

/**
 * Displays a welcome message from session storage
 */
const displayWelcomeMessage = () => {
  const message = sessionStorage.getItem('welcomeMessage');
  if (message) {
    const messageContainer = document.getElementById('dashboard-welcome-message');
    if (messageContainer) {
      messageContainer.innerHTML = message;
      messageContainer.classList.remove('hidden');
      sessionStorage.removeItem('welcomeMessage');
    }
  }
};

/**
 * Sets the active sidebar link based on the current path
 */
const setActiveSidebarLink = (path) => {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath && path.startsWith(linkPath)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
};

/**
 * Initializes specific page logic based on the loaded page
 */
const routePageLogic = (path, userId) => {
  if (!userId) return;
  if (path.includes('/finhelp/assets.html')) financeUI.initAssetPage(userId);
  else if (path.includes('/finhelp/expenses.html')) financeUI.initExpensePage(userId);
  else if (path.includes('/finhelp/tax-pack.html')) financeUI.initTaxPackPage(userId);
  else if (path.includes('/public-pages/editor.html')) publicPagesUI.initPublisherPage(userId);
};

// --- Main Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is authenticated, load dashboard
      const componentsPath = getComponentsPath();
      Promise.all([
        loadComponent(componentsPath + 'header.html', 'header'),
        loadComponent(componentsPath + 'sidebar.html', 'sidebar'),
        loadComponent(componentsPath + 'footer.html', 'footer'),
        loadComponent(componentsPath + 'theme-switcher.html', 'themeSwitcher'),
        loadComponent(componentsPath + 'language-switcher.html', 'langSwitcher')
      ]).then(() => {
        updateHeaderUserInfo(user);
        setupDropdown('user-btn', 'user-menu');
        setupDropdown('theme-btn', 'theme-menu');
        setupDropdown('language-btn', 'language-menu');
        setupDropdown('ecosystem-btn', 'ecosystem-menu');
        setupThemeSwitcher();
        setupLanguageSwitcher();
        setLanguage(localStorage.getItem('language') || 'en');
        applyTheme(localStorage.getItem('theme') || 'theme-default');
        displayWelcomeMessage();
        setupSidebarLinks();

        const currentPath = window.location.pathname;
        const initialPath = currentPath === '/dashboard/' || currentPath === '/dashboard' || currentPath === '/dashboard/index.html'
          ? '/dashboard/overview.html'
          : currentPath;
        loadPageContent(initialPath);

        const logoutButton = document.getElementById('logout-btn');
        if (logoutButton) {
          logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).catch(error => console.error('Logout Error:', error));
          });
        }
      }).catch(error => console.error('Error loading components:', error));
    } else {
      // User not authenticated, redirect to login
      if (!window.location.pathname.includes('index.html')) {
        window.location.href = '/index.html';
      }
    }
  });

  // Handle back/forward navigation
  window.addEventListener('popstate', () => {
    const currentPath = window.location.pathname;
    loadPageContent(currentPath);
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#user-dropdown-container, #theme-dropdown-container, #language-dropdown-container, #ecosystem-dropdown-container')) {
      document.querySelectorAll('.user-menu-dropdown').forEach(menu => menu.classList.add('hidden'));
    }
  });
});