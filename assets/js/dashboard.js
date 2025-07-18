// File: /assets/js/dashboard.js
// Description: Main script for The Hub dashboard with corrected paths and loading logic.

// --- Firebase & Module Imports ---
import { auth, db } from './firebase-config.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { translations } from './translations.js'; // Import from the new translations file
import { initLifeCvPage } from './life-cv/life-cv-ui.js'; 

// --- CONFIGURATION ---
// Corrected base path. This is the key to fixing the 404 errors.
const basePath = '/hub.sazi.life'; 
let currentUser = null;

// --- DOM ELEMENT REFERENCES ---
const mainContent = document.getElementById('main-content');
const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
const headerPlaceholder = document.getElementById('header-placeholder');
const footerPlaceholder = document.getElementById('footer-placeholder');
const welcomeMessageContainer = document.getElementById('dashboard-welcome-message');

/**
 * Loads an HTML component (header, sidebar, etc.) into a placeholder element.
 */
async function loadComponent(componentPath, placeholder) {
    if (!placeholder) return;
    const fullComponentPath = `${basePath}/dashboard/components/${componentPath}`;
    try {
        const response = await fetch(fullComponentPath);
        if (!response.ok) throw new Error(`Component not found: ${fullComponentPath}`);
        placeholder.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
        placeholder.innerHTML = `<p class="text-red-500">Error: ${componentPath} failed to load.</p>`;
    }
}

/**
 * Fetches and displays the content for a given page (e.g., overview.html).
 */
async function handleNavigation(path) {
    if (!mainContent) return;
    
    // Default to the overview page if the root dashboard is requested.
    if (path.endsWith('/dashboard/') || path.endsWith('/dashboard/index.html') || path === '/dashboard' || path === '/') {
        path = '/dashboard/overview.html';
    }
    
    mainContent.innerHTML = `<div class='p-8 text-center text-secondary'>Loading...</div>`;
    const fullUrl = `${basePath}${path}`;

    try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`Page not found: ${fullUrl}`);
        const content = await response.text();
        
        mainContent.innerHTML = content;
        window.history.pushState({}, '', fullUrl);
        
        initializePageScript(path);
        updateActiveSidebarLink(path);
    } catch (error) {
        console.error('Navigation Error:', error);
        mainContent.innerHTML = `<div class='p-8 text-center text-red-500'>Error: Could not load page content.</div>`;
    }
}

/**
 * Calls the necessary JavaScript for a specific page after it has been loaded.
 */
function initializePageScript(path) {
    if (!currentUser) return;
    if (path.includes('/life-cv/life-cv.html')) {
        initLifeCvPage(currentUser.uid);
    }
    // Add other page initializers here as needed.
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
 * Displays the welcome message, using the selected language.
 */
function displayWelcomeMessage(name) {
    if (welcomeMessageContainer) {
        const lang = localStorage.getItem('language') || 'en';
        const welcomeText = (translations[lang] && translations[lang].welcome_back) ? translations[lang].welcome_back : "Welcome back";
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
        if (link.href.endsWith(fullPath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Sets up all event listeners for the dashboard.
 */
function initializeEventListeners() {
    document.body.addEventListener('click', e => {
        const navLink = e.target.closest('.sidebar-nav-link');
        if (navLink) {
            e.preventDefault();
            const path = new URL(navLink.href).pathname.replace(basePath, '');
            handleNavigation(path);
            return;
        }

        const dropdownToggle = e.target.closest('.dropdown-toggle');
        if (dropdownToggle) {
            dropdownToggle.nextElementSibling?.classList.toggle('hidden');
            return;
        }
        
        if (e.target.id === 'logout-btn') {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = `${basePath}/index.html`;
            }).catch(error => console.error('Logout Error:', error));
        }
    });

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
            // This robust loading logic replaces the original setTimeout.
            await Promise.all([
                loadComponent('header.html', headerPlaceholder),
                loadComponent('sidebar.html', sidebarPlaceholder),
                loadComponent('footer.html', footerPlaceholder)
            ]);

            await updateUserUI(user);
            initializeEventListeners();

            const currentPath = window.location.pathname.replace(/\/$/, ""); // Remove trailing slash
            const initialPath = (currentPath === basePath || currentPath.endsWith('index.html')) 
                ? '/dashboard/overview.html' 
                : currentPath.replace(basePath, '');
            
            handleNavigation(initialPath);
        } else {
            const loginPath = `${basePath}/index.html`;
            if (window.location.pathname !== loginPath && window.location.pathname !== `${basePath}/`) {
                 window.location.href = loginPath;
            }
        }
    });
});
