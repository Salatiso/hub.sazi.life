// assets/js/dashboard.js

// NOTE: Requires Firebase SDK v10+ and Firestore.
// All UI elements are controlled via DOM selectors, and the html must have element IDs that match these (e.g., #header, #footer, #main-content).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut,
  GoogleAuthProvider, signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Replace with your project's Firebase config
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

// Utility: Show messages in main content area
function showMessage(msg, isError = false) {
  const el = document.getElementById("dashboard-message");
  if (el) {
    el.textContent = msg;
    el.className = `my-3 p-2 rounded ${isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`;
    el.style.display = "block";
    setTimeout(() => { el.style.display = "none"; }, 4000);
  }
}

// Guard: Require Auth, else redirect to login
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/index.html";
  } else {
    await loadUserData(user);
    loadHeaderFooter();
    setupNavigation();
    loadDashboardHome();
  }
});

// Load User Data (for header, profile, quick access)
async function loadUserData(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || 'New User',
      email: user.email,
      lastLogin: new Date(),
    }, { merge: true });
  }
  // Optionally update UI with user info here.
}

// Dynamic loading for header/footer
function loadHeaderFooter() {
  if (document.getElementById("header")) {
    document.getElementById("header").innerHTML = `
      <nav class="bg-white px-6 py-3 flex justify-between items-center shadow-sm">
        <span class="font-bold text-blue-700 text-lg">Sazi Ecosystem</span>
        <div class="flex gap-3 items-center">
          <button id="theme-btn" title="Switch Theme" class="hover:text-blue-500"><i class="fas fa-adjust"></i></button>
          <button id="signout-btn" class="text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-200"><i class="fas fa-sign-out-alt"></i> Sign out</button>
        </div>
      </nav>
    `;
    document.getElementById("theme-btn").onclick = toggleTheme;
    document.getElementById("signout-btn").onclick = () => signOut(auth);
  }
  if (document.getElementById("footer")) {
    document.getElementById("footer").innerHTML = `
      <footer class="bg-gray-50 py-5 text-center text-gray-400 text-xs">
        &copy; ${(new Date()).getFullYear()} Sazi Ecosystem.
      </footer>
    `;
  }
}

// Theme Toggle: light/dark
function toggleTheme() {
  document.body.classList.toggle("dark");
  const html = document.documentElement;
  if (html.classList.contains("dark")) {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
}

// On load: apply theme
(function applySavedTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
})();

// Navigation
function setupNavigation() {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.onclick = evt => {
      evt.preventDefault();
      loadPage(btn.getAttribute("data-nav"));
    };
  });
}

// Core routes/pages
function loadPage(page) {
  const main = document.getElementById("main-content");
  main.innerHTML = "<div class='py-8 text-center text-gray-400'>Loading...</div>";
  switch (page) {
    case "profile":
      loadProfile();
      break;
    case "assets":
      loadAssets();
      break;
    case "public":
      loadPublicEditor();
      break;
    default:
      loadDashboardHome();
      break;
  }
}

// Dashboard home view
function loadDashboardHome() {
  const main = document.getElementById("main-content");
  main.innerHTML = `
    <h2 class="font-bold text-xl mb-2">Dashboard</h2>
    <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <li><a href="#" data-nav="profile" class="block p-4 rounded bg-blue-50 hover:bg-blue-100">Profile</a></li>
      <li><a href="#" data-nav="assets" class="block p-4 rounded bg-green-50 hover:bg-green-100">Assets Manager</a></li>
      <li><a href="#" data-nav="public" class="block p-4 rounded bg-yellow-50 hover:bg-yellow-100">Public Page Editor</a></li>
    </ul>
    <div id="dashboard-message" style="display:none"></div>
  `;
  setupNavigation();
}

// Profile Page
async function loadProfile() {
  const user = auth.currentUser;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const data = snap.data() || {};
  const main = document.getElementById("main-content");
  main.innerHTML = `
    <h2 class="font-bold text-xl mb-2">My Profile</h2>
    <form id="profile-form" class="space-y-3 mb-6">
      <label class="block">
        <span class="text-sm">Name</span>
        <input name="name" class="mt-1 p-2 w-full border rounded" value="${data.name || ''}">
      </label>
      <label class="block">
        <span class="text-sm">Email</span>
        <input name="email" type="email" class="mt-1 p-2 w-full border rounded bg-gray-100" value="${data.email || user.email}" disabled>
      </label>
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
    </form>
    <div><a href="#" data-nav="dashboard" class="text-blue-600 text-sm">&larr; Back to Dashboard</a></div>
  `;
  setupNavigation();
  document.getElementById("profile-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await setDoc(userRef, {
      name: fd.get("name"),
    }, { merge: true });
    showMessage("Profile updated!");
  };
}

