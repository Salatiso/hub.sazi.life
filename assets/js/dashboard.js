// File: /assets/js/dashboard.js
// Description: Main script for The Hub, with corrected content loading logic.

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initTranslations, applyTranslations } from './translations-engine.js';
// Import page-specific UI modules if they exist
// import * as financeUI from './financehelp/finance-ui.js';

// --- Core UI & Routing Functions ---

const loadComponent = async (componentName, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;
    try {
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
 * @param {string} pagePath - The full relative path of the page to load (e.g., 'overview.html').
 */
const loadContent = async (pagePath) => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = '<div class="flex justify-center items-center h-full"><div class="loader"></div></div>';

    try {
        // *** FIX: Fetches the path directly. No more prepending './pages/'. ***
        const response = await fetch(`./${pagePath}`);
        if (!response.ok) throw new Error(`Page not found: ${pagePath}`);
        mainContent.innerHTML = await response.text();
        await applyTranslations(mainContent);
        
        initializePageScripts(pagePath);
        updateActiveLink(pagePath);
        
        const pageTitleEl = document.getElementById('page-title');
        if(pageTitleEl) {
            const title = pagePath.split('/').pop().replace(/-/g, ' ').replace('.html', '');
            pageTitleEl.textContent = title.charAt(0).toUpperCase() + title.slice(1);
        }

    } catch (error) {
        console.error('Error loading page content:', error);
        mainContent.innerHTML = `<div class="p-8 text-center"><h2 class="text-2xl font-bold text-red-500">Error 404</h2><p>Content for '${pagePath}' could not be found.</p></div>`;
    }
};

const updateActiveLink = (pagePath) => {
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        if (link.getAttribute('data-page') === pagePath) {
            link.classList.add('active-link');
        } else {
            link.classList.remove('active-link');
        }
    });
};

const initializePageScripts = (pagePath) => {
    // Example: if (pagePath.startsWith('pages/finhelp')) { financeUI.init(); }
};

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
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};

            await initTranslations(localStorage.getItem('language') || 'en');

            await Promise.all([
                loadComponent('sidebar', 'sidebar-placeholder'),
                loadComponent('header', 'header-placeholder'),
                loadComponent('footer', 'footer-placeholder')
            ]);
            
            // Load the initial page, 'overview.html', from the root.
            loadContent('overview.html');

            setTimeout(() => {
                populateUserData(user, userData);

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
            if (!window.location.pathname.endsWith('/') && !window.location.pathname.endsWith('index.html')) {
                 window.location.href = './index.html';
            }
        }
    });

    // --- GLOBAL EVENT LISTENER for SPA Navigation ---
    document.body.addEventListener('click', (e) => {
        const navLink = e.target.closest('.sidebar-nav-link');
        if (navLink && navLink.dataset.page) {
            e.preventDefault();
            loadContent(navLink.dataset.page);
        }
        
        const langOption = e.target.closest('.language-option');
        if (langOption) {
            const lang = langOption.getAttribute('data-lang');
            localStorage.setItem('language', lang);
            initTranslations(lang);
            const langMenu = document.getElementById('language-menu');
            if (langMenu) langMenu.classList.add('hidden');
        }

        if (!e.target.closest('#user-dropdown-container')) {
            document.getElementById('user-menu')?.classList.add('hidden');
        }
         if (!e.target.closest('#language-dropdown-container')) {
            document.getElementById('language-menu')?.classList.add('hidden');
        }
    });
});
