// File: /assets/js/dashboard.js
// Description: A simplified script that only loads shared components. It does NOT handle page navigation.

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initTranslations, applyTranslations } from './translations-engine.js';

/**
 * Loads a static HTML component into a placeholder.
 * @param {string} componentName - The name of the component file (e.g., 'sidebar').
 * @param {string} placeholderId - The ID of the element to load the component into.
 */
const loadComponent = async (componentName, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;
    try {
        // Uses a root-relative path that works from any page depth.
        const response = await fetch(`/hub.sazi.life/components/${componentName}.html`);
        if (!response.ok) throw new Error(`Failed to load ${componentName}.`);
        placeholder.innerHTML = await response.text();
        await applyTranslations(placeholder);
    } catch (error) {
        console.error(`Error loading component ${componentName}:`, error);
        placeholder.innerHTML = `<p class="text-red-500">Error loading ${componentName}.</p>`;
    }
};

/**
 * Populates the header with the current user's name and avatar.
 * @param {object} user - The Firebase auth user object.
 * @param {object} userData - User data from Firestore.
 */
const populateUserData = (user, userData) => {
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    
    if (userNameEl) userNameEl.textContent = userData.displayName || user.displayName || 'User';
    if (userAvatarEl) userAvatarEl.src = userData.photoURL || user.photoURL || 'https://placehold.co/100x100/667eea/ffffff?text=U';
};

// --- Main Initialization Logic ---

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};

            await initTranslations(localStorage.getItem('language') || 'en');

            // Load all static parts of the dashboard shell.
            await Promise.all([
                loadComponent('sidebar', 'sidebar-placeholder'),
                loadComponent('header', 'header-placeholder'),
                loadComponent('footer', 'footer-placeholder')
            ]);
            
            // Delay adding listeners to ensure components are loaded.
            setTimeout(() => {
                populateUserData(user, userData);

                // Highlight the active link in the sidebar based on the current page URL.
                const currentPath = window.location.pathname;
                document.querySelectorAll('.sidebar-nav-link').forEach(link => {
                    if (link.getAttribute('href') === currentPath) {
                        link.classList.add('active-link');
                    }
                });

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
            // User is signed out, redirect to the login page.
            if (!window.location.pathname.includes('index.html')) {
                 window.location.href = '/hub.sazi.life/index.html';
            }
        }
    });

     // --- Global Event Listeners for UI elements ---
    document.body.addEventListener('click', (e) => {
        // Handle language switching
        const langOption = e.target.closest('.language-option');
        if (langOption) {
            const lang = langOption.getAttribute('data-lang');
            localStorage.setItem('language', lang);
            initTranslations(lang);
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
