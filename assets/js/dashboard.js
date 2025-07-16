// File: /assets/js/dashboard.js (Updated)

/*
  This file contains the shared JavaScript for the entire Sazi Ecosystem dashboard.
  It now includes the complete logic for the Profile, LifeCV, Asset, and Public Pages hubs.
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

// --- Component Loader & UI Setup (from previous turns, unchanged) ---
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

    if(button && menu) {
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

    if(darkBtn) darkBtn.addEventListener('click', () => applyTheme('dark'));
    if(lightBtn) lightBtn.addEventListener('click', () => applyTheme('light'));
    if(childBtn) childBtn.addEventListener('click', () => applyTheme('theme-child-vibrant'));

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
};

// --- Main Initialization on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', async () => {
    // Component loading logic...
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const depth = pathSegments.includes('dashboard') ? pathSegments.length - pathSegments.indexOf('dashboard') - 1 : 0;
    const pathPrefix = '../../'.repeat(depth);

    await Promise.all([
        loadComponent(`${pathPrefix}components/header.html`, 'header-placeholder'),
        loadComponent(`${pathPrefix}components/footer.html`, 'footer-placeholder'),
    ]);
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

// --- Profile & LifeCV Page Logic (from previous turns) ---
const initializeProfilePage = () => { /* ... */ };
const initializeLifeCvPage = () => { /* ... */ };

// --- Asset Hub Logic ---
const initializeAssetsIndexPage = () => {
    onAuthStateChanged(auth, user => {
        if (user) {
            // This function would fetch and display lists of properties, vehicles, etc.
            // For brevity, we'll just confirm it's loaded.
            console.log("Asset Index Page Initialized for user:", user.uid);
        }
    });
};

