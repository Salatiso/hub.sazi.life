// File: /assets/js/dashboard.js (Cleaned)

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
    if (!placeholder) return;
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Failed to load component: ${componentPath}`);
        const componentHTML = await response.text();
        placeholder.innerHTML = componentHTML;
    } catch (error) {
        console.error(error);
        placeholder.innerHTML = `<p class="text-red-500">Error loading ${placeholderId}.</p>`;
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
    const pathPrefix = '../'.repeat(depth) || './'; // Fallback for root

    // Load components and setup UI
    try {
        await Promise.all([
            loadComponent(`${pathPrefix}components/header.html`, 'header-placeholder'),
            loadComponent(`${pathPrefix}components/footer.html`, 'footer-placeholder'),
        ]);
        // These might be inside the header, so wait for it to load
        await Promise.all([
            loadComponent(`${pathPrefix}components/language-switcher.html`, 'language-switcher-placeholder'),
            loadComponent(`${pathPrefix}components/theme-switcher.html`, 'theme-switcher-placeholder')
        ]);

        setupDropdown('ecosystem-dropdown-container', 'ecosystem-btn', 'ecosystem-menu');
        setupDropdown('language-dropdown-container', 'language-btn', 'language-menu');
        setupThemeSwitcher();

        const logoutButton = document.getElementById('logout-btn');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => signOut(auth));
        }
    } catch (error) {
        console.error("Error setting up base UI:", error);
    }

    // --- Page Specific Logic Router ---
    const path = window.location.pathname;
    if (path.includes('/profile.html')) initializeProfilePage();
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

function initializeProfilePage() {
    console.log("Profile page initialized.");
    // Add your profile page specific logic here
};

function initializeLifeCvPage() {
    console.log("LifeCV page initialized.");
    // Add your LifeCV page specific logic here
};

function initializeAssetsIndexPage() {
    onAuthStateChanged(auth, user => {
        if (user) {
            console.log("Asset Index Page Initialized for user:", user.uid);
            // Logic to fetch and display lists of assets
        }
    });
};

function initializeAssetEditorPage(assetType) {
    const assetForm = document.getElementById('asset-form');
    if (!assetForm) return;

    const urlParams = new URLSearchParams(window.location.search);
    const assetId = urlParams.get('id');
    const isNew = !assetId;

    const assetTitle = assetType.charAt(0).toUpperCase() + assetType.slice(1, -1);
    // Note: These title elements might not exist on all pages, check for them.
    const pageTitleEl = document.getElementById('page-title');
    const pageSubtitleEl = document.getElementById('page-subtitle');
    if (pageTitleEl) pageTitleEl.textContent = isNew ? `Add New ${assetTitle}` : `Edit ${assetTitle}`;
    if (pageSubtitleEl) pageSubtitleEl.textContent = `Manage your ${assetType} records.`;

    onAuthStateChanged(auth, async (user) => {
        if (user && !isNew) {
            const assetRef = doc(db, "users", user.uid, "assets", assetType, assetId);
            const docSnap = await getDoc(assetRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                assetForm['asset-name'].value = data.assetName || '';
                // Populate other form fields...
            }
        }
    });

    assetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return showMessage('asset-message', "You must be logged in.", true);

        const assetData = {
            assetName: assetForm['asset-name'].value,
            assetType: assetForm['asset-type']?.value || assetTitle,
            purchaseDate: assetForm['asset-purchase-date']?.value || '',
            purchasePrice: parseFloat(assetForm['asset-purchase-price']?.value) || 0,
            deedInfo: assetForm['asset-deed-info']?.value || '',
            publicData: {
                isPublic: false,
                headline: assetForm['public-headline'].value,
                price: parseFloat(assetForm['public-price'].value) || 0,
                description: assetForm['public-description'].value,
            },
            lastUpdated: serverTimestamp()
        };

        try {
            let docRef;
            if (isNew) {
                const collectionRef = collection(db, "users", user.uid, "assets", assetType);
                docRef = await addDoc(collectionRef, assetData);
            } else {
                docRef = doc(db, "users", user.uid, "assets", assetType, assetId);
                await updateDoc(docRef, assetData);
            }
            showMessage('asset-message', `${assetTitle} saved successfully!`);
        } catch (error) {
            console.error(`Error saving ${assetTitle}:`, error);
            showMessage('asset-message', `Failed to save ${assetTitle}.`, true);
        }
    });
};

function initializePublicPagesIndex() {
    console.log("Public Pages Index initialized.");
    // Logic to fetch and display a list of the user's created public pages
};

function initializePublicPageEditor() {
    const publicPageForm = document.getElementById('public-page-form');
    if (!publicPageForm) return;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const assetsContainer = document.getElementById('assets-checklist');
            if (!assetsContainer) return;
            const assetTypes = ['properties', 'vehicles', 'companies'];
            assetsContainer.innerHTML = ''; // Clear

            for (const type of assetTypes) {
                const q = query(collection(db, "users", user.uid, "assets", type));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    const asset = doc.data();
                    const label = document.createElement('label');
                    label.className = 'flex items-center p-3 bg-slate-700/50 rounded-lg';
                    label.innerHTML = `
                        <input type="checkbox" class="h-5 w-5 rounded text-accent-color focus:ring-accent-color" value="${type}/${doc.id}">
                        <span class="ml-3 font-semibold">${asset.assetName} <span class="text-xs text-secondary">(${type.slice(0,-1)})</span></span>
                    `;
                    assetsContainer.appendChild(label);
                });
            }
        }
    });

    publicPageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return showMessage('public-page-message', "You must be logged in.", true);

        const linkedAssets = Array.from(publicPageForm.querySelectorAll('input[type=checkbox]:checked'))
                                  .map(cb => cb.value);

        const pageData = {
            pageTitle: publicPageForm['page-title-input'].value,
            pageUrl: publicPageForm['page-url'].value,
            templateId: publicPageForm['template'].value,
            linkedAssets: linkedAssets,
            ownerId: user.uid,
            lastUpdated: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "publicPages"), pageData);
            showMessage('public-page-message', "Public page saved successfully!");
        } catch (error) {
            console.error("Error saving public page:", error);
            showMessage('public-page-message', "Failed to save public page.", true);
        }
    });
};
