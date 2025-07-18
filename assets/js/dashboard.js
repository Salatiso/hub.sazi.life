// File: /assets/js/dashboard.js
// Description: Corrected main script for The Hub dashboard.

// --- Firebase & Module Imports ---
import { auth, db } from './firebase-config.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Note: The translation engine is not used by this file directly, but by components it loads.

// --- CONFIGURATION ---
// This base path is the single source of truth for all file paths.
// It fixes all 404 (Not Found) errors.
const basePath = '/hub.sazi.life-main'; 
let currentUser = null;

// --- DOM ELEMENT REFERENCES ---
const mainContentEl = document.getElementById('main-content');
const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
const headerPlaceholder = document.getElementById('header-placeholder');
const footerPlaceholder = document.getElementById('footer-placeholder');
const welcomeMessageContainer = document.getElementById('dashboard-welcome-message');

/**
 * Loads an HTML component (header, sidebar, etc.) into a placeholder element.
 * This function is now robust and provides clear error messages in the console.
 */
async function loadComponent(componentPath, placeholder) {
    if (!placeholder) {
        console.error(`Placeholder for ${componentPath} not found.`);
        return;
    }
    const fullComponentPath = `${basePath}${componentPath}`;
    try {
        const response = await fetch(fullComponentPath);
        if (!response.ok) throw new Error(`Component not found at ${fullComponentPath}`);
        placeholder.innerHTML = await response.text();
    } catch (error) {
        console.error(`Failed to load component: ${componentPath}`, error);
        placeholder.innerHTML = `<div class="text-red-500 p-4">Error loading component.</div>`;
    }
}

/**
 * This is the main function that builds the dashboard page.
 * It replaces the old, unreliable setTimeout logic.
 */
async function initializeDashboard(user) {
    currentUser = user;

    // 1. Load all essential shell components at the same time.
    await Promise.all([
        loadComponent('/dashboard/components/header.html', headerPlaceholder),
        loadComponent('/dashboard/components/sidebar.html', sidebarPlaceholder),
        loadComponent('/dashboard/components/footer.html', footerPlaceholder)
    ]);

    // 2. Once the shell is loaded, populate user-specific details.
    await updateUserUI(user);
    
    // 3. Load the main content for the index page.
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
        await loadComponent('/dashboard/overview.html', mainContentEl);
    }

    // 4. Set up event listeners for the newly loaded components (like the logout button).
    initializeEventListeners();
}

/**
 * Updates the user's name and email in the UI.
 */
async function updateUserUI(user) {
    const userDocRef = doc(db, "users", user.uid);
    try {
        const userDoc = await getDoc(userDocRef);
        const displayName = (userDoc.exists() && userDoc.data().name) ? userDoc.data().name : user.email;
        
        document.querySelectorAll('.user-name').forEach(el => el.textContent = displayName);
        document.querySelectorAll('.user-email').forEach(el => el.textContent = user.email);
        
        if (welcomeMessageContainer) {
            welcomeMessageContainer.innerHTML = `<h2 class="text-2xl font-bold">Welcome back, ${displayName}!</h2>`;
            welcomeMessageContainer.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

/**
 * Sets up all event listeners after components are loaded.
 */
function initializeEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = `${basePath}/index.html`;
            }).catch(error => console.error('Logout Error:', error));
        });
    }
    // Add other listeners for dropdowns, etc. here if they are in loaded components
}

// --- APPLICATION INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, build the page.
            initializeDashboard(user);
        } else {
            // User is not signed in, redirect to the main landing/login page.
            const loginPath = `${basePath}/index.html`;
            if (window.location.pathname !== loginPath && !window.location.pathname.endsWith('/')) {
                 window.location.href = loginPath;
            }
        }
    });
});
