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
    en: { "sidebar_overview": "Overview", "sidebar_lifecv": "Life-CV", "sidebar_publications": "Publications", "sidebar_public_pages": "Public Pages", "sidebar_activity": "Activity" },
    xh: { "sidebar_overview": "Isishwankathelo", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Ushicilelo", "sidebar_public_pages": "Amaphepha Oluntu", "sidebar_activity": "Umsebenzi" },
    zu: { "sidebar_overview": "Ukubuka konke", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Okushicilelwe", "sidebar_public_pages": "Amakhasi Omphakathi", "sidebar_activity": "Umsebenzi" },
    af: { "sidebar_overview": "Oorsig", "sidebar_lifecv": "Lewens-CV", "sidebar_publications": "Publikasies", "sidebar_public_pages": "Openbare Bladsye", "sidebar_activity": "Aktiwiteit" }
};

// --- Core UI & Routing Functions ---

/**
 * FIXED: Determines the correct path to components based on current location
 * @returns {string} The correct path to the components directory
 */
const getComponentsPath = () => {
    const path = window.location.pathname;
    
    // If we're in the dashboard root (/dashboard/ or /dashboard/index.html)
    if (path.endsWith('/dashboard/') || path.endsWith('/dashboard/index.html') || path === '/dashboard') {
        return './components/';
    }
    
    // If we're in a subdirectory of dashboard
    if (path.includes('/dashboard/')) {
        return '../components/';
    }
    
    // Fallback
    return './components/';
};

/**
 * FIXED: Converts absolute dashboard paths to relative paths for page content
 * @param {string} absolutePath - The absolute path (e.g., '/dashboard/overview.html')
 * @returns {string} The relative path based on current location
 */
const getRelativePagePath = (absolutePath) => {
    const currentPath = window.location.pathname;
    
    // If we're in the dashboard root and the path starts with /dashboard/
    if ((currentPath.endsWith('/dashboard/') || currentPath.endsWith('/dashboard/index.html') || currentPath === '/dashboard') 
        && absolutePath.startsWith('/dashboard/')) {
        // Convert /dashboard/overview.html to ./overview.html
        return absolutePath.replace('/dashboard/', './');
    }
    
    // If we're in a subdirectory and the path starts with /dashboard/
    if (currentPath.includes('/dashboard/') && absolutePath.startsWith('/dashboard/')) {
        // Convert /dashboard/overview.html to ../overview.html
        return absolutePath.replace('/dashboard/', '../');
    }
    
    // If it's already relative, return as is
    if (!absolutePath.startsWith('/')) {
        return absolutePath;
    }
    
    // Fallback - try to make it relative
    return absolutePath.replace('/dashboard/', './');
};

const loadComponent = async (componentPath, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.error(`Placeholder element with id "${placeholderId}" not found`);
        return;
    }
    
    try {
        console.log(`Loading component from: ${componentPath}`);
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const content = await response.text();
        placeholder.innerHTML = content;
        console.log(`Successfully loaded component: ${componentPath}`);
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        placeholder.innerHTML = `<div class="p-4 text-red-500">Error loading component: ${componentPath}</div>`;
    }
};

const loadPageContent = async (path) => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `<div class='p-8 text-center text-secondary'>Loading...</div>`;
    
    // Convert absolute paths to relative paths
    const relativePath = getRelativePagePath(path);
    
    try {
        console.log(`Loading page content from: ${relativePath} (original: ${path})`);
        const response = await fetch(relativePath);
        if (!response.ok) throw new Error(`Page not found: ${relativePath}`);
        const content = await response.text();
        mainContent.innerHTML = content;
        routePageLogic(path, auth.currentUser?.uid);
        console.log(`Successfully loaded page: ${relativePath}`);
    } catch (error) {
        console.error(`Error loading page content ${relativePath}:`, error);
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
        if (linkPath && path.startsWith(linkPath)) {
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
    if (path.includes('/finhelp/assets.html')) financeUI.initAssetPage(userId);
    else if (path.includes('/finhelp/expenses.html')) financeUI.initExpensePage(userId);
    else if (path.includes('/finhelp/tax-pack.html')) financeUI.initTaxPackPage(userId);
    else if (path.includes('/public-pages/editor.html')) publicPagesUI.initPublisherPage(userId);
};

// --- Main Initialization Controller ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard initializing...');
    
    applyTheme(localStorage.getItem('theme') || 'theme-default');

    // Get the correct path to components
    const componentsPath = getComponentsPath();
    console.log(`Components path: ${componentsPath}`);

    // Load static shell components using the correct path
    await Promise.all([
        loadComponent(`${componentsPath}header.html`, 'header-placeholder'),
        loadComponent(`${componentsPath}sidebar.html`, 'sidebar-placeholder'),
        loadComponent(`${componentsPath}footer.html`, 'footer-placeholder'),
    ]);
    
    // Load components that go inside the header
    await Promise.all([
        loadComponent(`${componentsPath}theme-switcher.html`, 'theme-switcher-placeholder'),
        loadComponent(`${componentsPath}language-switcher.html`, 'language-switcher-placeholder')
    ]);

    // --- Navigation Handling ---
    const handleNavigation = (path) => {
        history.pushState({}, '', path);
        loadPageContent(path);
        setActiveSidebarLink(path);
    };

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('.sidebar-link, .sidebar-nav-link');
        if (link) {
            e.preventDefault();
            const path = link.getAttribute('href');
            handleNavigation(path);
        }
    });

    window.addEventListener('popstate', () => {
        const currentPath = window.location.pathname;
        loadPageContent(currentPath);
        setActiveSidebarLink(currentPath);
    });

    // --- Auth State Change ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User authenticated:', user.uid);
            
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

                const currentPath = window.location.pathname;
                const initialPath = currentPath.endsWith('/') || currentPath.endsWith('/dashboard/') || currentPath.endsWith('/dashboard/index.html') 
                    ? '/dashboard/overview.html' 
                    : currentPath;
                
                console.log(`Loading initial page: ${initialPath}`);
                loadPageContent(initialPath);
                setActiveSidebarLink(initialPath);
                
                const logoutButton = document.getElementById('logout-btn');
                if (logoutButton) {
                    logoutButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        signOut(auth).catch(error => console.error('Logout Error:', error));
                    });
                }
            }, 500); // Increased timeout to give components time to load
        } else {
            console.log('User not authenticated, redirecting to login');
            if (!window.location.pathname.includes('index.html')) {
                window.location.href = '/index.html';
            }
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#user-dropdown-container, #theme-dropdown-container, #language-dropdown-container, #ecosystem-dropdown-container')) {
            document.querySelectorAll('.user-menu-dropdown').forEach(menu => menu.classList.add('hidden'));
        }
    });
    
    console.log('Dashboard initialization complete');
});