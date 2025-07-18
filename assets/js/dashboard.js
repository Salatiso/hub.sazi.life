// File: /assets/js/dashboard.js
// Description: Main script for The Hub dashboard with definitive pathing and corrected logic.

// --- Firebase & Module Imports ---
import { auth, db } from './firebase-config.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Import page-specific UI initializers
import * as lifeCvUI from './life-cv/life-cv-ui.js'; 

// --- TRANSLATION DICTIONARY ---
const translations = {
    en: {
        "sidebar_overview": "Overview",
        "sidebar_lifecv": "Life-CV",
        "sidebar_publications": "Publications",
        "sidebar_public_pages": "Public Pages",
        "sidebar_activity": "Activity",
        "welcome_back": "Welcome back"
    },
    xh: {
        "sidebar_overview": "Isishwankathelo",
        "sidebar_lifecv": "i-Life-CV",
        "sidebar_publications": "Ushicilelo",
        "sidebar_public_pages": "Amaphepha Oluntu",
        "sidebar_activity": "Umsebenzi",
        "welcome_back": "Wamkelekile kwakhona"
    },
    zu: {
        "sidebar_overview": "Ukubuka konke",
        "sidebar_lifecv": "i-Life-CV",
        "sidebar_publications": "Okushicilelwe",
        "sidebar_public_pages": "Amakhasi Omphakathi",
        "sidebar_activity": "Umsebenzi",
        "welcome_back": "Siyakwamukela futhi"
    },
    af: {
        "sidebar_overview": "Oorsig",
        "sidebar_lifecv": "Lewens-CV",
        "sidebar_publications": "Publikasies",
        "sidebar_public_pages": "Openbare Bladsye",
        "sidebar_activity": "Aktiwiteit",
        "welcome_back": "Welkom terug"
    },
    st: {
        "sidebar_overview": "Kakaretso",
        "sidebar_lifecv": "CV ea Bophelo",
        "sidebar_publications": "Lingoliloeng",
        "sidebar_public_pages": "Maqephe a Sechaba",
        "sidebar_activity": "Ketso",
        "welcome_back": "Rea u amohela hape"
    },
    nso: {
        "sidebar_overview": "Kakaretšo",
        "sidebar_lifecv": "Bophelo-CV",
        "sidebar_publications": "Dingwalwa",
        "sidebar_public_pages": "Maqephe a Setšhaba",
        "sidebar_activity": "Mosebetsi",
        "welcome_back": "Rea go amogela gape"
    },
    ts: {
        "sidebar_overview": "Vutsongo bya mhaka hinkwayo",
        "sidebar_lifecv": "CV ya vutomi",
        "sidebar_publications": "Swatisayense",
        "sidebar_public_pages": "Mapheji ya Vaaki",
        "sidebar_activity": "Mintirho",
        "welcome_back": "U amukeriwile nakambe"
    },
    ve: {
        "sidebar_overview": "Maṅwalo aṱoṱhe",
        "sidebar_lifecv": "CV ya vhutshilo",
        "sidebar_publications": "Zwithumiswa",
        "sidebar_public_pages": "Maṱerere a vhathu",
        "sidebar_activity": "Mishumo",
        "welcome_back": "Ni amukedzwa hafhu"
    },
    tn: {
        "sidebar_overview": "Kakaretso",
        "sidebar_lifecv": "Bophelo-CV",
        "sidebar_publications": "Dikgatiso",
        "sidebar_public_pages": "Mafelo a Setšhaba",
        "sidebar_activity": "Ditiro",
        "welcome_back": "Re go amogela gape"
    },
    ss: {
        "sidebar_overview": "Sifinyezo",
        "sidebar_lifecv": "Life-CV",
        "sidebar_publications": "Kushicilelwe",
        "sidebar_public_pages": "Emaphepha Elubandlululo",
        "sidebar_activity": "Umsebenti",
        "welcome_back": "Wemukelekile futsi"
    },
    nr: {
        "sidebar_overview": "Uhlolisiso",
        "sidebar_lifecv": "Life-CV",
        "sidebar_publications": "Okupapashiweyo",
        "sidebar_public_pages": "Amakhasi Oluntu",
        "sidebar_activity": "Umsebenzi",
        "welcome_back": "Wamukelekile futhi"
    },
    sw: {
        "sidebar_overview": "Muhtasari",
        "sidebar_lifecv": "CV ya Maisha",
        "sidebar_publications": "Machapisho",
        "sidebar_public_pages": "Kurasa za Umma",
        "sidebar_activity": "Shughuli",
        "welcome_back": "Karibu tena"
    },
    pt: {
        "sidebar_overview": "Visão geral",
        "sidebar_lifecv": "CV de Vida",
        "sidebar_publications": "Publicações",
        "sidebar_public_pages": "Páginas Públicas",
        "sidebar_activity": "Atividade",
        "welcome_back": "Bem-vindo de volta"
    },
    fr: {
        "sidebar_overview": "Aperçu",
        "sidebar_lifecv": "CV de Vie",
        "sidebar_publications": "Publications",
        "sidebar_public_pages": "Pages Publiques",
        "sidebar_activity": "Activité",
        "welcome_back": "Bon retour"
    }
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
 * @param {string} componentPath - The path to the HTML component file (e.g., 'sidebar.html').
 * @param {HTMLElement} placeholder - The element to inject the HTML into.
 * @returns {Promise<void>}
 */
async function loadComponent(componentPath, placeholder) {
    if (!placeholder) return;
    // Construct the full path relative to the domain root
    const fullComponentPath = `${basePath}/dashboard/components/${componentPath}`;
    try {
        const response = await fetch(fullComponentPath);
        if (!response.ok) throw new Error(`Failed to load component: ${fullComponentPath} (Status: ${response.status})`);
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
    
    // Default to overview if path is for the root dashboard page
    if (path.endsWith('/dashboard/') || path.endsWith('/dashboard/index.html')) {
        path = '/dashboard/overview.html';
    }
    
    mainContent.innerHTML = `<div class='p-8 text-center text-secondary'>Loading...</div>`;
    
    const fullUrl = `${basePath}${path}`;

    try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`Page not found: ${fullUrl}`);
        const content = await response.text();
        
        // Update the main content and browser history
        mainContent.innerHTML = content;
        window.history.pushState({}, '', fullUrl);
        
        // Initialize any scripts specific to the newly loaded page
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
        const pubList = document.getElementById('publications-list');
        if(pubList) pubList.innerHTML = '<p>Your publications will be listed here.</p>';
    } else if (path.includes('/public-pages/index.html')) {
         const pageList = document.getElementById('public-pages-list');
        if(pageList) pageList.innerHTML = '<p>Your public pages will be listed here.</p>';
    }
    // Add other page initializers here as you build them out
}

