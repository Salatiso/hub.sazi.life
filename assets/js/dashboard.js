// File: /assets/js/dashboard.js
// Description: Main script for The Hub, now integrated with the advanced translation engine.

// --- Firebase & Module Imports ---
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initTranslations, applyTranslations } from './translations-engine.js'; // <-- IMPORT the new engine
import * as financeUI from './financehelp/finance-ui.js';
import * as publicPagesUI from './public-pages/publisher.js';

// --- Core UI & Routing Functions ---

const repoName = 'hub.sazi.life'; 
const basePath = `/${repoName}`;

/**
 * Loads an HTML component (header, sidebar) into a placeholder and then translates it.
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
        applyTranslations(); // <-- CRITICAL: Translate the new content
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        placeholder.innerHTML = `<div class='p-2 text-red-500'>Failed to load component.</div>`;
    }
};

/**
 * Loads the main content for a specific page, translates it, and runs its specific logic.
 * @param {string} pagePath - The path to the page content fragment relative to the project root.
 */
const loadPageContent = async (pagePath) => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    mainContent.innerHTML = `<div class='p-8 text-center text-secondary' data-translate-key="common_loading">Loading...</div>`;
    applyTranslations(); // Translate the "Loading..." message

    try {
        const fullPath = `${basePath}${pagePath}`;
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`Page not found: ${fullPath}`);
        mainContent.innerHTML = await response.text();
        applyTranslations(); // <-- CRITICAL: Translate the new content
        
        if (auth.currentUser) {
            routePageLogic(pagePath, auth.currentUser.uid);
        }
    } catch (error) {
        console.error(`Error loading page content ${pagePath}:`, error);
        mainContent.innerHTML = `<div class='p-8 text-center text-red-500' data-translate-key="common_error">Error: Could not load page.</div>`;
        applyTranslations();
    }
};

/**
 * Executes JavaScript logic specific to the newly loaded page.
 * @param {string} path - The path of the loaded page.
 * @param {string} userId - The current user's ID.
 */
const routePageLogic = (path, userId) => {
    if (!userId) return;
    if (path.endsWith('/finhelp/assets.html')) financeUI.initAssetPage(userId);
    else if (path.endsWith('/finhelp/expenses.html')) financeUI.initExpensePage(userId);
    else if (path.endsWith('/finhelp/tax-pack.html')) financeUI.initTaxPackPage(userId);
    else if (path.endsWith('/public-pages/editor.html')) publicPagesUI.initPublisherPage(userId);
};

/**
 * Handles all navigation, updating the URL and loading the new page content.
 * @param {string} path - The destination path relative to the project root.
 */
const handleNavigation = (path) => {
    const fullUrlPath = `${basePath}${path}`;
    if (window.location.pathname !== fullUrlPath) {
        history.pushState({ path: path }, '', fullUrlPath);
    }
    loadPageContent(path);
    setActiveSidebarLink(path);
};


// --- UI Helper Functions ---

const applyTheme = (theme) => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
};

const setActiveSidebarLink = (path) => {
    document.querySelectorAll('.sidebar-link').forEach(link => {
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
            // Initialize translations first
            const savedLang = localStorage.getItem('language') || 'en';
            await initTranslations(savedLang);

            // Load the dashboard shell
            const componentPathPrefix = '/dashboard/components/';
            await Promise.all([
                loadComponent(`${componentPathPrefix}header.html`, 'header-placeholder'),
                loadComponent(`${componentPathPrefix}sidebar.html`, 'sidebar-placeholder'),
                loadComponent(`${componentPathPrefix}footer.html`, 'footer-placeholder'),
            ]);

            setTimeout(async () => {
                await updateHeaderUserInfo(user);
                
                setupDropdown('user-btn', 'user-menu');
                setupDropdown('theme-btn', 'theme-menu');
                setupDropdown('language-btn', 'language-menu');
                setupDropdown('ecosystem-btn', 'ecosystem-menu');
                
                displayWelcomeMessage();

                const pathName = window.location.pathname.replace(basePath, '');
                const initialPath = (pathName === '/' || pathName === '/dashboard/' || pathName === '/dashboard/index.html') 
                    ? '/dashboard/overview.html' 
                    : pathName;
                handleNavigation(initialPath);

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
            const loginPath = `${basePath}/index.html`;
            if (window.location.pathname !== loginPath && window.location.pathname !== `${basePath}/`) {
                 window.location.href = loginPath;
            }
        }
    });

    // --- GLOBAL EVENT LISTENERS ---

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('.sidebar-link, .sidebar-nav-link');
        if (link) {
            e.preventDefault();
            const path = new URL(link.href).pathname.replace(basePath, '');
            handleNavigation(path);
        }

        // Handle language switching
        const langOption = e.target.closest('.language-option');
        if (langOption) {
            const lang = langOption.getAttribute('data-lang');
            localStorage.setItem('language', lang);
            initTranslations(lang); // Re-initialize with the new language
        }
    });
    
    window.addEventListener('popstate', (e) => {
        const path = e.state ? e.state.path : '/dashboard/overview.html';
        handleNavigation(path);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-container')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.add('hidden'));
        }
    });
});