// Assets Page (CRUD for 'assets' collection under user's doc)
async function loadAssets() {
  const user = auth.currentUser;
  const main = document.getElementById("main-content");
  main.innerHTML = `
    <h2 class="font-bold text-xl mb-2">Assets Manager</h2>
    <form id="asset-add-form" class="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
      <input name="type" placeholder="Type (e.g. property)" required class="p-2 border rounded">
      <input name="name" placeholder="Asset Name" required class="p-2 border rounded">
      <input name="value" placeholder="Value" type="number" step="0.01" required class="p-2 border rounded">
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">Add</button>
    </form>
    <ul id="asset-list" class="divide-y"></ul>
    <div class="mt-4"><a href="#" data-nav="dashboard" class="text-blue-600 text-sm">&larr; Back to Dashboard</a></div>
    <div id="dashboard-message" style="display:none"></div>
  `;
  setupNavigation();

  // Live asset list
  const assetList = document.getElementById("asset-list");
  const assetsCol = collection(db, "users", user.uid, "assets");
  onSnapshot(assetsCol, snap => {
    assetList.innerHTML = "";
    snap.forEach(docSnap => {
      const a = docSnap.data();
      const li = document.createElement("li");
      li.className = "flex gap-4 items-center py-2";
      li.innerHTML = `
        <span class="font-bold">${a.type||"-"}</span>
        <span>${a.name||"-"}</span>
        <span class="text-sm text-gray-500 ml-auto">$${Number(a.value).toLocaleString()}</span>
        <button data-id="${docSnap.id}" class="del-btn text-red-500 hover:text-red-700" title="Delete"><i class="fas fa-trash"></i></button>
      `;
      assetList.appendChild(li);
    });
    assetList.querySelectorAll(".del-btn").forEach(btn => {
      btn.onclick = async () => {
        if (confirm("Delete this asset?")) {
          await deleteDoc(doc(db, "users", user.uid, "assets", btn.getAttribute("data-id")));
        }
      };
    });
  });

  // Add asset
  document.getElementById("asset-add-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await addDoc(assetsCol, {
      type: fd.get("type"),
      name: fd.get("name"),
      value: parseFloat(fd.get("value")) || 0,
      created: new Date()
    });
    e.target.reset();
    showMessage("Asset added!");
  };
}

// Public page classified editor (simple version)
async function loadPublicEditor() {
  const user = auth.currentUser;
  const publicRef = doc(db, "users", user.uid, "pages", "classified");
  const snap = await getDoc(publicRef);
  const current = snap.exists() ? snap.data() : {};
  const main = document.getElementById("main-content");
  main.innerHTML = `
    <h2 class="font-bold text-xl mb-2">Public Page Editor</h2>
    <form id="public-form" class="space-y-3 mb-6">
      <label class="block">
        <span class="text-sm">Page Title</span>
        <input name="title" class="mt-1 p-2 w-full border rounded" value="${current.title||''}">
      </label>
      <label class="block">
        <span class="text-sm">Description</span>
        <textarea name="desc" class="mt-1 p-2 w-full border rounded">${current.desc||''}</textarea>
      </label>
      <button type="submit" class="bg-yellow-500 text-white px-4 py-2 rounded">Save Public Page</button>
    </form>
    <div class="mb-4">
      <a href="#" data-nav="dashboard" class="text-blue-600 text-sm">&larr; Back to Dashboard</a>
      <a href="/public/${user.uid}" target="_blank" class="text-green-600 text-sm ml-4">View Public Page &rarr;</a>
    </div>
    <div id="dashboard-message" style="display:none"></div>
  `;
  setupNavigation();
  document.getElementById("public-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await setDoc(publicRef, {
      title: fd.get("title"),
      desc: fd.get("desc"),
      lastUpdated: new Date()
    }, { merge: true });
    showMessage("Public page saved!");
  };
}

// Optional: Add additional pages/routes as needed

