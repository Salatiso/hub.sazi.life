// File: /assets/js/dashboard.js
// Description: Main script for The Hub dashboard, consolidated and corrected for pathing and functionality.

// --- Firebase & Module Imports ---
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Specific UI modules will be imported dynamically based on the page loaded.
import * as financeUI from './financehelp/finance-ui.js';
import * as publicPagesUI from './public-pages/publisher.js';

// --- TRANSLATION DICTIONARY ---
const translations = {
    en: { "sidebar_overview": "Overview", "sidebar_lifecv": "Life-CV", "sidebar_publications": "Publications", "sidebar_public_pages": "Public Pages", "sidebar_activity": "Activity" },
    xh: { "sidebar_overview": "Isishwankathelo", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Ushicilelo", "sidebar_public_pages": "Amaphepha Oluntu", "sidebar_activity": "Umsebenzi" },
    zu: { "sidebar_overview": "Ukubuka konke", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Okushicilelwe", "sidebar_public_pages": "Amakhasi Omphakathi", "sidebar_activity": "Umsebenzi" },
    af: { "sidebar_overview": "Oorsig", "sidebar_lifecv": "Lewens-CV", "sidebar_publications": "Publikasies", "sidebar_public_pages": "Openbare Bladsye", "sidebar_activity": "Aktiwiteit" }
};

// --- Core UI & Routing Functions ---

// FIX: Define the base path for GitHub Pages. Assumes repo name is 'hub.sazi.life'.
// Change 'hub.sazi.life' to your actual repository name if it's different.
const repoName = 'hub.sazi.life'; 
const basePath = `/${repoName}`;

/**
 * Loads an HTML component (header, sidebar) into a placeholder.
 * @param {string} componentPath - The path to the component relative to the project root.
 * @param {string} placeholderId - The ID of the element to load the component into.
 */
const loadComponent = async (componentPath, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.error(`Placeholder element with id "${placeholderId}" not found`);
        return;
    }
    try {
        const fullPath = `${basePath}${componentPath}`;
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`Component not found: ${fullPath}`);
        placeholder.innerHTML = await response.text();
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        placeholder.innerHTML = `<div class='p-2 text-red-500'>Failed to load component.</div>`;
    }
};

/**
 * Loads the main content for a specific page into the #main-content area.
 * @param {string} pagePath - The path to the page content fragment relative to the project root.
 */
const loadPageContent = async (pagePath) => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    mainContent.innerHTML = `<div class='p-8 text-center text-secondary'>Loading...</div>`;
    try {
        const fullPath = `${basePath}${pagePath}`;
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`Page not found: ${fullPath}`);
        mainContent.innerHTML = await response.text();
        
        // After loading content, initialize any page-specific logic
        if (auth.currentUser) {
            routePageLogic(pagePath, auth.currentUser.uid);
        }
    } catch (error) {
        console.error(`Error loading page content ${pagePath}:`, error);
        mainContent.innerHTML = `<div class='p-8 text-center text-red-500'>Error: Could not load page.</div>`;
    }
};

/**
 * Executes JavaScript logic specific to the newly loaded page.
 * @param {string} path - The path of the loaded page.
 * @param {string} userId - The current user's ID.
 */
const routePageLogic = (path, userId) => {
    if (!userId) return;
    // Note: Use endsWith to make matching more robust
    if (path.endsWith('/finhelp/assets.html')) financeUI.initAssetPage(userId);
    else if (path.endsWith('/finhelp/expenses.html')) financeUI.initExpensePage(userId);
    else if (path.endsWith('/finhelp/tax-pack.html')) financeUI.initTaxPackPage(userId);
    else if (path.endsWith('/public-pages/editor.html')) publicPagesUI.initPublisherPage(userId);
    // Add other page logic routes here
};


/**
 * Handles all navigation, updating the URL and loading the new page content.
 * @param {string} path - The destination path relative to the project root.
 */
const handleNavigation = (path) => {
    const fullUrlPath = `${basePath}${path}`;
    // Prevents pushing the same state twice
    if (window.location.pathname !== fullUrlPath) {
        history.pushState({ path: path }, '', fullUrlPath);
    }
    loadPageContent(path);
    setActiveSidebarLink(path);
};


