// File: /assets/js/auth.js
// Handles Firebase Auth for The Hub, including Sign In and Sign Up.

// --- Firebase & Module Imports ---
// Import the initialized auth and db instances from the central config file
import { auth, db } from './firebase-config.js'; 
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// --- UI Elements ---
const authForm = document.getElementById('auth-form');
const googleBtn = document.getElementById('google-signin-btn');
const anonBtn = document.getElementById('anonymous-signin-btn');
const messageArea = document.getElementById('message-area');
const formTitle = document.getElementById('form-title');
const formToggleLink = document.getElementById('form-toggle-link');
const submitButton = document.getElementById('submit-button');
const confirmPasswordContainer = document.getElementById('confirm-password-container');

let isSignUp = false;

// --- Functions (showMessage, handleAuthSuccess, toggleFormMode) remain the same ---

const showMessage = (message, isError = false) => {
  messageArea.innerHTML = message;
  messageArea.className = `text-center p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
  messageArea.classList.remove('hidden');
};

const handleAuthSuccess = async (userCredential, isNewUser = false) => {
  const user = userCredential.user;
  const userRef = doc(db, "users", user.uid);

  if (isNewUser) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || 'New User',
      email: user.email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    }, { merge: true });
  } else {
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
  }

  sessionStorage.setItem('welcomeMessage', `
    <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
      <p class="font-bold">Welcome to The Hub!</p>
      <p>You have successfully logged in. Please note that the site is currently in a testing phase. We value your input—please share any feedback via the contact form.</p>
    </div>
  `);

  window.location.href = 'dashboard/index.html';
};

const toggleFormMode = () => {
    isSignUp = !isSignUp;
    formTitle.textContent = isSignUp ? 'Create Account' : 'Sign In';
    submitButton.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    formToggleLink.innerHTML = isSignUp ? 'Already have an account? <span class="font-medium text-blue-600 hover:text-blue-500">Sign In</span>' : 'Don\'t have an account? <span class="font-medium text-blue-600 hover:text-blue-500">Sign Up</span>';
    confirmPasswordContainer.classList.toggle('hidden', !isSignUp);
    messageArea.classList.add('hidden');
};


// --- Form Event Bindings ---
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authForm.email.value;
    const password = authForm.password.value;

    try {
      if (isSignUp) {
        const confirmPassword = authForm['confirm-password'].value;
        if (password !== confirmPassword) {
          showMessage("Passwords do not match.", true);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(userCredential, true);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(userCredential, false);
      }
    } catch (error) {
      let friendlyMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        friendlyMessage = "Invalid credentials. Please check your email and password and try again.";
      } else if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = "An account with this email address already exists. Please sign in instead.";
      }
      showMessage(friendlyMessage, true);
    }
  });
}

if (formToggleLink) {
    formToggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleFormMode();
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
