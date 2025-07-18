// File: /assets/js/dashboard.js
// Description: Main script for The Hub dashboard with definitive pathing and corrected logic.

// --- Firebase & Module Imports ---
import { auth, db } from './firebase-config.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Import page-specific UI initializers
import * as financeUI from './financehelp/finance-ui.js';
import * as publicPages from './public-pages/publisher.js';
import * as lifeCvUI from './life-cv/life-cv-ui.js'; // Added for Life-CV

// --- TRANSLATION DICTIONARY ---
const translations = {
    en: { "sidebar_overview": "Overview", "sidebar_lifecv": "Life-CV", "sidebar_publications": "Publications", "sidebar_public_pages": "Public Pages", "sidebar_activity": "Activity", "welcome_back": "Welcome back" },
    xh: { "sidebar_overview": "Isishwankathelo", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Ushicilelo", "sidebar_public_pages": "Amaphepha Oluntu", "sidebar_activity": "Umsebenzi", "welcome_back": "Wamkelekile kwakhona" },
    zu: { "sidebar_overview": "Ukubuka konke", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Okushicilelwe", "sidebar_public_pages": "Amakhasi Omphakathi", "sidebar_activity": "Umsebenzi", "welcome_back": "Siyakwamukela futhi" },
    // Add other languages as needed
};

// --- CONFIGURATION & STATE ---
const basePath = '/hub.sazi.life'; // Base path for GitHub Pages
let currentLanguage = 'en';
let currentUser = null;

// --- DOM ELEMENTS ---
const mainContent = document.getElementById('main-content');
const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
const headerPlaceholder = document.getElementById('header-placeholder');
const footerPlaceholder = document.getElementById('footer-placeholder');
const welcomeMessageContainer = document.getElementById('dashboard-welcome-message');

// --- CORE FUNCTIONS ---

/**
 * Fetches and injects an HTML component into a specified element.
 * @param {string} componentPath - The path to the HTML component file.
 * @param {HTMLElement} placeholder - The element to inject the HTML into.
 * @returns {Promise<void>}
 */
async function loadComponent(componentPath, placeholder) {
    if (!placeholder) return;
    try {
        const response = await fetch(`${basePath}/dashboard/components/${componentPath}`);
        if (!response.ok) throw new Error(`Failed to load component: ${componentPath}`);
        placeholder.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
        placeholder.innerHTML = `<p class="text-red-500">Error loading ${componentPath}.</p>`;
    }
}

/**
 * Handles page navigation within the SPA. Fetches page content and initializes it.
 * @param {string} path - The path of the page to load (e.g., '/dashboard/overview.html').
 */
async function handleNavigation(path) {
    if (!mainContent) return;
    mainContent.innerHTML = `<div class='p-8 text-center text-secondary'>Loading...</div>`;

    // Prevent fetching the container page itself
    if (path.endsWith('index.html')) {
        path = '/dashboard/overview.html';
    }
    
    const fullUrl = path.startsWith(basePath) ? path : basePath + path;

    try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`Page not found: ${path}`);
        const content = await response.text();
        mainContent.innerHTML = content;
        window.history.pushState({}, '', `${basePath}${path}`);
        
        // After loading content, initialize page-specific scripts
        initializePageScript(path);
        updateActiveSidebarLink(path);

    } catch (error) {
        console.error('Navigation Error:', error);
        mainContent.innerHTML = `<div class='p-8 text-center text-red-500'>Failed to load page. Please try again.</div>`;
    }
}

/**
 * Calls the correct initialization function based on the loaded page path.
 * @param {string} path - The path of the loaded page.
 */
function initializePageScript(path) {
    if (!currentUser) return;

    if (path.includes('/life-cv/life-cv.html')) {
        lifeCvUI.initLifeCvPage(currentUser.uid);
    } else if (path.includes('/publications/index.html')) {
        // Placeholder for publications logic
        const pubList = document.getElementById('publications-list');
        if(pubList) pubList.innerHTML = '<p>Your publications would be listed here.</p>';
    } else if (path.includes('/public-pages/index.html')) {
         const pageList = document.getElementById('public-pages-list');
        if(pageList) pageList.innerHTML = '<p>Your public pages would be listed here.</p>';
    }
    // Add other pages here, e.g.:
    // else if (path.includes('/finhelp/index.html')) {
    //     financeUI.initFinanceDashboard(currentUser.uid);
    // }
}

/**
 * Updates the UI with the user's information.
 * @param {object} user - The Firebase user object.
 */
async function updateUserUI(user) {
    currentUser = user;
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const displayName = userDoc.exists() ? userDoc.data().name : user.email;

    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => el.textContent = displayName);

    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(el => el.textContent = user.email);
    
    displayWelcomeMessage(displayName);
}

/**
 * Displays a welcome message on the dashboard.
 * @param {string} name - The user's display name.
 */
function displayWelcomeMessage(name) {
    if (welcomeMessageContainer) {
        const welcomeText = translations[currentLanguage]?.welcome_back || "Welcome back";
        welcomeMessageContainer.innerHTML = `<h2 class="text-2xl font-bold">${welcomeText}, ${name}!</h2>`;
        welcomeMessageContainer.classList.remove('hidden');
    }
}

/**
 * Sets the active state for the current page in the sidebar.
 * @param {string} path - The current page path.
 */
function updateActiveSidebarLink(path) {
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (`${basePath}${path}` === linkPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Initializes all event listeners for the dashboard.
 */
function initializeEventListeners() {
    // SPA Navigation for sidebar links
    document.body.addEventListener('click', e => {
        const link = e.target.closest('.sidebar-nav-link');
        if (link) {
            e.preventDefault();
            const path = new URL(link.href).pathname.replace(basePath, '');
            handleNavigation(path);
        }

        // Dropdown toggles
        const dropdownToggle = e.target.closest('.dropdown-toggle');
        if (dropdownToggle) {
            const dropdownMenu = dropdownToggle.nextElementSibling;
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('hidden');
            }
        }
    });

    // Logout button
    document.body.addEventListener('click', e => {
        if (e.target.id === 'logout-btn') {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = `${basePath}/index.html`;
            }).catch(error => console.error('Logout Error:', error));
        }
    });

    // Hide dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-container')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.add('hidden'));
        }
    });
}


// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in.
            // Load components in parallel for speed.
            await Promise.all([
                loadComponent('header.html', headerPlaceholder),
                loadComponent('sidebar.html', sidebarPlaceholder),
                loadComponent('footer.html', footerPlaceholder)
            ]);

            // Once components are loaded, update UI and set up listeners.
            await updateUserUI(user);
            initializeEventListeners();

            // Determine the initial page to load.
            const currentPath = window.location.pathname;
            let initialPath;
            if (currentPath === `${basePath}/` || currentPath === `${basePath}/dashboard/` || currentPath.endsWith('index.html')) {
                initialPath = '/dashboard/overview.html';
            } else {
                initialPath = currentPath.replace(basePath, '');
            }
            
            handleNavigation(initialPath);

        } else {
            // User is signed out. Redirect to login page.
            const loginPath = `${basePath}/index.html`;
            // Avoid redirect loop if already on the login page
            if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== `${basePath}/`) {
                 window.location.href = loginPath;
            }
        }
    });
});
