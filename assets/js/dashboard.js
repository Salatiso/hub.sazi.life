// File: /assets/js/dashboard.js
// Description: Main script for The Hub, rewritten for the new SPA structure.

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initTranslations, applyTranslations } from './translations-engine.js';
// Import page-specific UI modules if they exist
// import * as financeUI from './financehelp/finance-ui.js';
// import * as publicPagesUI from './public-pages/publisher.js';

// --- Core UI & Routing Functions ---

/**
 * Loads an HTML component (header, sidebar) into a placeholder.
 * @param {string} componentName - The name of the component (e.g., 'sidebar').
 * @param {string} placeholderId - The ID of the element to load the component into.
 */
const loadComponent = async (componentName, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;
    try {
        // *** FIX: Path is now a simple relative path to the components folder. ***
        const response = await fetch(`./components/${componentName}.html`);
        if (!response.ok) throw new Error(`Failed to load ${componentName}.`);
        placeholder.innerHTML = await response.text();
        await applyTranslations(placeholder);
    } catch (error) {
        console.error(`Error loading component ${componentName}:`, error);
        placeholder.innerHTML = `<p class="text-red-500">Error loading ${componentName}.</p>`;
    }
};

/**
 * Loads the main content for a given page into the #main-content area.
 * @param {string} pagePath - The path of the page to load (e.g., 'overview' or 'life-cv/life-cv').
 */
const loadContent = async (pagePath) => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = '<div class="flex justify-center items-center h-full"><div class="loader"></div></div>';

    try {
        // *** FIX: Path is now a simple relative path to the pages folder. ***
        const response = await fetch(`./pages/${pagePath}.html`);
        if (!response.ok) throw new Error(`Page not found: ${pagePath}`);
        mainContent.innerHTML = await response.text();
        await applyTranslations(mainContent);
        
        // After loading content, initialize any page-specific scripts
        initializePageScripts(pagePath);
        updateActiveLink(pagePath);
        
        // Update the main page title in the header
        const pageTitleEl = document.getElementById('page-title');
        if(pageTitleEl) {
            // Create a user-friendly title from the path
            const title = pagePath.split('/').pop().replace(/-/g, ' ').replace('.html', '');
            pageTitleEl.textContent = title.charAt(0).toUpperCase() + title.slice(1);
        }

    } catch (error) {
        console.error('Error loading page content:', error);
        mainContent.innerHTML = `<div class="p-8 text-center"><h2 class="text-2xl font-bold text-red-500">Error 404</h2><p>Content for '${pagePath}' could not be found.</p></div>`;
    }
};

/**
 * Updates the active state of sidebar links.
 * @param {string} pagePath - The current page path.
 */
const updateActiveLink = (pagePath) => {
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        if (link.getAttribute('data-page') === pagePath) {
            link.classList.add('active-link');
        } else {
            link.classList.remove('active-link');
        }
    });
};

/**
 * Initializes scripts for specific pages after they are loaded.
 * @param {string} pagePath - The path of the loaded page.
 */
const initializePageScripts = (pagePath) => {
    // Example: if (pagePath.startsWith('finhelp')) { financeUI.init(); }
    // Add other page initializations here as needed.
};

/**
 * Populates user-specific information in the UI.
 * @param {object} user - The Firebase auth user object.
 * @param {object} userData - User data from Firestore.
 */
const populateUserData = (user, userData) => {
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    
    if (userNameEl) userNameEl.textContent = userData.displayName || user.displayName || 'User';
    if (userAvatarEl) userAvatarEl.src = userData.photoURL || user.photoURL || 'https://placehold.co/100x100/667eea/ffffff?text=U';
};

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in.
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};

            await initTranslations(localStorage.getItem('language') || 'en');

            // Load all static components in parallel
            await Promise.all([
                loadComponent('sidebar', 'sidebar-placeholder'),
                loadComponent('header', 'header-placeholder'),
                loadComponent('footer', 'footer-placeholder')
            ]);
            
            // Load the initial page (overview)
            loadContent('overview');

            // Use a timeout to ensure components are on the DOM before adding listeners
            setTimeout(() => {
                populateUserData(user, userData);

                // Setup dropdowns and logout
                const userBtn = document.getElementById('user-btn');
                const userMenu = document.getElementById('user-menu');
                if (userBtn) userBtn.addEventListener('click', () => userMenu.classList.toggle('hidden'));
                
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        signOut(auth).catch(error => console.error('Logout Error:', error));
                    });
                }
            }, 500);

        } else {
            // User is signed out, redirect to login page.
            if (!window.location.pathname.endsWith('/') && !window.location.pathname.endsWith('index.html')) {
                 window.location.href = './index.html';
            }
        }
    });

    // --- GLOBAL EVENT LISTENER for SPA Navigation ---
    document.body.addEventListener('click', (e) => {
        // Handle sidebar navigation
        const navLink = e.target.closest('.sidebar-nav-link');
        if (navLink && navLink.dataset.page) {
            e.preventDefault();
            loadContent(navLink.dataset.page);
        }
        
        // Handle language switching
        const langOption = e.target.closest('.language-option');
        if (langOption) {
            const lang = langOption.getAttribute('data-lang');
            localStorage.setItem('language', lang);
            initTranslations(lang);
            const langMenu = document.getElementById('language-menu');
            if (langMenu) langMenu.classList.add('hidden');
        }

        // Close dropdowns when clicking outside
        if (!e.target.closest('#user-dropdown-container')) {
            document.getElementById('user-menu')?.classList.add('hidden');
        }
         if (!e.target.closest('#language-dropdown-container')) {
            document.getElementById('language-menu')?.classList.add('hidden');
        }
    });
});
