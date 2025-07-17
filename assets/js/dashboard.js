// File: /assets/js/dashboard.js
// Description: Main script for The Hub dashboard.

// --- Firebase & Module Imports ---
// Import the initialized auth instance from the central config file
import { auth } from './firebase-config.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import * as financeUI from './financehelp/finance-ui.js';
import * as publicPagesUI from './public-pages/publisher.js';
// import * as familyHubUI from './familyhub/family-ui.js';
// import * as commsUI from './commshub/comms-ui.js';

// Note: We no longer initialize Firebase here.

// --- TRANSLATION DICTIONARY ---
const translations = {
    en: { "sidebar_overview": "Overview", "sidebar_lifecv": "Life-CV", "sidebar_publications": "Publications", "sidebar_public_pages": "Public Pages", "sidebar_activity": "Activity" },
    xh: { "sidebar_overview": "Isishwankathelo", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Ushicilelo", "sidebar_public_pages": "Amaphepha Oluntu", "sidebar_activity": "Umsebenzi" },
    zu: { "sidebar_overview": "Ukubuka konke", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Okushicilelwe", "sidebar_public_pages": "Amakhasi Omphakathi", "sidebar_activity": "Umsebenzi" },
    af: { "sidebar_overview": "Oorsig", "sidebar_lifecv": "Lewens-CV", "sidebar_publications": "Publikasies", "sidebar_public_pages": "Openbare Bladsye", "sidebar_activity": "Aktiwiteit" }
};

// --- Core UI Functions (loadComponent, setLanguage, applyTheme, etc.) remain the same ---

const loadComponent = async (componentPath, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.warn(`Placeholder element #${placeholderId} not found.`);
        return;
    }
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Component not found: ${componentPath}`);
        placeholder.innerHTML = await response.text();
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        placeholder.innerHTML = `<p class="text-red-500">Error loading component.</p>`;
    }
};

const setLanguage = (lang) => {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
};

const applyTheme = (theme) => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
};

const setupThemeSwitcher = () => {
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.theme-option')) {
            applyTheme(e.target.closest('.theme-option').getAttribute('data-theme'));
            document.getElementById('theme-menu').classList.add('hidden');
        }
    });
};

const setupLanguageSwitcher = () => {
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.language-option')) {
            setLanguage(e.target.closest('.language-option').getAttribute('data-lang'));
            document.getElementById('language-menu').classList.add('hidden');
        }
    });
};

const setActiveSidebarLink = () => {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-link').forEach(link => {
        const linkPath = link.getAttribute('data-link');
        if (linkPath && currentPath.includes(linkPath)) {
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
                if(m.id !== menuId) m.classList.add('hidden');
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

const routePageLogic = (path, userId) => {
    if (path.includes('/finhelp/assets.html')) financeUI.initAssetPage(userId);
    else if (path.includes('/finhelp/expenses.html')) financeUI.initExpensePage(userId);
    else if (path.includes('/finhelp/tax-pack.html')) financeUI.initTaxPackPage(userId);
    else if (path.includes('/public-pages/editor.html')) publicPagesUI.initPublisherPage(userId);
};

// --- Main Initialization Controller ---
document.addEventListener('DOMContentLoaded', async () => {
    const repoName = window.location.pathname.split('/')[1] || '';
    const basePath = repoName.startsWith('dashboard') ? '/' : `/${repoName}/`;

    applyTheme(localStorage.getItem('theme') || 'theme-default');

    await Promise.all([
        loadComponent(`${basePath}dashboard/components/header.html`, 'header-placeholder'),
        loadComponent(`${basePath}dashboard/components/sidebar.html`, 'sidebar-placeholder'),
        loadComponent(`${basePath}dashboard/components/footer.html`, 'footer-placeholder'),
    ]);
    
    await Promise.all([
        loadComponent(`${basePath}dashboard/components/theme-switcher.html`, 'theme-switcher-placeholder'),
        loadComponent(`${basePath}dashboard/components/language-switcher.html`, 'language-switcher-placeholder')
    ]);

    const path = window.location.pathname;
    if (path.endsWith('/dashboard/') || path.endsWith('/dashboard/index.html')) {
        await loadComponent(`${basePath}dashboard/overview.html`, 'main-content');
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            setTimeout(() => {
                setupDropdown('user-btn', 'user-menu');
                setupDropdown('theme-btn', 'theme-menu');
                setupDropdown('language-btn', 'language-menu');
                setupThemeSwitcher();
                setupLanguageSwitcher();
                setLanguage(localStorage.getItem('language') || 'en');
                setActiveSidebarLink();
                displayWelcomeMessage();

                const logoutButton = document.getElementById('logout-btn');
                if (logoutButton) {
                    logoutButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        signOut(auth).catch(error => console.error('Logout Error:', error));
                    });
                }
                
                routePageLogic(window.location.pathname, user.uid);
            }, 200);
        } else {
            const loginPath = basePath.endsWith('/') ? `${basePath}index.html` : `${basePath}/index.html`;
            if (!window.location.pathname.includes('index.html')) {
                 window.location.href = loginPath.replace('//', '/');
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#user-dropdown-container') && !e.target.closest('#theme-dropdown-container') && !e.target.closest('#language-dropdown-container')) {
            document.querySelectorAll('.user-menu-dropdown').forEach(menu => menu.classList.add('hidden'));
        }
    });
});
