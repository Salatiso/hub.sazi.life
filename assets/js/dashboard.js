// File: /assets/js/dashboard.js
// Description: Main script for The Hub dashboard with client-side routing and corrected pathing.

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
 * Converts absolute dashboard paths to relative paths for page content,
 * always matching the file structure.
 * @param {string} absolutePath - The absolute path (e.g., '/dashboard/overview.html')
 * @returns {string} The relative path based on current location
 */
const getRelativePagePath = (absolutePath) => {
  const currentPath = window.location.pathname;
  // Normalize double slashes
  absolutePath = absolutePath.replace(/\/{2,}/g, '/');
  // Root SPA: /dashboard/ or /dashboard/index.html
  if (
    currentPath.endsWith('/dashboard/') ||
    currentPath.endsWith('/dashboard/index.html') ||
    currentPath === '/dashboard'
  ) {
    return '.' + absolutePath.replace('/dashboard', '');
  }
  // In a subdir: e.g. /dashboard/finhelp/index.html
  if (currentPath.startsWith('/dashboard/') && currentPath.split('/').length > 3) {
    return '..' + absolutePath.replace('/dashboard', '');
  }
  // Fallback for already relative or odd cases
  if (!absolutePath.startsWith('/')) {
    return absolutePath;
  }
  return '.' + absolutePath.replace('/dashboard', '');
};

/**
 * Corrects all dashboard internal links to point to the *real* filename/structure.
 */
const dashboardRouteMap = {
  // Overview and non-folder dashboard section files
  '/dashboard/overview.html':        './overview.html',
  '/dashboard/profile.html':         './profile.html',
  '/dashboard/activity.html':        './activity.html',

  // CommsHub (foldered)
  '/dashboard/commshub/index.html':  './commshub/index.html',

  // FamilyHub (foldered)
  '/dashboard/familyhub/index.html': './familyhub/index.html',

  // FinanceHelp (foldered)
  '/dashboard/finhelp/index.html':   './finhelp/index.html',
  '/dashboard/finhelp/assets.html':  './finhelp/assets.html',
  '/dashboard/finhelp/expenses.html':'./finhelp/expenses.html',
  '/dashboard/finhelp/tax-pack.html':'./finhelp/tax-pack.html',
  '/dashboard/finhelp/public-share.html':'./finhelp/public-share.html',

  // Life-CV: special (note subfolder for only 1 html file)
  '/dashboard/life-cv/life-cv.html': './life-cv/life-cv.html',

  // LifeSync
  '/dashboard/lifesync/index.html':  './lifesync/index.html',
  '/dashboard/lifesync/assessment.html': './lifesync/assessment.html',

  // Publications
  '/dashboard/publications/index.html': './publications/index.html',
  '/dashboard/publications/editor.html': './publications/editor.html',

  // Public-Pages
  '/dashboard/public-pages/index.html': './public-pages/index.html',
  '/dashboard/public-pages/editor.html': './public-pages/editor.html',

  // Training
  '/dashboard/training/index.html':   './training/index.html',
  '/dashboard/training/assign.html':  './training/assign.html',
  '/dashboard/training/host.html':    './training/host.html'
};

/**
 * Loads a partial HTML component into a placeholder.
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

// SPA Navigation & Page Content Loader
const loadPageContent = async (absolutePath) => {
  const mainContent = document.getElementById('main-content');
  // Use explicit route map for dashboard pages
  let relativePath = dashboardRouteMap[absolutePath];
  if (!relativePath) {
    // Attempt to fallback: calculate direct relative path
    relativePath = getRelativePagePath(absolutePath);
  }
  try {
    const response = await fetch(relativePath);
    if (!response.ok) {
      throw new Error('Page not found: ' + relativePath);
    }
    const html = await response.text();
    mainContent.innerHTML = html;
  } catch (err) {
    mainContent.innerHTML = `<div class="error-message">Page not found: ${relativePath}</div>`;
  }
};

/**
 * Sets up dashboard sidebar link SPA navigation.
 */
function setupSidebarLinks() {
  // Event delegation for all sidebar SPA links
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.addEventListener('click', function (e) {
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
}

// Dashboard Component Loader
const initializeDashboard = async () => {
  // Load main layout components
  const componentsPath = getComponentsPath();
  await loadComponent(componentsPath + 'header.html', 'header');
  await loadComponent(componentsPath + 'sidebar.html', 'sidebar');
  await loadComponent(componentsPath + 'footer.html', 'footer');
  await loadComponent(componentsPath + 'theme-switcher.html', 'themeSwitcher');
  await loadComponent(componentsPath + 'language-switcher.html', 'langSwitcher');

  // After rendering sidebar, activate SPA nav
  setupSidebarLinks();

  // Load initial page (SPA root fallback)
  let initialPage = window.location.pathname;
  if (
    initialPage === '/dashboard/' ||
    initialPage === '/dashboard' ||
    initialPage === '/dashboard/index.html'
  ) {
    initialPage = '/dashboard/overview.html';
  }
  loadPageContent(initialPage);

  // Auth logic (if needed)
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '/index.html';
    }
  });
};

// SPA back/forward support
window.addEventListener('popstate', () => {
  loadPageContent(window.location.pathname);
});

window.addEventListener('DOMContentLoaded', initializeDashboard);

