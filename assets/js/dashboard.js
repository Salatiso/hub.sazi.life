// File: /assets/js/dashboard.js (Updated)

/*
  This file contains the shared JavaScript for the entire Sazi Ecosystem dashboard.
  It now includes logic for the Asset Hub pages.
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, query, onSnapshot, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// --- Component Loader & UI Setup (from previous turn, unchanged) ---
const loadComponent = async (componentPath, placeholderId) => { /* ... */ };
const setupDropdown = (containerId, buttonId, menuId) => { /* ... */ };
const setupThemeSwitcher = () => { /* ... */ };

// --- Main Initialization on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', async () => {
    // Component loading logic from previous turn...
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const depth = pathSegments.includes('dashboard') ? pathSegments.length - pathSegments.indexOf('dashboard') - 1 : 0;
    const pathPrefix = '../../'.repeat(depth); // Adjusted for deeper nesting

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

    // --- Page Specific Logic ---
    if (window.location.pathname.includes('/profile.html')) {
        initializeProfilePage();
    } else if (window.location.pathname.includes('/life-cv.html')) {
        initializeLifeCvPage();
    } else if (window.location.pathname.includes('/assets/')) {
        // New logic for asset pages
        initializeAssetPage();
    }
});


// --- Profile Page & LifeCV Page Logic (from previous turns, unchanged) ---
const initializeProfilePage = () => { /* ... */ };
const initializeLifeCvPage = () => { /* ... */ };


// --- NEW: Asset Hub Logic ---
const initializeAssetPage = () => {
    const assetForm = document.getElementById('asset-form');
    if (!assetForm) return; // Only run on editor pages

    const urlParams = new URLSearchParams(window.location.search);
    const assetType = window.location.pathname.split('/').slice(-2, -1)[0]; // e.g., 'properties'
    const assetId = urlParams.get('id');
    const isNew = urlParams.get('type') === 'new';

    const messageDiv = document.getElementById('asset-message');
    const pageTitleEl = document.getElementById('page-title');
    const pageSubtitleEl = document.getElementById('page-subtitle');
    
    // Dynamically set titles based on asset type
    const assetTitle = assetType.charAt(0).toUpperCase() + assetType.slice(1, -1); // "Properties" -> "Property"
    if(pageTitleEl) pageTitleEl.textContent = isNew ? `Add New ${assetTitle}` : `Edit ${assetTitle}`;
    if(pageSubtitleEl) pageSubtitleEl.textContent = `Manage your ${assetType} records.`;


    const showAssetMessage = (message, isError = false) => {
        if (!messageDiv) return;
        messageDiv.textContent = message;
        messageDiv.className = `p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        messageDiv.classList.remove('hidden');
        setTimeout(() => messageDiv.classList.add('hidden'), 3000);
    };

    // 1. Fetch data if we are editing an existing asset
    onAuthStateChanged(auth, async (user) => {
        if (user && !isNew && assetId) {
            const assetRef = doc(db, "users", user.uid, "assets", assetType, assetId);
            try {
                const docSnap = await getDoc(assetRef);
                if (docSnap.exists()) {
                    const assetData = docSnap.data();
                    // Populate the form fields. This needs to be specific for each asset type.
                    // Example for a property:
                    document.getElementById('asset-name').value = assetData.assetName || '';
                    // ... populate other fields ...
                } else {
                    showAssetMessage("Asset not found.", true);
                }
            } catch (error) {
                console.error("Error fetching asset:", error);
                showAssetMessage("Could not load asset data.", true);
            }
        }
    });

    // 2. Handle form submission to save asset data
    assetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            showAssetMessage("You must be logged in.", true);
            return;
        }

        // Collect data from form - this would be more dynamic in a real app
        const assetData = {
            assetName: document.getElementById('asset-name').value,
            assetType: document.getElementById('asset-type')?.value || assetTitle, // Fallback
            // ... collect all other private fields
            publicData: {
                isPublic: false, // Default
                headline: document.getElementById('public-headline').value,
                price: parseFloat(document.getElementById('public-price').value) || 0,
                description: document.getElementById('public-description').value,
            },
            lastUpdated: serverTimestamp()
        };

        try {
            // This logic would need to handle both creating new and updating existing assets
            const collectionRef = collection(db, "users", user.uid, "assets", assetType);
            await addDoc(collectionRef, assetData); // Simplified to just add for now
            showAssetMessage(`${assetTitle} saved successfully!`);
            assetForm.reset();
        } catch (error) {
            console.error("Error saving asset:", error);
            showAssetMessage(`Failed to save ${assetTitle}. Please try again.`, true);
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
                                <input type="text" id="asset-name" class="input-field w-full mt-1" placeholder="e.g., My Main Home">
                            </div>
                            <div>
                                <label for="asset-type" class="block text-sm font-medium text-secondary">Property Type</label>
                                <input type="text" id="asset-type" class="input-field w-full mt-1" placeholder="e.g., House, Apartment">
                            </div>
                            <div>
                                <label for="asset-purchase-date" class="block text-sm font-medium text-secondary">Purchase Date</label>
                                <input type="date" id="asset-purchase-date" class="input-field w-full mt-1">
                            </div>
                            <div>
                                <label for="asset-purchase-price" class="block text-sm font-medium text-secondary">Purchase Price (R)</label>
                                <input type="number" id="asset-purchase-price" class="input-field w-full mt-1">
                            </div>
                             <div class="md:col-span-2">
                                <label for="asset-deed-info" class="block text-sm font-medium text-secondary">Deed / Legal Info</label>
                                <textarea id="asset-deed-info" rows="2" class="input-field w-full mt-1" placeholder="Deeds Office Ref: T12345/2020"></textarea>
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
                                <input type="text" id="public-headline" class="input-field w-full mt-1" placeholder="e.g., Spacious 3-Bedroom House for Sale">
                            </div>
                             <div>
                                <label for="public-price" class="block text-sm font-medium text-secondary">Sale/Rental Price (R)</label>
                                <input type="number" id="public-price" class="input-field w-full mt-1">
                            </div>
                            <div>
                                <label for="public-description" class="block text-sm font-medium text-secondary">Public Description</label>
                                <textarea id="public-description" rows="4" class="input-field w-full mt-1" placeholder="A beautiful family home with a large garden..."></textarea>
                            </div>
                            <div>
                                <label for="public-photos" class="block text-sm font-medium text-secondary">Upload Photos</label>
                                <input type="file" id="public-photos" multiple class="input-field w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-color/10 file:text-accent-color hover:file:bg-accent-color/20">
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
    <script>
        // This page-specific script is now minimal, as the core logic is handled by initializeAssetPage() in dashboard.js
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                // The title is now set dynamically inside dashboard.js
            }, 100);
        });
    </script>
</body>
</html>
