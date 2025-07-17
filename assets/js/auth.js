// File: /assets/js/auth.js
// Handles Firebase Auth for The Hub, including Sign In and Sign Up.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyD_pRVkeVzciCPowxsj44NRVlbyZvFPueI",
    authDomain: "lifecv-d2724.firebaseapp.com",
    projectId: "lifecv-d2724",
    storageBucket: "lifecv-d2724.appspot.com",
    messagingSenderId: "1039752653127",
    appId: "1:1039752653127:web:54afa09b21c98ef231c462",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- UI Elements ---
const authForm = document.getElementById('auth-form');
const googleBtn = document.getElementById('google-signin-btn');
const anonBtn = document.getElementById('anonymous-signin-btn');
const messageArea = document.getElementById('message-area');
const formTitle = document.getElementById('form-title');
const formToggleLink = document.getElementById('form-toggle-link');
const submitButton = document.getElementById('submit-button');
const confirmPasswordContainer = document.getElementById('confirm-password-container');

let isSignUp = false; // State to track if the form is for sign-up

/**
 * Displays a message to the user.
 * @param {string} message - The message text.
 * @param {boolean} isError - True if the message is an error.
 */
const showMessage = (message, isError = false) => {
  messageArea.innerHTML = message; // Use innerHTML to allow for links
  messageArea.className = `text-center p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
  messageArea.classList.remove('hidden');
};

/**
 * Handles successful authentication by creating a user profile and redirecting.
 * @param {object} userCredential - The user credential object from Firebase.
 * @param {boolean} isNewUser - Flag to indicate if this is a new sign-up.
 */
const handleAuthSuccess = async (userCredential, isNewUser = false) => {
  const user = userCredential.user;
  const userRef = doc(db, "users", user.uid);

  // Create a user profile in Firestore if it's a new user
  if (isNewUser) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || 'New User',
      email: user.email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    }, { merge: true });
  } else {
    // Just update last login for existing users
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
  }

  // Set a welcome message in sessionStorage to be displayed on the dashboard
  sessionStorage.setItem('welcomeMessage', `
    <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
      <p class="font-bold">Welcome to The Hub!</p>
      <p>You have successfully logged in. Please note that the site is currently in a testing phase. We value your input—please share any feedback via the contact form.</p>
    </div>
  `);

  // Redirect to the dashboard
  window.location.href = 'dashboard/index.html';
};

/**
 * Toggles the form between Sign In and Sign Up modes.
 */
const toggleFormMode = () => {
    isSignUp = !isSignUp;
    formTitle.textContent = isSignUp ? 'Create Account' : 'Sign In';
    submitButton.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    formToggleLink.innerHTML = isSignUp ? 'Already have an account? <span class="font-medium text-blue-600 hover:text-blue-500">Sign In</span>' : 'Don\'t have an account? <span class="font-medium text-blue-600 hover:text-blue-500">Sign Up</span>';
    confirmPasswordContainer.classList.toggle('hidden', !isSignUp);
    messageArea.classList.add('hidden'); // Hide any previous messages
};

// --- Form Event Bindings ---
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authForm.email.value;
    const password = authForm.password.value;

    try {
      if (isSignUp) {
        // --- Sign Up Logic ---
        const confirmPassword = authForm['confirm-password'].value;
        if (password !== confirmPassword) {
          showMessage("Passwords do not match.", true);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(userCredential, true);
      } else {
        // --- Sign In Logic ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(userCredential, false);
      }
    } catch (error) {
      // Map Firebase error codes to user-friendly messages
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
      // We can check if the user is new here if needed, but for simplicity, we treat it as a general success
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