/**
 * Updates the UI with the user's information after components are loaded.
 * @param {object} user - The Firebase user object.
 */
async function updateUserUI(user) {
    currentUser = user;
    const userDocRef = doc(db, "users", user.uid);
    try {
        const userDoc = await getDoc(userDocRef);
        const displayName = userDoc.exists() && userDoc.data().name ? userDoc.data().name : user.email;

        // Update all elements with user's name and email
        document.querySelectorAll('.user-name').forEach(el => el.textContent = displayName);
        document.querySelectorAll('.user-email').forEach(el => el.textContent = user.email);
        
        displayWelcomeMessage(displayName);
    } catch (error) {
        console.error("Error fetching user document:", error);
    }
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
 * @param {string} path - The current page path (e.g., '/dashboard/overview.html').
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
 * Initializes all event listeners for the dashboard shell (header, sidebar, etc.).
 */
function initializeEventListeners() {
    // Use event delegation on the body for SPA navigation and dropdowns
    document.body.addEventListener('click', e => {
        // Handle SPA navigation for any link with the 'sidebar-nav-link' class
        const navLink = e.target.closest('.sidebar-nav-link');
        if (navLink) {
            e.preventDefault();
            const path = new URL(navLink.href).pathname.replace(basePath, '');
            handleNavigation(path);
            return; // Stop further processing
        }

        // Handle dropdown toggles
        const dropdownToggle = e.target.closest('.dropdown-toggle');
        if (dropdownToggle) {
            const dropdownMenu = dropdownToggle.nextElementSibling;
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('hidden');
            }
            return; // Stop further processing
        }
        
        // Handle logout button
        if (e.target.id === 'logout-btn') {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = `${basePath}/index.html`;
            }).catch(error => console.error('Logout Error:', error));
        }
    });

    // Global click listener to hide dropdowns when clicking outside
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
            // Load shell components in parallel for speed.
            await Promise.all([
                loadComponent('header.html', headerPlaceholder),
                loadComponent('sidebar.html', sidebarPlaceholder),
                loadComponent('footer.html', footerPlaceholder)
            ]);

            // Once components are loaded, update UI with user data and set up event listeners.
            await updateUserUI(user);
            initializeEventListeners();

            // Determine the initial page to load from the URL.
            const currentPath = window.location.pathname;
            const initialPath = (currentPath === `${basePath}/` || currentPath.endsWith('index.html')) 
                ? '/dashboard/overview.html' 
                : currentPath.replace(basePath, '');
            
            handleNavigation(initialPath);

        } else {
            // User is signed out. Redirect to the main login page.
            const loginPath = `${basePath}/index.html`;
            // Avoid a redirect loop if already on the login page.
            if (window.location.pathname !== loginPath && window.location.pathname !== `${basePath}/`) {
                 window.location.href = loginPath;
            }
        }
    });
});
