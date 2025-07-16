// File: /assets/js/auth.js
// Handles Firebase Auth for Sazi Ecosystem

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyD_pRVkeVzciCPowxsj44NRVlbyZvFPueI",
  authDomain: "lifecv-d2724.firebaseapp.com",
  projectId: "lifecv-d2724",
  storageBucket: "lifecv-d2724.firebasestorage.app",
  messagingSenderId: "1039752653127",
  appId: "1:1039752653127:web:54afa09b21c98ef231c462"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- UI Elements ---
const loginForm = document.getElementById('login-form');
const googleBtn = document.getElementById('google-signin-btn');
const anonBtn = document.getElementById('anonymous-signin-btn');
const messageArea = document.getElementById('message-area');

const showMessage = (message, isError = false) => {
  messageArea.textContent = message;
  messageArea.className =
    `text-center p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
  messageArea.classList.remove('hidden');
};

// --- After Successful Login ---
const handleAuthSuccess = async (userCredential) => {
  const user = userCredential.user;
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    name: user.displayName || 'New User',
    email: user.email || 'anonymous@sazi.life',
    lastLogin: new Date().toISOString()
  }, { merge: true });

  window.location.href = 'dashboard/index.html';
};

// --- Form Event Bindings ---
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginForm.email.value, loginForm.password.value);
      await handleAuthSuccess(userCredential);
    } catch (error) {
      showMessage(error.message, true);
    }
  });
}

if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleAuthSuccess(result);
    } catch (error) {
      showMessage(error.message, true);
    }
  });
}

if (anonBtn) {
  anonBtn.addEventListener('click', async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      await handleAuthSuccess(userCredential);
    } catch (error) {
      showMessage(error.message, true);
    }
  });
}
