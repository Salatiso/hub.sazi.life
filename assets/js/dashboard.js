// File: /assets/js/dashboard.js (Cleaned and Updated)

/*
  This file contains the shared JavaScript for the entire Sazi Ecosystem dashboard.
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, query, onSnapshot, serverTimestamp, orderBy, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Firebase Initialization ---
const firebaseConfig = {
    apiKey: "AIzaSyD_pRVkeVzciCPowxsj44NRVlbyZvFPueI",
    authDomain: "lifecv-d2724.firebaseapp.com",
    projectId: "lifecv-d2724",
    storageBucket: "lifecv-d2724.firebasestorage.app",
    messagingSenderId: "1039752653127",
    appId: "1:1039752653127:web:54afa09b21c98ef231c462",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Component Loader & UI Setup ---
const loadComponent = async (componentPath, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.warn(`Placeholder with ID '${placeholderId}' not found.`);
        return;
    }
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Failed to load component: ${componentPath} (Status: ${response.status})`);
        const componentHTML = await response.text();
        placeholder.innerHTML = componentHTML;
    } catch (error) {
        console.error(error);
        placeholder.innerHTML = `<p class="text-red-500 text-center p-4">Error loading component.</p>`;
    }
};

const setupDropdown = (containerId, buttonId, menuId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);

    if (button && menu) {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            menu.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', (event) => {
        if (menu && !container.contains(event.target)) {
            menu.classList.add('hidden');
        }
    });
};

const setupThemeSwitcher = () => {
    const htmlEl = document.documentElement;
    const applyTheme = (theme) => {
        htmlEl.className = theme;
        localStorage.setItem('theme', theme);
    };

    const darkBtn = document.getElementById('theme-toggle-dark');
    const lightBtn = document.getElementById('theme-toggle-light');
    const childBtn = document.getElementById('theme-toggle-child');

    if (darkBtn) darkBtn.addEventListener('click', () => applyTheme('dark'));
    if (lightBtn) lightBtn.addEventListener('click', () => applyTheme('light'));
    if (childBtn) childBtn.addEventListener('click', () => applyTheme('theme-child-vibrant'));

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
};

// --- Main Initialization on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', async () => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const dashboardIndex = pathSegments.indexOf('dashboard');
    const depth = dashboardIndex !== -1 ? pathSegments.length - dashboardIndex - 1 : 0;
    const pathPrefix = '../'.repeat(depth) || './';

    // Load common components
    await Promise.all([
        loadComponent(`${pathPrefix}components/header.html`, 'header-placeholder'),
        loadComponent(`${pathPrefix}components/footer.html`, 'footer-placeholder'),
        // Assuming you have a sidebar component now
        loadComponent(`${pathPrefix}components/sidebar.html`, 'sidebar-placeholder') 
    ]);

    // Setup UI elements which might be inside loaded components
    // A small delay ensures the components are rendered before we attach listeners
    setTimeout(() => {
        setupDropdown('ecosystem-dropdown-container', 'ecosystem-btn', 'ecosystem-menu');
        setupDropdown('language-dropdown-container', 'language-btn', 'language-menu');
        setupThemeSwitcher();

        const logoutButton = document.getElementById('logout-btn');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => signOut(auth));
        }
    }, 100);


    // --- Page Specific Logic Router ---
    const path = window.location.pathname;
    
    // ** NEW LOGIC TO LOAD THE MAIN DASHBOARD VIEW **
    if (path.endsWith('/dashboard/') || path.endsWith('/dashboard/index.html')) {
        loadComponent(`${pathPrefix}dashboard/overview.html`, 'main-content');
    } 
    else if (path.includes('/profile.html')) initializeProfilePage();
    else if (path.includes('/life-cv.html')) initializeLifeCvPage();
    else if (path.includes('/assets/index.html')) initializeAssetsIndexPage();
    else if (path.includes('/assets/properties/editor.html')) initializeAssetEditorPage('properties');
    else if (path.includes('/assets/vehicles/editor.html')) initializeAssetEditorPage('vehicles');
    else if (path.includes('/assets/companies/editor.html')) initializeAssetEditorPage('companies');
    else if (path.includes('/public-pages/index.html')) initializePublicPagesIndex();
    else if (path.includes('/public-pages/editor.html')) initializePublicPageEditor();
});

// --- Helper to show messages ---
const showMessage = (elementId, message, isError = false) => {
    const messageDiv = document.getElementById(elementId);
    if (!messageDiv) return;
    messageDiv.textContent = message;
    messageDiv.className = `p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    messageDiv.classList.remove('hidden');
    setTimeout(() => messageDiv.classList.add('hidden'), 3000);
};

// --- Page Initialization Functions ---
// (These functions remain the same as before)

function initializeProfilePage() { console.log("Profile page initialized."); };
function initializeLifeCvPage() { console.log("LifeCV page initialized."); };
function initializeAssetsIndexPage() { onAuthStateChanged(auth, user => { if (user) { console.log("Asset Index Page Initialized for user:", user.uid); } }); };
function initializeAssetEditorPage(assetType) { /* ... Your existing logic ... */ };
function initializePublicPagesIndex() { console.log("Public Pages Index initialized."); };
function initializePublicPageEditor() { /* ... Your existing logic ... */ };