// --- UI Helper Functions ---

const setLanguage = (lang) => {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    localStorage.setItem('language', lang);
};

const applyTheme = (theme) => {
    document.documentElement.className = theme; // Apply theme to <html> for better CSS control
    localStorage.setItem('theme', theme);
};

const setActiveSidebarLink = (path) => {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        // Normalize paths for comparison
        const linkPath = new URL(link.href).pathname.replace(basePath, '');
        if (linkPath === path) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

const setupDropdown = (buttonId, menuId) => {
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);
    if (button && menu) {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });
    }
};

const displayWelcomeMessage = () => {
    const message = sessionStorage.getItem('welcomeMessage');
    const container = document.getElementById('dashboard-welcome-message');
    if (message && container) {
        container.innerHTML = message;
        container.classList.remove('hidden');
        sessionStorage.removeItem('welcomeMessage');
    }
};

const updateHeaderUserInfo = async (user) => {
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    if (!userNameEl || !userAvatarEl) return;

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userNameEl.textContent = userData.name || user.displayName || 'User';
        } else {
            userNameEl.textContent = user.displayName || user.email || 'User';
        }
        if (user.photoURL) {
            userAvatarEl.src = user.photoURL;
        } else {
            // A simple fallback avatar
            userAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userNameEl.textContent)}&background=random`;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        userNameEl.textContent = user.email || 'User';
    }
};


// --- Main Initialization Controller ---

document.addEventListener('DOMContentLoaded', () => {
    applyTheme(localStorage.getItem('theme') || 'theme-default');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in, load the dashboard shell
            const componentPathPrefix = '/dashboard/components/';
            await Promise.all([
                loadComponent(`${componentPathPrefix}header.html`, 'header-placeholder'),
                loadComponent(`${componentPathPrefix}sidebar.html`, 'sidebar-placeholder'),
                loadComponent(`${componentPathPrefix}footer.html`, 'footer-placeholder'),
            ]);

            // Wait for components to be in the DOM, then populate and set up listeners
            // A small timeout ensures all elements are rendered before we try to access them.
            setTimeout(async () => {
                await updateHeaderUserInfo(user);
                
                // Setup interactive elements
                setupDropdown('user-btn', 'user-menu');
                setupDropdown('theme-btn', 'theme-menu');
                setupDropdown('language-btn', 'language-menu');
                setupDropdown('ecosystem-btn', 'ecosystem-menu');
                
                setLanguage(localStorage.getItem('language') || 'en');
                displayWelcomeMessage();

                // Handle initial page load and navigation
                const pathName = window.location.pathname.replace(basePath, '');
                const initialPath = (pathName === '/' || pathName === '/dashboard/' || pathName === '/dashboard/index.html') 
                    ? '/dashboard/overview.html' 
                    : pathName;
                handleNavigation(initialPath);

                // Setup logout
                const logoutButton = document.getElementById('logout-btn');
                if (logoutButton) {
                    logoutButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        signOut(auth).then(() => {
                            window.location.href = `${basePath}/index.html`;
                        }).catch(error => console.error('Logout Error:', error));
                    });
                }
            }, 100);

        } else {
            // User is not signed in, redirect to login page.
            const loginPath = `${basePath}/index.html`;
            if (window.location.pathname !== loginPath && window.location.pathname !== `${basePath}/`) {
                 window.location.href = loginPath;
            }
        }
    });

    // --- GLOBAL EVENT LISTENERS ---

    // Handles clicks on sidebar links for SPA-style navigation
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('.sidebar-link, .sidebar-nav-link');
        if (link) {
            e.preventDefault();
            const path = new URL(link.href).pathname.replace(basePath, '');
            handleNavigation(path);
        }
    });
    
    // Handles browser back/forward buttons
    window.addEventListener('popstate', (e) => {
        const path = e.state ? e.state.path : '/dashboard/overview.html';
        handleNavigation(path);
    });

    // Closes dropdowns if clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-container')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.add('hidden'));
        }
    });
});
