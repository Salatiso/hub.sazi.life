// File: /assets/js/dashboard.js (Translation & Theme Update)

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

// --- TRANSLATION DICTIONARY ---
const translations = {
    en: {
        "sidebar_overview": "Overview",
        "sidebar_lifecv": "Life-CV",
        "sidebar_publications": "Publications",
        "sidebar_assets": "Assets",
        "sidebar_training": "Training",
        "sidebar_public_pages": "Public Pages",
        "sidebar_activity": "Activity",
    },
    xh: {
        "sidebar_overview": "Isishwankathelo",
        "sidebar_lifecv": "i-Life-CV",
        "sidebar_publications": "Ushicilelo",
        "sidebar_assets": "Ii-asethi",
        "sidebar_training": "Uqeqesho",
        "sidebar_public_pages": "Amaphepha Oluntu",
        "sidebar_activity": "Umsebenzi",
    },
    zu: {
        "sidebar_overview": "Ukubuka konke",
        "sidebar_lifecv": "i-Life-CV",
        "sidebar_publications": "Okushicilelwe",
        "sidebar_assets": "Amafa",
        "sidebar_training": "Ukuqeqeshwa",
        "sidebar_public_pages": "Amakhasi Omphakathi",
        "sidebar_activity": "Umsebenzi",
    },
    af: {
        "sidebar_overview": "Oorsig",
        "sidebar_lifecv": "Lewens-CV",
        "sidebar_publications": "Publikasies",
        "sidebar_assets": "Bates",
        "sidebar_training": "Opleiding",
        "sidebar_public_pages": "Openbare Bladsye",
        "sidebar_activity": "Aktiwiteit",
    }
};

// --- CORE FUNCTIONS ---

const loadComponent = async (componentPath, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Component not found: ${componentPath}`);
        placeholder.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
};

const setLanguage = (lang) => {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        } else {
            // Fallback to English if translation is missing
            el.innerText = translations['en'][key];
        }
    });
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
};

const applyTheme = (theme) => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
};

// --- SETUP FUNCTIONS ---

const setupDropdown = (containerId, buttonId, menuId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);
    if (button && menu) {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });
    }
};

const setupThemeSwitcher = () => {
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            applyTheme(option.getAttribute('data-theme'));
            document.getElementById('theme-menu').classList.add('hidden');
        });
    });
};

const setupLanguageSwitcher = () => {
    const langOptions = document.querySelectorAll('.language-option');
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            setLanguage(option.getAttribute('data-lang'));
            document.getElementById('language-menu').classList.add('hidden');
        });
    });
};

// --- MAIN INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    const repoName = window.location.pathname.split('/')[1];
    const basePath = `/${repoName}/`;

    await Promise.all([
        loadComponent(`${basePath}dashboard/components/header.html`, 'header-placeholder'),
        loadComponent(`${basePath}dashboard/components/footer.html`, 'footer-placeholder'),
        loadComponent(`${basePath}dashboard/components/sidebar.html`, 'sidebar-placeholder')
    ]);
    
    // Load switchers into the newly loaded header
    await Promise.all([
        loadComponent(`${basePath}dashboard/components/theme-switcher.html`, 'theme-switcher-placeholder'),
        loadComponent(`${basePath}dashboard/components/language-switcher.html`, 'language-switcher-placeholder')
    ]);

    // A small delay ensures components are rendered before attaching listeners
    setTimeout(() => {
        // Setup main dropdowns
        setupDropdown('theme-dropdown-container', 'theme-btn', 'theme-menu');
        setupDropdown('language-dropdown-container', 'language-btn', 'language-menu');
        setupDropdown('user-dropdown-container', 'user-btn', 'user-menu');

        // Setup functionality for the new switchers
        setupThemeSwitcher();
        setupLanguageSwitcher();

        // Restore saved theme and language
        const savedTheme = localStorage.getItem('theme') || 'theme-default';
        applyTheme(savedTheme);
        const savedLang = localStorage.getItem('language') || 'en';
        setLanguage(savedLang);

        // Setup logout
        const logoutButton = document.getElementById('logout-btn');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                signOut(auth);
            });
        }
    }, 200);

    // --- Page Specific Logic Router ---
    const path = window.location.pathname;
    if (path.endsWith('/dashboard/') || path.endsWith('/dashboard/index.html')) {
        loadComponent(`${basePath}dashboard/overview.html`, 'main-content');
    }
    // ... other page initializations
});

// Close all dropdowns if clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.absolute.z-50').forEach(menu => menu.classList.add('hidden'));
});

