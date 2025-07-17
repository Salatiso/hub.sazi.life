// File: /assets/js/dashboard.js
// Description: Main script for The Hub dashboard with definitive pathing for GitHub Pages.

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

// CRITICAL FIX: Define the absolute base path for the GitHub Pages repository.
// This tells the script exactly where the project's "home" folder is on the server.
const basePath = '/hub.sazi.life';

const loadComponent = async (componentPath, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.error(`Placeholder element with id "${placeholderId}" not found`);
        return;
    }
    try {
        // Always construct the full, absolute path from the defined base path.
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
        // Always construct the full, absolute path from the defined base path.
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

const setLanguage = (lang) => {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) el.innerText = translations[lang][key];
    });
    localStorage.setItem('language', lang);
};

const applyTheme = (theme) => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
};

const setupThemeSwitcher = () => {
    document.body.addEventListener('click', (e) => {
        const themeOption = e.target.closest('.theme-option');
        if (themeOption) {
            applyTheme(themeOption.getAttribute('data-theme'));
            document.getElementById('theme-menu').classList.add('hidden');
        }
    });
};

const setupLanguageSwitcher = () => {
    document.body.addEventListener('click', (e) => {
        const langOption = e.target.closest('.language-option');
        if (langOption) {
            setLanguage(langOption.getAttribute('data-lang'));
            document.getElementById('language-menu').classList.add('hidden');
        }
    });
};

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

const updateHeaderUserInfo = async (user) => {
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    if (!userNameEl || !userAvatarEl) return;
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const nameToDisplay = user.displayName || userData.name || user.email;
            userNameEl.textContent = nameToDisplay;
        } else {
            userNameEl.textContent = user.email;
        }
        if (user.photoURL) {
            userAvatarEl.src = user.photoURL;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        userNameEl.textContent = user.email;
    }
};

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
