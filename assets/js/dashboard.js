// File: /assets/js/dashboard.js (Updated)

/*
  This file contains the shared JavaScript for the entire Sazi Ecosystem dashboard.
  It handles Firebase initialization, authentication, component loading, and now,
  data interaction for the profile page.
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// --- Component Loader ---
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

// --- Dropdown Logic ---
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

// --- Theme Switcher Logic ---
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
    // Determine base path for components based on current page depth
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const depth = pathSegments.includes('dashboard') ? pathSegments.length - pathSegments.indexOf('dashboard') - 1 : 0;
    const pathPrefix = '../'.repeat(depth);

    await Promise.all([
        loadComponent(`${pathPrefix}components/header.html`, 'header-placeholder'),
        loadComponent(`${pathPrefix}components/footer.html`, 'footer-placeholder'),
    ]);
    
    // These placeholders are inside the loaded header, so we load them after.
    await Promise.all([
        loadComponent(`${pathPrefix}components/language-switcher.html`, 'language-switcher-placeholder'),
        loadComponent(`${pathPrefix}components/theme-switcher.html`, 'theme-switcher-placeholder')
    ]);

    setupDropdown('ecosystem-dropdown-container', 'ecosystem-btn', 'ecosystem-menu');
    setupDropdown('language-dropdown-container', 'language-btn', 'language-menu');
    setupThemeSwitcher();

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            signOut(auth).catch((error) => console.error('Logout Error:', error));
        });
    }

    // --- Page Specific Logic ---
    // This checks which page we are on and runs the relevant functions.
    if (window.location.pathname.includes('/profile.html')) {
        initializeProfilePage();
    }
});


// --- Profile Page Logic ---
const initializeProfilePage = () => {
    const profileForm = document.getElementById('profile-form');
    if (!profileForm) return; // Exit if the form isn't on the page

    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const messageDiv = document.getElementById('profile-message');

    const showProfileMessage = (message, isError = false) => {
        if (!messageDiv) return;
        messageDiv.textContent = message;
        messageDiv.className = `text-center p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        messageDiv.classList.remove('hidden');
    };

    // 1. Fetch and populate user data on page load
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            try {
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if(nameInput) nameInput.value = userData.name || '';
                    if(emailInput) emailInput.value = userData.email || user.email; // Fallback to auth email
                } else {
                    // If no doc, populate with what we have from auth
                    if(nameInput) nameInput.value = user.displayName || '';
                    if(emailInput) emailInput.value = user.email;
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                showProfileMessage("Could not load your profile data.", true);
            }
        } else {
            // This should be handled by the main auth listener, but as a fallback:
            window.location.href = '/login.html';
        }
    });

    // 2. Handle form submission to save data
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            showProfileMessage("You are not logged in.", true);
            return;
        }

        const userRef = doc(db, "users", user.uid);
        const dataToSave = {
            name: nameInput.value,
            email: emailInput.value // Keep email in doc for consistency
        };

        try {
            await setDoc(userRef, dataToSave, { merge: true }); // Use merge to avoid overwriting other fields
            showProfileMessage("Profile saved successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            showProfileMessage("Failed to save profile. Please try again.", true);
        }
    });
};
```html
<!-- File: /dashboard/profile.html (Updated) -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title>My Profile - Sazi Ecosystem</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
    <link rel="stylesheet" href="[https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css)">
    <link href="[https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Poppins:wght@600;700&display=swap](https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Poppins:wght@600;700&display=swap)" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/dashboard-styles.css">
</head>
<body class="flex h-screen bg-main text-primary">
    <!-- Sidebar -->
    <aside class="sidebar w-64 flex-shrink-0 flex flex-col p-4">
        <div class="flex items-center space-x-3 mb-8">
            <svg class="sazi-logo-svg" viewBox="0 0 100 100" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path d="M 85,15 C 85,45 65,45 50,50 C 35,55 15,55 15,85" stroke="#D97706" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M 15,15 C 15,45 35,45 50,50 C 65,55 85,55 85,85" stroke="#0EA5E9" stroke-width="16" fill="none" stroke-linecap="round"/></svg>
            <span class="font-poppins font-bold text-xl">sazi.life</span>
        </div>
        <nav class="flex-grow space-y-2">
            <a href="index.html" class="sidebar-link flex items-center space-x-3 py-2 px-3 rounded-lg"><i class="fas fa-home"></i><span>Dashboard</span></a>
            <a href="life-cv.html" class="sidebar-link flex items-center space-x-3 py-2 px-3 rounded-lg"><i class="fas fa-id-card"></i><span>LifeCV</span></a>
            <a href="assets/index.html" class="sidebar-link flex items-center space-x-3 py-2 px-3 rounded-lg"><i class="fas fa-briefcase"></i><span>Assets & Companies</span></a>
            <a href="training/index.html" class="sidebar-link flex items-center space-x-3 py-2 px-3 rounded-lg"><i class="fas fa-chalkboard-teacher"></i><span>Training Hub</span></a>
            <a href="public-pages/index.html" class="sidebar-link flex items-center space-x-3 py-2 px-3 rounded-lg"><i class="fas fa-bullhorn"></i><span>Public Pages</span></a>
        </nav>
        <div class="mt-auto">
            <a href="settings.html" class="sidebar-link flex items-center space-x-3 py-2 px-3 rounded-lg"><i class="fas fa-cog"></i><span>Settings</span></a>
            <button id="logout-btn" class="sidebar-link w-full text-left flex items-center space-x-3 py-2 px-3 rounded-lg mt-2"><i class="fas fa-sign-out-alt"></i><span>Logout</span></button>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col p-8 overflow-y-auto">
        <div id="header-placeholder"></div>
        
        <div class="flex-grow">
            <div class="card p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
                <div id="profile-message" class="hidden"></div> <!-- Message area for feedback -->
                <form id="profile-form" class="space-y-4">
                    <div>
                        <label for="profile-name" class="block text-sm font-medium text-secondary">Full Name</label>
                        <input type="text" id="profile-name" class="input-field w-full mt-1" placeholder="Loading...">
                    </div>
                    <div>
                        <label for="profile-email" class="block text-sm font-medium text-secondary">Email Address</label>
                        <input type="email" id="profile-email" class="input-field w-full mt-1" disabled placeholder="Loading...">
                         <p class="text-xs text-secondary mt-1">Email cannot be changed.</p>
                    </div>
                    <!-- Add other profile fields here as needed -->
                    <div class="flex justify-end pt-4">
                        <button type="submit" class="btn-primary">Save Profile</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="footer-placeholder"></div>
    </main>
    
    <script type="module" src="../assets/js/dashboard.js"></script>
    <script>
        // This script is now minimal because the core logic is in dashboard.js
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                // Set page-specific titles after header loads
                const pageTitle = document.getElementById('page-title');
                const pageSubtitle = document.getElementById('page-subtitle');
                if(pageTitle) pageTitle.textContent = 'My Profile';
                if(pageSubtitle) pageSubtitle.textContent = 'Manage your personal information for the Sazi Ecosystem.';
            }, 100);
        });
    </script>
</body>
</html>
