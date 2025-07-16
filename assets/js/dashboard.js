// File: /assets/js/dashboard.js (Active Link & Styling Update)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, query, onSnapshot, serverTimestamp, orderBy, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Firebase Initialization ---
const firebaseConfig = {
    apiKey: "AIzaSyD_pRVkeVzciCPowxsj44NRVlbyZvFPueI",
    authDomain: "lifecv-d2724.firebaseapp.com",
    projectId: "lifecv-d2724",
    storageBucket: "lifecv-d2724.firebasestorage.app",
    messagingSenderId: "1039752653127",
    appId: "1:1039752653127:web:54afa09b21c98ef231c462",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- TRANSLATION DICTIONARY ---
const translations = {
    en: { "sidebar_overview": "Overview", "sidebar_lifecv": "Life-CV", "sidebar_publications": "Publications", "sidebar_assets": "Assets", "sidebar_training": "Training", "sidebar_public_pages": "Public Pages", "sidebar_activity": "Activity" },
    xh: { "sidebar_overview": "Isishwankathelo", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Ushicilelo", "sidebar_assets": "Ii-asethi", "sidebar_training": "Uqeqesho", "sidebar_public_pages": "Amaphepha Oluntu", "sidebar_activity": "Umsebenzi" },
    zu: { "sidebar_overview": "Ukubuka konke", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Okushicilelwe", "sidebar_assets": "Amafa", "sidebar_training": "Ukuqeqeshwa", "sidebar_public_pages": "Amakhasi Omphakathi", "sidebar_activity": "Umsebenzi" },
    af: { "sidebar_overview": "Oorsig", "sidebar_lifecv": "Lewens-CV", "sidebar_publications": "Publikasies", "sidebar_assets": "Bates", "sidebar_training": "Opleiding", "sidebar_public_pages": "Openbare Bladsye", "sidebar_activity": "Aktiwiteit" }
};

// --- CORE FUNCTIONS ---

const loadComponent = async (componentPath, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Component not found: ${componentPath}`);
        placeholder.innerHTML = await response.text();
    } catch (error) { console.error(error); }
};

const setLanguage = (lang) => {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        el.innerText = (translations[lang] && translations[lang][key]) ? translations[lang][key] : translations['en'][key];
    });
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
};

const applyTheme = (theme) => {
    document.body.className = theme; // Apply theme class to body
    localStorage.setItem('theme', theme);
};

const setActiveSidebarLink = () => {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-link').forEach(link => {
        const linkPath = link.getAttribute('data-link');
        if (currentPath.includes(linkPath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

// --- SETUP FUNCTIONS ---

const setupDropdown = (containerId, buttonId, menuId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);
    if (button && menu) {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });
    }
};

const setupThemeSwitcher = () => {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            applyTheme(option.getAttribute('data-theme'));
            document.getElementById('theme-menu').classList.add('hidden');
        });
    });
};

const setupLanguageSwitcher = () => {
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
            setLanguage(option.getAttribute('data-lang'));
            document.getElementById('language-menu').classList.add('hidden');
        });
    });
};

// --- MAIN INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    const repoName = window.location.pathname.split('/')[1] || '';
    const basePath = repoName ? `/${repoName}/` : '/';

    // Set theme immediately to avoid flash of unstyled content
    const savedTheme = localStorage.getItem('theme') || 'theme-default';
    applyTheme(savedTheme);

    await Promise.all([
        loadComponent(`${basePath}dashboard/components/header.html`, 'header-placeholder'),
        loadComponent(`${basePath}dashboard/components/footer.html`, 'footer-placeholder'),
        loadComponent(`${basePath}dashboard/components/sidebar.html`, 'sidebar-placeholder')
    ]);
    
    await Promise.all([
        loadComponent(`${basePath}dashboard/components/theme-switcher.html`, 'theme-switcher-placeholder'),
        loadComponent(`${basePath}dashboard/components/language-switcher.html`, 'language-switcher-placeholder')
    ]);

    setTimeout(() => {
        setupDropdown('theme-dropdown-container', 'theme-btn', 'theme-menu');
        setupDropdown('language-dropdown-container', 'language-btn', 'language-menu');
        setupDropdown('user-dropdown-container', 'user-btn', 'user-menu');

        setupThemeSwitcher();
        setupLanguageSwitcher();

        const savedLang = localStorage.getItem('language') || 'en';
        setLanguage(savedLang);
        
        setActiveSidebarLink(); // Set the active link

        const logoutButton = document.getElementById('logout-btn');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                signOut(auth);
            });
        }
    }, 200);

    const path = window.location.pathname;
    if (path.endsWith('/dashboard/') || path.endsWith('/dashboard/index.html')) {
        loadComponent(`${basePath}dashboard/overview.html`, 'main-content');
    }
});

document.addEventListener('click', () => {
    document.querySelectorAll('.absolute.z-50').forEach(menu => menu.classList.add('hidden'));
});
// File: /assets/js/dashboard.js (FinanceHelp Integration)

// ... (all existing code from dashboard_js_fix_05 remains the same) ...
import * as financeUI from './financehelp/finance-ui.js'; // Import the new UI module

// --- MAIN INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    const repoName = window.location.pathname.split('/')[1] || '';
    const basePath = repoName ? `/${repoName}/` : '/';

    const savedTheme = localStorage.getItem('theme') || 'theme-default';
    document.body.className = savedTheme;

    await Promise.all([
        loadComponent(`${basePath}dashboard/components/header.html`, 'header-placeholder'),
        loadComponent(`${basePath}dashboard/components/footer.html`, 'footer-placeholder'),
        loadComponent(`${basePath}dashboard/components/sidebar.html`, 'sidebar-placeholder')
    ]);
    
    await Promise.all([
        loadComponent(`${basePath}dashboard/components/theme-switcher.html`, 'theme-switcher-placeholder'),
        loadComponent(`${basePath}dashboard/components/language-switcher.html`, 'language-switcher-placeholder')
    ]);

    const auth = getAuth(); // Get auth instance
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, proceed with setup
            setTimeout(() => {
                setupDropdown('theme-dropdown-container', 'theme-btn', 'theme-menu');
                setupDropdown('language-dropdown-container', 'language-btn', 'language-menu');
                setupDropdown('user-dropdown-container', 'user-btn', 'user-menu');

                setupThemeSwitcher();
                setupLanguageSwitcher();

                const savedLang = localStorage.getItem('language') || 'en';
                setLanguage(savedLang);
                
                setActiveSidebarLink();

                const logoutButton = document.getElementById('logout-btn');
                if (logoutButton) {
                    logoutButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        signOut(auth);
                    });
                }
                
                // --- Page Specific Logic Router ---
                const path = window.location.pathname;
                if (path.includes('/finhelp/index.html')) {
                    // Initialize the main FinanceHelp dashboard
                } else if (path.includes('/finhelp/assets.html')) {
                    financeUI.initAssetPage(user.uid);
                } else if (path.includes('/finhelp/expenses.html')) {
                    financeUI.initExpensePage(user.uid);
                } else if (path.endsWith('/dashboard/') || path.endsWith('/dashboard/index.html')) {
                    loadComponent(`${basePath}dashboard/overview.html`, 'main-content');
                }
                // ... other existing page routes
            }, 200);
        } else {
            // User is signed out, redirect to login
            if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
                 window.location.href = `${basePath}index.html`;
            }
        }
    });
});
// File: /assets/js/dashboard.js (FinanceHelp Integration)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// ... other firebase imports

// Import the new UI module
import * as financeUI from './financehelp/finance-ui.js'; 

// ... (all existing code from dashboard_js_fix_05: firebaseConfig, translations, loadComponent, etc.) ...

const setLanguage = (lang) => { /* ... */ };
const applyTheme = (theme) => { /* ... */ };
const setActiveSidebarLink = () => { /* ... */ };
const setupDropdown = (containerId, buttonId, menuId) => { /* ... */ };
const setupThemeSwitcher = () => { /* ... */ };
const setupLanguageSwitcher = () => { /* ... */ };


// --- MAIN INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    const repoName = window.location.pathname.split('/')[1] || '';
    const basePath = repoName ? `/${repoName}/` : '/';

    const savedTheme = localStorage.getItem('theme') || 'theme-default';
    document.body.className = savedTheme;

    await Promise.all([
        loadComponent(`${basePath}dashboard/components/header.html`, 'header-placeholder'),
        loadComponent(`${basePath}dashboard/components/footer.html`, 'footer-placeholder'),
        loadComponent(`${basePath}dashboard/components/sidebar.html`, 'sidebar-placeholder')
    ]);
    
    await Promise.all([
        loadComponent(`${basePath}dashboard/components/theme-switcher.html`, 'theme-switcher-placeholder'),
        loadComponent(`${basePath}dashboard/components/language-switcher.html`, 'language-switcher-placeholder')
    ]);

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            setTimeout(() => {
                // Setup UI elements
                setupDropdown('theme-dropdown-container', 'theme-btn', 'theme-menu');
                setupDropdown('language-dropdown-container', 'language-btn', 'language-menu');
                setupDropdown('user-dropdown-container', 'user-btn', 'user-menu');
                setupThemeSwitcher();
                setupLanguageSwitcher();
                const savedLang = localStorage.getItem('language') || 'en';
                setLanguage(savedLang);
                setActiveSidebarLink();
                const logoutButton = document.getElementById('logout-btn');
                if (logoutButton) {
                    logoutButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        signOut(auth);
                    });
                }
                
                // --- Page Specific Logic Router ---
                const path = window.location.pathname;
                if (path.includes('/finhelp/index.html')) {
                    // initFinanceHelpDashboard(user.uid); // A future function for the main finhelp page
                } else if (path.includes('/finhelp/assets.html')) {
                    financeUI.initAssetPage(user.uid);
                } else if (path.includes('/finhelp/expenses.html')) {
                    financeUI.initExpensePage(user.uid);
                } else if (path.includes('/finhelp/tax-pack.html')) { // NEW ROUTE
                    financeUI.initTaxPackPage(user.uid);
                } else if (path.endsWith('/dashboard/') || path.endsWith('/dashboard/index.html')) {
                    loadComponent(`${basePath}dashboard/overview.html`, 'main-content');
                }
                // ... other existing page routes
            }, 200);
        } else {
            if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
                 window.location.href = `${basePath}index.html`;
            }
        }
    });
});

document.addEventListener('click', () => {
    document.querySelectorAll('.absolute.z-50').forEach(menu => menu.classList.add('hidden'));
});
// File: /assets/js/dashboard.js (FamilyHub & Public Pages Integration)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// ... other firebase imports

// Import the new UI modules
import * as financeUI from './financehelp/finance-ui.js'; 
import * as publicPagesUI from './public-pages/publisher.js';
import * as familyHubUI from './familyhub/family-ui.js';

// ... (all existing code from dashboard_js_fix_07: firebaseConfig, translations, loadComponent, etc.) ...

const setLanguage = (lang) => { /* ... */ };
const applyTheme = (theme) => { /* ... */ };
const setActiveSidebarLink = () => { /* ... */ };
const setupDropdown = (containerId, buttonId, menuId) => { /* ... */ };
const setupThemeSwitcher = () => { /* ... */ };
const setupLanguageSwitcher = () => { /* ... */ };


// --- MAIN INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    // ... (existing setup code for basePath, theme, component loading) ...

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            setTimeout(() => {
                // ... (existing UI setup: dropdowns, theme/lang switchers, logout) ...
                
                // --- Page Specific Logic Router ---
                const path = window.location.pathname;
                
                // FinanceHelp Routes
                if (path.includes('/finhelp/assets.html')) {
                    financeUI.initAssetPage(user.uid);
                } else if (path.includes('/finhelp/expenses.html')) {
                    financeUI.initExpensePage(user.uid);
                } else if (path.includes('/finhelp/tax-pack.html')) {
                    financeUI.initTaxPackPage(user.uid);
                } 
                
                // Public Pages Route
                else if (path.includes('/public-pages/editor.html')) {
                    publicPagesUI.initPublisherPage(user.uid);
                }

                // Family Hub Routes
                else if (path.includes('/familyhub/index.html')) {
                    familyHubUI.initFamilyHubPage(user.uid);
                }
                
                // Main Dashboard Route
                else if (path.endsWith('/dashboard/') || path.endsWith('/dashboard/index.html')) {
                    loadComponent(`${basePath}dashboard/overview.html`, 'main-content');
                }
                // ... other existing page routes
            }, 200);
        } else {
            // ... (existing redirect logic) ...
        }
    });
});

// ... (rest of the functions) ...
