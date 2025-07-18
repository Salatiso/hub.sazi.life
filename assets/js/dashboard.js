// File: /assets/js/dashboard.js
// Description: Corrected and simplified script to load shared components on every dashboard page.

import { auth, db } from './firebase-config.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIGURATION ---
// This is the single source of truth for all file paths. It fixes all 404 errors.
const basePath = '/hub.sazi.life-main'; 

/**
 * Fetches an HTML file and injects it into a placeholder element.
 * @param {string} componentPath - The root-relative path to the HTML component (e.g., '/dashboard/components/header.html').
 * @param {string} placeholderId - The ID of the element to inject the content into.
 */
async function loadComponent(componentPath, placeholderId) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.error(`Error: Placeholder element with ID '${placeholderId}' not found.`);
        return;
    }
    try {
        const response = await fetch(`${basePath}${componentPath}`);
        if (!response.ok) throw new Error(`Failed to fetch ${componentPath}: ${response.statusText}`);
        placeholder.innerHTML = await response.text();
    } catch (error) {
        console.error(`Error loading component into '${placeholderId}':`, error);
        placeholder.innerHTML = `<p class="text-red-500 p-4">Error: Could not load component.</p>`;
    }
}

/**
 * Sets up event listeners for elements inside the dynamically loaded components.
 * This function must be called AFTER the components have been loaded.
 */
function initializeEventListeners(user) {
    // Logout Button in Header
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = `${basePath}/index.html`;
            }).catch(error => console.error('Logout Error:', error));
        });
    }

    // Update User Name/Email in Header
    const userDocRef = doc(db, "users", user.uid);
    getDoc(userDocRef).then(userDoc => {
        const displayName = (userDoc.exists() && userDoc.data().name) ? userDoc.data().name : user.email;
        document.querySelectorAll('.user-name').forEach(el => el.textContent = displayName);
        document.querySelectorAll('.user-email').forEach(el => el.textContent = user.email);
    }).catch(error => console.error("Error fetching user data:", error));
}

/**
 * The main function that runs on every dashboard page load.
 */
async function initializePage(user) {
    // 1. Load the essential shared components into their placeholders.
    await Promise.all([
        loadComponent('/dashboard/components/header.html', 'header-placeholder'),
        loadComponent('/dashboard/components/sidebar.html', 'sidebar-placeholder'),
        loadComponent('/dashboard/components/footer.html', 'footer-placeholder')
    ]);

    // 2. Special case: If we are on the main dashboard index page, load the overview content.
    const path = window.location.pathname;
    if (path === `${basePath}/dashboard/` || path === `${basePath}/dashboard/index.html`) {
        await loadComponent('/dashboard/overview.html', 'main-content');
    }

    // 3. Now that all components are loaded, set up their event listeners.
    initializeEventListeners(user);
}

// --- MAIN EXECUTION ---
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // If the user is authenticated, initialize the current page.
            initializePage(user);
        } else {
            // If not authenticated, redirect to the main landing/login page.
            const loginPath = `${basePath}/index.html`;
            // Prevents a redirect loop if already on the login page.
            if (window.location.pathname !== loginPath && !window.location.pathname.startsWith(`${basePath}/dashboard`)) {
                 window.location.href = loginPath;
            }
        }
    });
});
