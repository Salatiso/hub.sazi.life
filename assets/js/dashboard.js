// File: /assets/js/dashboard.js
// Description: Corrected main script for The Hub dashboard.
// This version fixes loading and navigation issues without changing original functionality.

// --- Firebase & Module Imports ---
import { auth, db } from './firebase-config.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Import page-specific UI initializers.
// We will create this new file to handle Life-CV content.
import { initLifeCvPage } from './life-cv/life-cv-ui.js'; 
import * as financeUI from './financehelp/finance-ui.js';
import * as publicPagesUI from './public-pages/publisher.js';

// --- CONFIGURATION ---
// This base path is crucial for GitHub Pages to find your files correctly.
const basePath = '/hub.sazi.life-main'; 
let currentUser = null; // To store the logged-in user's data.

// --- DOM ELEMENT REFERENCES ---
const mainContent = document.getElementById('main-content');
const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
const headerPlaceholder = document.getElementById('header-placeholder');
const footerPlaceholder = document.getElementById('footer-placeholder');
const welcomeMessageContainer = document.getElementById('dashboard-welcome-message');

// --- TRANSLATION DICTIONARY (from original file) ---
const translations = {
    en: { "sidebar_overview": "Overview", "sidebar_lifecv": "Life-CV", "sidebar_publications": "Publications", "sidebar_public_pages": "Public Pages", "sidebar_activity": "Activity", "welcome_back": "Welcome back" },
    xh: { "sidebar_overview": "Isishwankathelo", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Ushicilelo", "sidebar_public_pages": "Amaphepha Oluntu", "sidebar_activity": "Umsebenzi", "welcome_back": "Wamkelekile kwakhona" },
    zu: { "sidebar_overview": "Ukubuka konke", "sidebar_lifecv": "i-Life-CV", "sidebar_publications": "Okushicilelwe", "sidebar_public_pages": "Amakhasi Omphakathi", "sidebar_activity": "Umsebenzi", "welcome_back": "Siyakwamukela futhi" },
    // Other languages from your original file...
};

/**
 * Loads an HTML component (like the header or sidebar) into a placeholder element.
 * This function is an improved version from your original logic.
 */
async function loadComponent(componentPath, placeholder) {
    if (!placeholder) return;
    const fullComponentPath = `${basePath}/dashboard/components/${componentPath}`;
    try {
        const response = await fetch(fullComponentPath);
        if (!response.ok) throw new Error(`Failed to load component: ${fullComponentPath}`);
        placeholder.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
        placeholder.innerHTML = `<p class="text-red-500">Error: ${componentPath} could not be loaded.</p>`;
    }
}

/**
 * Fetches and displays the content for a given page (e.g., overview.html).
 * This is the core of the single-page application navigation.
 */
async function handleNavigation(path) {
    if (!mainContent) return;
    
    // Default to the overview page if the root dashboard is requested.
    if (path.endsWith('/dashboard/') || path.endsWith('/dashboard/index.html')) {
        path = '/dashboard/overview.html';
    }
    
    mainContent.innerHTML = `<div class='p-8 text-center text-secondary'>Loading Content...</div>`;
    const fullUrl = `${basePath}${path}`;

    try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`Page not found: ${fullUrl}`);
        const content = await response.text();
        
        mainContent.innerHTML = content;
        window.history.pushState({}, '', fullUrl);
        
        // After loading content, run scripts specific to that page.
        initializePageScript(path);
        updateActiveSidebarLink(path);
    } catch (error) {
        console.error('Navigation Error:', error);
        mainContent.innerHTML = `<div class='p-8 text-center text-red-500'>Error loading page.</div>`;
    }
}

/**
 * After a page is loaded, this function calls the necessary JavaScript for that specific page.
 * This is how the "Loading Life-CV..." message gets replaced with actual content.
 */
function initializePageScript(path) {
    if (!currentUser) return;

    if (path.includes('/life-cv/life-cv.html')) {
        initLifeCvPage(currentUser.uid); // This function will come from our new file.
    }
    // Add other initializers here as needed, e.g.:
    // if (path.includes('/finhelp/index.html')) {
    //     financeUI.initFinanceDashboard(currentUser.uid);
    // }
}

/**
 * Updates the user's name and email in the UI.
 */
async function updateUserUI(user) {
    currentUser = user;
    const userDocRef = doc(db, "users", user.uid);
    try {
        const userDoc = await getDoc(userDocRef);
        const displayName = (userDoc.exists() && userDoc.data().name) ? userDoc.data().name : user.email;
        
        document.querySelectorAll('.user-name').forEach(el => el.textContent = displayName);
        document.querySelectorAll('.user-email').forEach(el => el.textContent = user.email);
        
        displayWelcomeMessage(displayName);
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

/**
 * Displays the welcome message.
 */
function displayWelcomeMessage(name) {
    if (welcomeMessageContainer) {
        const lang = localStorage.getItem('language') || 'en';
        const welcomeText = translations[lang]?.welcome_back || "Welcome back";
        welcomeMessageContainer.innerHTML = `<h2 class="text-2xl font-bold">${welcomeText}, ${name}!</h2>`;
        welcomeMessageContainer.classList.remove('hidden');
    }
}

/**
 * Highlights the active link in the sidebar.
 */
function updateActiveSidebarLink(path) {
    const fullPath = `${basePath}${path}`;
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        // Use endsWith to avoid issues with domain names
        if (link.href.endsWith(fullPath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Sets up all the necessary event listeners for the dashboard.
 * This preserves your original event handling structure.
 */
function initializeEventListeners() {
    document.body.addEventListener('click', e => {
        // Navigation link clicks
        const navLink = e.target.closest('.sidebar-nav-link');
        if (navLink) {
            e.preventDefault();
            const path = new URL(navLink.href).pathname.replace(basePath, '');
            handleNavigation(path);
            return;
        }

        // Dropdown toggles (from your original header)
        const dropdownToggle = e.target.closest('.dropdown-toggle');
        if (dropdownToggle) {
            const dropdownMenu = dropdownToggle.nextElementSibling;
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('hidden');
            }
            return;
        }
        
        // Logout button
        if (e.target.id === 'logout-btn') {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = `${basePath}/index.html`;
            }).catch(error => console.error('Logout Error:', error));
        }
    });

    // Global click to hide dropdowns
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-container')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.add('hidden'));
        }
    });
}


// --- APPLICATION INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in.
            // This replaces the unreliable setTimeout. We now wait for all components to load.
            await Promise.all([
                loadComponent('header.html', headerPlaceholder),
                loadComponent('sidebar.html', sidebarPlaceholder),
                loadComponent('footer.html', footerPlaceholder)
            ]);

            // Now that components are loaded, we can safely interact with them.
            await updateUserUI(user);
            initializeEventListeners();

            // Determine the initial page to load based on the URL.
            const currentPath = window.location.pathname;
            const initialPath = (currentPath === `${basePath}/` || currentPath.endsWith('index.html')) 
                ? '/dashboard/overview.html' 
                : currentPath.replace(basePath, '');
            
            handleNavigation(initialPath);

        } else {
            // User is signed out, redirect to login page.
            const loginPath = `${basePath}/index.html`;
            if (window.location.pathname !== loginPath && window.location.pathname !== `${basePath}/`) {
                 window.location.href = loginPath;
            }
        }
    });
});
