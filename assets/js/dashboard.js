// File: /assets/js/dashboard.js
// Description: Main script for The Hub dashboard with final pathing and routing corrections.

// --- Firebase & Module Imports ---
import { auth, db } from './firebase-config.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

// CRITICAL FIX: Define the base path for the GitHub Pages repository.
// This tells the script where the project's "home" folder is on the server.
const basePath = '/hub.sazi.life';

const loadComponent = async (componentPath, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.error(`Placeholder element with id "${placeholderId}" not found`);
        return;
    }
    try {
        // Always construct the full path from the defined base path.
        const fullPath = `${basePath}${componentPath}`;
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`Component not found: ${fullPath}`);
        placeholder.innerHTML = await response.text();
    } catch (error) { 
        console.error(`Error loading component ${componentPath}:`, error); 
    }
};

const loadPageContent = async (path) => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    mainContent.innerHTML = `<div class='p-8 text-center text-secondary'>Loading...</div>`;
    try {
        // Always construct the full path from the defined base path.
        const fullPath = `${basePath}${path}`;
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`Page not found: ${fullPath}`);
        mainContent.innerHTML = await response.text();
        if(auth.currentUser) {
            routePageLogic(path, auth.currentUser.uid);
        }
    } catch (error) {
        console.error(`Error loading page content ${path}:`, error);
        mainContent.innerHTML = `<div class='p-8 text-center text-red-500'>Error: Could not load page.</div>`;
    }
};

const setLanguage = (lang) => { /* ... remains the same */ };
const applyTheme = (theme) => { /* ... remains the same */ };
const setupThemeSwitcher = () => { /* ... remains the same */ };
const setupLanguageSwitcher = () => { /* ... remains the same */ };

const setActiveSidebarLink = (path) => {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath && path.endsWith(linkPath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

const setupDropdown = (buttonId, menuId) => { /* ... remains the same */ };
const displayWelcomeMessage = () => { /* ... remains the same */ };
const updateHeaderUserInfo = async (user) => { /* ... remains the same */ };

const routePageLogic = (path, userId) => {
    if (!userId) return;
    if (path.endsWith('/finhelp/assets.html')) financeUI.initAssetPage(userId);
    else if (path.endsWith('/finhelp/expenses.html')) financeUI.initExpensePage(userId);
    else if (path.endsWith('/finhelp/tax-pack.html')) financeUI.initTaxPackPage(userId);
    else if (path.endsWith('/public-pages/editor.html')) publicPagesUI.initPublisherPage(userId);
};

// --- Main Initialization Controller ---
document.addEventListener('DOMContentLoaded', async () => {
    applyTheme(localStorage.getItem('theme') || 'theme-default');

    // Paths are now relative to the root, and will be prefixed with basePath
    const componentPathPrefix = '/dashboard/components/';

    await Promise.all([
        loadComponent(`${componentPathPrefix}header.html`, 'header-placeholder'),
        loadComponent(`${componentPathPrefix}sidebar.html`, 'sidebar-placeholder'),
        loadComponent(`${componentPathPrefix}footer.html`, 'footer-placeholder'),
    ]);
    
    await Promise.all([
        loadComponent(`${componentPathPrefix}theme-switcher.html`, 'theme-switcher-placeholder'),
        loadComponent(`${componentPathPrefix}language-switcher.html`, 'language-switcher-placeholder')
    ]);

    const handleNavigation = (path) => {
        const fullPath = `${basePath}${path}`;
        if (window.location.pathname !== fullPath) {
            history.pushState({path: path}, '', fullPath);
        }
        loadPageContent(path);
        setActiveSidebarLink(fullPath);
    };

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('.sidebar-link, .sidebar-nav-link');
        if (link) {
            e.preventDefault();
            // Get the path relative to the project root (e.g., /dashboard/overview.html)
            const path = new URL(link.href).pathname.replace(basePath, '');
            handleNavigation(path);
        }
    });

    window.addEventListener('popstate', (e) => {
        const path = e.state ? e.state.path : '/dashboard/overview.html';
        handleNavigation(path);
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            setTimeout(async () => {
                await updateHeaderUserInfo(user);

                setupDropdown('user-btn', 'user-menu');
                setupDropdown('theme-btn', 'theme-menu');
                setupDropdown('language-btn', 'language-menu');
                setupDropdown('ecosystem-btn', 'ecosystem-menu');
                setupThemeSwitcher();
                setupLanguageSwitcher();
                setLanguage(localStorage.getItem('language') || 'en');
                displayWelcomeMessage();

                // Determine initial page to load, removing the basePath
                const pathName = window.location.pathname.replace(basePath, '');
                const initialPath = (pathName === '/' || pathName === '/dashboard/') 
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
            }, 200);
        } else {
            const loginPath = `${basePath}/index.html`;
            if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== `${basePath}/`) {
                 window.location.href = loginPath;
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#user-dropdown-container, #theme-dropdown-container, #language-dropdown-container, #ecosystem-dropdown-container')) {
            document.querySelectorAll('.user-menu-dropdown').forEach(menu => menu.classList.add('hidden'));
        }
    });
});
