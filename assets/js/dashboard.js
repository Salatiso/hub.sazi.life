// File: /assets/js/dashboard.js
// Description: Corrected main script for The Hub dashboard.
// This version fixes all file path issues to ensure components and pages load correctly.

// --- Firebase & Module Imports ---
// Imports are now correctly resolved because the script tag in index.html has type="module"
import { auth, db } from './firebase-config.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Note: The translation engine and other specific UI modules will be loaded by the navigation logic.
// We keep the core dashboard script clean.

// --- DOM ELEMENT REFERENCES ---
const mainContent = document.getElementById('main-content');
const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
const headerPlaceholder = document.getElementById('header-placeholder');
const footerPlaceholder = document.getElementById('footer-placeholder');
const welcomeMessageContainer = document.getElementById('dashboard-welcome-message');

let currentUser = null; // To store user data

/**
 * Fetches and loads an HTML component (like header, sidebar) into a specified placeholder element.
 * @param {string} componentPath - The absolute path to the HTML component.
 * @param {HTMLElement} placeholder - The DOM element to load the content into.
 */
async function loadComponent(componentPath, placeholder) {
    if (!placeholder) return;
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentPath}. Status: ${response.status}`);
        }
        const content = await response.text();
        placeholder.innerHTML = content;
    } catch (error) {
        console.error(error);
        placeholder.innerHTML = `<div class="text-red-500 p-4">Error loading component: ${componentPath}</div>`;
    }
}

/**
 * Fetches user data from Firestore and updates the UI.
 * @param {object} user - The Firebase auth user object.
 */
async function updateUserUI(user) {
    const userProfileName = document.getElementById('user-profile-name');
    const userProfileEmail = document.getElementById('user-profile-email');
    const welcomeName = document.getElementById('welcome-name');

    if (user.isAnonymous) {
        if (userProfileName) userProfileName.textContent = 'Anonymous User';
        if (userProfileEmail) userProfileEmail.textContent = 'No email';
        if (welcomeName) welcomeName.textContent = 'Anonymous User';
        return;
    }

    try {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            currentUser = userData;
            const displayName = userData.name || user.email;
            if (userProfileName) userProfileName.textContent = displayName;
            if (userProfileEmail) userProfileEmail.textContent = user.email;
            if (welcomeName) welcomeName.textContent = displayName;
            
            // Show welcome message only on the overview page
            if(window.location.pathname.endsWith('overview.html') || window.location.pathname.endsWith('/')) {
                 if(welcomeMessageContainer) {
                    welcomeMessageContainer.innerHTML = `<h2 class="text-2xl font-semibold text-primary">Welcome back, <span id="welcome-name">${displayName}</span>!</h2>`;
                    welcomeMessageContainer.classList.remove('hidden');
                 }
            }

        } else {
            console.log("No such user document!");
            if (userProfileName) userProfileName.textContent = user.email;
            if (userProfileEmail) userProfileEmail.textContent = user.email;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

/**
 * Handles navigation by loading page content into the main area.
 * It also dynamically loads page-specific JavaScript modules.
 * @param {string} path - The absolute path to the content page to load.
 */
async function handleNavigation(path) {
    if (!mainContent) return;
    mainContent.innerHTML = "<div class='p-8 text-center text-secondary'>Loading...</div>";
    
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Page not found: ${path}`);
        }
        const content = await response.text();
        mainContent.innerHTML = content;
        
        // After loading content, run page-specific initializers
        if (path.includes('life-cv.html')) {
            const { initLifeCvPage } = await import('./life-cv/life-cv-ui.js');
            initLifeCvPage(auth.currentUser?.uid);
        }
        // Add other page-specific logic here as needed
        // e.g., if (path.includes('finhelp')) { ... }

    } catch (error) {
        console.error('Navigation Error:', error);
        mainContent.innerHTML = `<div class="p-8 text-center text-red-500">Failed to load page. Please check the console for details.</div>`;
    }
}


/**
 * Initializes all event listeners for the dashboard shell (header, sidebar).
 */
function initializeEventListeners() {
    // Use event delegation for dynamically loaded content
    document.body.addEventListener('click', (e) => {
        // Sidebar navigation
        if (e.target.matches('.sidebar-nav-link')) {
            e.preventDefault();
            const path = e.target.getAttribute('href');
            handleNavigation(path);
            // Update browser history
            window.history.pushState({ path }, '', `/dashboard${path.substring(path.lastIndexOf('/'))}`);
        }

        // Logout button
        if (e.target.id === 'logout-btn') {
            signOut(auth).then(() => {
                window.location.href = '/index.html'; // Redirect to login page
            }).catch(error => console.error('Logout Error:', error));
        }
        
        // Dropdown toggle
        if (e.target.closest('.dropdown-toggle')) {
             const dropdown = e.target.closest('.dropdown-container').querySelector('.dropdown-menu');
             dropdown.classList.toggle('hidden');
        } else if (!e.target.closest('.dropdown-container')) {
            // Hide all dropdowns if clicking outside
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.add('hidden'));
        }
    });
}

// --- APPLICATION INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Load shell components first
            await Promise.all([
                loadComponent('/dashboard/components/header.html', headerPlaceholder),
                loadComponent('/dashboard/components/sidebar.html', sidebarPlaceholder),
                loadComponent('/dashboard/components/footer.html', footerPlaceholder)
            ]);

            // Once components are loaded, populate user info and set up listeners
            await updateUserUI(user);
            initializeEventListeners();

            // Determine the initial page to load
            const currentPath = window.location.pathname;
            let initialPage = '/dashboard/overview.html'; // Default page
            
            // This allows direct navigation to a specific dashboard page
            if (currentPath.startsWith('/dashboard/') && currentPath !== '/dashboard/' && currentPath !== '/dashboard/index.html') {
                initialPage = currentPath;
            }
            
            handleNavigation(initialPage);

        } else {
            // If no user, redirect to login page, unless already there.
            const loginPath = '/index.html';
            const rootPath = '/';
            if (window.location.pathname !== loginPath && window.location.pathname !== rootPath) {
                 window.location.href = loginPath;
            }
        }
    });
});
