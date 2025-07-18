// File: /assets/js/auth.js
// Handles Firebase Auth for The Hub, including Sign In and Sign Up.

// --- Firebase & Module Imports ---
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

// --- Functions ---

const showMessage = (message, isError = false) => {
  messageArea.innerHTML = message;
  messageArea.className = `text-center p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
};

const handleAuthSuccess = async (userCredential, isNewUser = false) => {
  const user = userCredential.user;
  if (isNewUser) {
    // If it's a new user, create a document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: user.displayName || 'New User',
      createdAt: serverTimestamp(),
      uid: user.uid
    });
  }
  // Redirect to the dashboard using a reliable, absolute path
  window.location.href = '/hub.sazi.life-main/dashboard/index.html';
};

const toggleFormMode = () => {
    isSignUp = !isSignUp;
    formTitle.textContent = isSignUp ? 'Create Your Account' : 'Sign In to The Hub';
    submitButton.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    confirmPasswordContainer.classList.toggle('hidden', !isSignUp);
    formToggleLink.innerHTML = isSignUp 
        ? 'Already have an account? <span class="font-semibold text-accent-color hover:underline">Sign In</span>' 
        : 'Don\'t have an account? <span class="font-semibold text-accent-color hover:underline">Sign Up</span>';
    messageArea.innerHTML = '';
};

// --- Event Listeners ---

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
      // You might need more logic here to check if the user is new
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
