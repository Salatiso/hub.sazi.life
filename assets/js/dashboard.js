// File: /assets/js/dashboard.js (Updated)

/*
  This file contains the shared JavaScript for the entire Sazi Ecosystem dashboard.
  It now includes logic for the LifeCV page.
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
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const depth = pathSegments.includes('dashboard') ? pathSegments.length - pathSegments.indexOf('dashboard') - 1 : 0;
    const pathPrefix = '../'.repeat(depth);

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
    }
});


// --- Profile Page Logic (from previous turn, unchanged) ---
const initializeProfilePage = () => {
    // ... logic from previous turn
};


// --- NEW: LifeCV Page Logic ---
const initializeLifeCvPage = () => {
    const addEntryForm = document.getElementById('add-entry-form');
    const entriesContainer = document.getElementById('lifecv-entries');
    const messageDiv = document.getElementById('lifecv-message');

    if (!addEntryForm || !entriesContainer) return;

    const showLifeCvMessage = (message, isError = false) => {
        if (!messageDiv) return;
        messageDiv.textContent = message;
        messageDiv.className = `p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        messageDiv.classList.remove('hidden');
        setTimeout(() => messageDiv.classList.add('hidden'), 3000); // Hide after 3 seconds
    };

    // 1. Listen for real-time updates to LifeCV entries
    onAuthStateChanged(auth, user => {
        if (user) {
            const entriesRef = collection(db, "life_cvs", user.uid, "entries");
            const q = query(entriesRef, orderBy("createdAt", "desc")); // Order by most recent

            onSnapshot(q, (querySnapshot) => {
                if (querySnapshot.empty) {
                    entriesContainer.innerHTML = `<div class="text-center text-secondary p-8"><i class="fas fa-folder-open text-4xl mb-4"></i><p>Your LifeCV is empty.</p><p>Add your first entry using the form on the right.</p></div>`;
                    return;
                }
                
                entriesContainer.innerHTML = ''; // Clear existing entries
                querySnapshot.forEach((doc) => {
                    const entry = doc.data();
                    const entryEl = document.createElement('div');
                    entryEl.className = 'border border-input-border p-4 rounded-lg';
                    
                    let accentColor = 'text-sky-400';
                    if (entry.type === 'Portfolio') accentColor = 'text-orange-400';
                    if (entry.type === 'Experience') accentColor = 'text-green-400';
                    if (entry.type === 'Education') accentColor = 'text-purple-400';
                    if (entry.type === 'Contribution') accentColor = 'text-pink-400';


                    entryEl.innerHTML = `
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="text-xs font-semibold uppercase tracking-wider ${accentColor}">${entry.type || 'Entry'}</span>
                                <p class="font-bold text-lg">${entry.title}</p>
                                <p class="text-sm text-secondary">${entry.description}</p>
                                ${entry.sourcePlatform ? `<p class="text-xs text-secondary mt-1">Source: ${entry.sourcePlatform}</p>` : ''}
                            </div>
                            <div class="flex space-x-2 text-secondary">
                                <button class="hover:text-primary" title="Edit"><i class="fas fa-pencil-alt"></i></button>
                                <button class="hover:text-red-500" title="Delete"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    entriesContainer.appendChild(entryEl);
                });
            });
        }
    });

    // 2. Handle form submission to add a new manual entry
    addEntryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            showLifeCvMessage("You must be logged in to add an entry.", true);
            return;
        }

        const entryData = {
            type: addEntryForm['entry-type'].value,
            title: addEntryForm['entry-title'].value,
            description: addEntryForm['entry-description'].value,
            sourcePlatform: 'Manual Entry',
            createdAt: serverTimestamp() // Use server timestamp for consistency
        };

        if (!entryData.title || !entryData.description) {
            showLifeCvMessage("Title and Description are required.", true);
            return;
        }

        try {
            const entriesRef = collection(db, "life_cvs", user.uid, "entries");
            await addDoc(entriesRef, entryData);
            showLifeCvMessage("Entry added successfully!");
            addEntryForm.reset(); // Clear the form
        } catch (error) {
            console.error("Error adding document: ", error);
            showLifeCvMessage("Failed to add entry. Please try again.", true);
        }
    });
};
```html
<!-- File: /dashboard/life-cv.html (Updated) -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LifeCV - Sazi Ecosystem Dashboard</title>
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
            <a href="life-cv.html" class="sidebar-link active flex items-center space-x-3 py-2 px-3 rounded-lg"><i class="fas fa-id-card"></i><span>LifeCV</span></a>
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
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Main Column -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="card p-6 rounded-xl shadow-lg">
                        <div class="flex justify-between items-center mb-4">
                             <h2 class="text-xl font-bold">LifeCV Entries</h2>
                             <div class="flex items-center space-x-2">
                                <button class="btn-secondary text-xs"><i class="fas fa-upload mr-2"></i>Upload CV</button>
                                <button class="btn-primary text-xs"><i class="fas fa-download mr-2"></i>Download as PDF</button>
                            </div>
                        </div>
                        <p class="text-sm text-secondary mb-4">This section automatically populates with your achievements from across the Sazi Ecosystem. You can also add manual entries.</p>
                        
                        <div id="lifecv-entries" class="space-y-4">
                            <!-- Dynamic entries will be loaded here by JavaScript -->
                            <div class="text-center text-secondary p-8"><i class="fas fa-spinner fa-spin text-4xl"></i><p class="mt-4">Loading LifeCV entries...</p></div>
                        </div>
                    </div>
                </div>

                <!-- Side Column -->
                <div class="space-y-6">
                    <div class="card p-6 rounded-xl shadow-lg">
                        <h2 class="text-xl font-bold mb-4">Add Manual Entry</h2>
                        <div id="lifecv-message" class="hidden"></div> <!-- Message area for feedback -->
                        <form id="add-entry-form" class="space-y-4">
                            <div>
                                <label for="entry-type" class="block text-sm font-medium text-secondary">Entry Type</label>
                                <select id="entry-type" class="input-field w-full mt-1">
                                    <option>Experience</option>
                                    <option>Skill</option>
                                    <option>Education</option>
                                    <option>Portfolio</option>
                                    <option>Contribution</option>
                                </select>
                            </div>
                            <div>
                                <label for="entry-title" class="block text-sm font-medium text-secondary">Title</label>
                                <input type="text" id="entry-title" class="input-field w-full mt-1" placeholder="e.g., Project Manager" required>
                            </div>
                            <div>
                                <label for="entry-description" class="block text-sm font-medium text-secondary">Description</label>
                                <textarea id="entry-description" rows="3" class="input-field w-full mt-1" placeholder="Describe your achievement..." required></textarea>
                            </div>
                            <button type="submit" class="btn-primary w-full">Add to LifeCV</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div id="footer-placeholder"></div>
    </main>
    
    <script type="module" src="../assets/js/dashboard.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const pageTitle = document.getElementById('page-title');
                const pageSubtitle = document.getElementById('page-subtitle');
                if(pageTitle) pageTitle.textContent = 'My LifeCV';
                if(pageSubtitle) pageSubtitle.textContent = 'Your dynamic, holistic portfolio of skills and experiences.';
            }, 100);
        });
    </script>
</body>
</html>