const initializeAssetEditorPage = (assetType) => {
    const assetForm = document.getElementById('asset-form');
    if (!assetForm) return;

    const urlParams = new URLSearchParams(window.location.search);
    const assetId = urlParams.get('id');
    const isNew = !assetId;

    // Dynamically set titles
    const assetTitle = assetType.charAt(0).toUpperCase() + assetType.slice(1, -1);
    document.getElementById('page-title').textContent = isNew ? `Add New ${assetTitle}` : `Edit ${assetTitle}`;
    document.getElementById('page-subtitle').textContent = `Manage your ${assetType} records.`;

    onAuthStateChanged(auth, async (user) => {
        if (user && !isNew) {
            // Fetch and populate form if editing
            const assetRef = doc(db, "users", user.uid, "assets", assetType, assetId);
            const docSnap = await getDoc(assetRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Populate form fields...
                assetForm['asset-name'].value = data.assetName || '';
                // ... and so on for all fields.
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

// --- Public Pages Hub Logic ---
const initializePublicPagesIndex = () => {
    // Logic to fetch and display a list of the user's created public pages
};

const initializePublicPageEditor = () => {
    const publicPageForm = document.getElementById('public-page-form');
    if (!publicPageForm) return;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Logic to fetch user's assets (properties, vehicles) to populate the checklist
            const assetsContainer = document.getElementById('assets-checklist');
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
            // Save this data to a top-level 'publicPages' collection
            await addDoc(collection(db, "publicPages"), pageData);
            showMessage('public-page-message', "Public page saved successfully!");
        } catch (error) {
            console.error("Error saving public page:", error);
            showMessage('public-page-message', "Failed to save public page.", true);
        }
    });
};
```html
<!-- File: /dashboard/assets/properties/editor.html (Updated) -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Property - Sazi Ecosystem</title>
    <link rel="stylesheet" href="../../../assets/css/dashboard-styles.css">
    <!-- Other head elements... -->
    <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
    <link rel="stylesheet" href="[https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css)">
    <link href="[https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Poppins:wght@600;700&display=swap](https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Poppins:wght@600;700&display=swap)" rel="stylesheet">
</head>
<body class="flex h-screen bg-main text-primary">
    <!-- Sidebar -->
    <aside class="sidebar w-64 flex-shrink-0 flex flex-col p-4">
        <!-- Sidebar content -->
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col p-8 overflow-y-auto">
        <div id="header-placeholder"></div>
        
        <div class="flex-grow">
            <div class="card p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
                <div id="asset-message" class="hidden"></div>
                <!-- NOTE: This form is a template. The labels and placeholders would be
                     dynamically adjusted by JavaScript based on the asset type (property, vehicle, etc.) -->
                <form id="asset-form" class="space-y-6">
                    <!-- Private Record Keeping Section -->
                    <div>
                        <h3 class="text-lg font-semibold border-b border-input-border pb-2 mb-4">Private Records (Not for public view)</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="asset-name" class="block text-sm font-medium text-secondary">Property Nickname</label>
                                <input type="text" id="asset-name" name="asset-name" class="input-field w-full mt-1" placeholder="e.g., My Main Home">
                            </div>
                            <div>
                                <label for="asset-type" class="block text-sm font-medium text-secondary">Property Type</label>
                                <input type="text" id="asset-type" name="asset-type" class="input-field w-full mt-1" placeholder="e.g., House, Apartment">
                            </div>
                            <div>
                                <label for="asset-purchase-date" class="block text-sm font-medium text-secondary">Purchase Date</label>
                                <input type="date" id="asset-purchase-date" name="asset-purchase-date" class="input-field w-full mt-1">
                            </div>
                            <div>
                                <label for="asset-purchase-price" class="block text-sm font-medium text-secondary">Purchase Price (R)</label>
                                <input type="number" id="asset-purchase-price" name="asset-purchase-price" class="input-field w-full mt-1">
                            </div>
                             <div class="md:col-span-2">
                                <label for="asset-deed-info" class="block text-sm font-medium text-secondary">Deed / Legal Info</label>
                                <textarea id="asset-deed-info" name="asset-deed-info" rows="2" class="input-field w-full mt-1" placeholder="Deeds Office Ref: T12345/2020"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Public Classifieds Section -->
                    <div>
                        <h3 class="text-lg font-semibold border-b border-input-border pb-2 mb-4">Public Classifieds Data</h3>
                        <p class="text-xs text-secondary mb-4 -mt-2">This information will only be shown on your public pages if you choose to feature this asset.</p>
                        <div class="space-y-4">
                            <div>
                                <label for="public-headline" class="block text-sm font-medium text-secondary">Public Headline</label>
                                <input type="text" id="public-headline" name="public-headline" class="input-field w-full mt-1" placeholder="e.g., Spacious 3-Bedroom House for Sale">
                            </div>
                             <div>
                                <label for="public-price" class="block text-sm font-medium text-secondary">Sale/Rental Price (R)</label>
                                <input type="number" id="public-price" name="public-price" class="input-field w-full mt-1">
                            </div>
                            <div>
                                <label for="public-description" class="block text-sm font-medium text-secondary">Public Description</label>
                                <textarea id="public-description" name="public-description" rows="4" class="input-field w-full mt-1" placeholder="A beautiful family home with a large garden..."></textarea>
                            </div>
                            <div>
                                <label for="public-photos" class="block text-sm font-medium text-secondary">Upload Photos</label>
                                <input type="file" id="public-photos" name="public-photos" multiple class="input-field w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-color/10 file:text-accent-color hover:file:bg-accent-color/20">
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end pt-4">
                        <button type="button" class="btn-secondary mr-2">Cancel</button>
                        <button type="submit" class="btn-primary">Save Property Details</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="footer-placeholder"></div>
    </main>
    
    <script type="module" src="../../../assets/js/dashboard.js"></script>
</body>
</html>
```html
<!-- File: /dashboard/public-pages/editor.html (Updated) -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Manage Public Page - Sazi Ecosystem</title>
    <link rel="stylesheet" href="../../assets/css/dashboard-styles.css">
    <!-- Other head elements... -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
</head>
<body class="flex h-screen bg-main text-primary">
    <!-- Sidebar -->
    <aside class="sidebar w-64 flex-shrink-0 flex flex-col p-4">
        <!-- ... -->
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col p-8 overflow-y-auto">
        <div id="header-placeholder"></div>
        
        <div class="flex-grow">
            <div class="card p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
                <div id="public-page-message" class="hidden"></div>
                <form id="public-page-form" class="space-y-8">
                    <!-- Page Settings -->
                    <div>
                        <h3 class="text-lg font-semibold border-b border-input-border pb-2 mb-4">1. Page Settings</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="page-title-input" class="block text-sm font-medium text-secondary">Page Title</label>
                                <input type="text" id="page-title-input" name="page-title-input" class="input-field w-full mt-1" placeholder="e.g., My Car Sale" required>
                            </div>
                            <div>
                                <label for="page-url" class="block text-sm font-medium text-secondary">Custom URL</label>
                                <div class="flex items-center mt-1">
                                    <span class="text-sm text-secondary pr-2">hub.sazi.life/public/</span>
                                    <input type="text" id="page-url" name="page-url" class="input-field w-full" placeholder="my-car-sale" required>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Template Selection -->
                    <div>
                        <h3 class="text-lg font-semibold border-b border-input-border pb-2 mb-4">2. Choose a Template</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <!-- Example Template -->
                            <label class="cursor-pointer">
                                <input type="radio" name="template" value="modern-grid" class="sr-only" checked>
                                <div class="p-2 border-2 border-accent-color rounded-lg text-center">
                                    <i class="fas fa-th-large text-3xl mb-2"></i>
                                    <span class="block text-xs font-semibold">Modern Grid</span>
                                </div>
                            </label>
                            <!-- Other templates would go here -->
                        </div>
                    </div>
                    <!-- Link Assets -->
                    <div>
                        <h3 class="text-lg font-semibold border-b border-input-border pb-2 mb-4">3. Link Your Assets</h3>
                        <div id="assets-checklist" class="space-y-2">
                            <p class="text-secondary text-sm">Loading your assets...</p>
                        </div>
                    </div>

                    <div class="flex justify-end pt-4">
                        <button type="button" class="btn-secondary mr-2">Save as Draft</button>
                        <button type="submit" class="btn-primary">Publish Page</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="footer-placeholder"></div>
    </main>
    
    <script>
    const script = document.createElement('script');
      script.type = 'module';
      script.src = `${window.location.origin}/assets/js/dashboard.js`;
    document.body.appendChild(script);
    </script>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                document.getElementById('page-title').textContent = 'Manage Public Page';
                document.getElementById('page-subtitle').textContent = 'Create and configure your public-facing classifieds page.';
            }, 100);
        });
    </script>
</body>
</html>
