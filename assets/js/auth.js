// /assets/js/auth.js

// Correct relative path to firebase-config
import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  updateProfile
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
const nameContainer = document.getElementById('name-container');

let isSignUp = false;

// --- Functions ---
const showMessage = (message, isError = false) => {
  if (!messageArea) return;
  messageArea.innerHTML = message;
  messageArea.className = `text-center p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
  messageArea.style.display = 'block';
};

const toggleFormMode = () => {
  isSignUp = !isSignUp;
  if (formTitle) formTitle.textContent = isSignUp ? 'Create Your Account' : 'Sign In to The Hub';
  if (submitButton) submitButton.textContent = isSignUp ? 'Sign Up' : 'Sign In';
  if (formToggleLink) formToggleLink.innerHTML = isSignUp ? 'Already have an account? <span class="text-accent-color font-semibold">Sign In</span>' : 'Don’t have an account? <span class="text-accent-color font-semibold">Sign Up</span>';
  if (confirmPasswordContainer) confirmPasswordContainer.style.display = isSignUp ? 'block' : 'none';
  if (nameContainer) nameContainer.style.display = isSignUp ? 'block' : 'none';
  if (messageArea) messageArea.style.display = 'none';
  if (authForm) authForm.reset();
};

const handleAuthSuccess = async (userCredential) => {
  const user = userCredential.user;
  if (!user) return;

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userData = {
      uid: user.uid,
      email: user.email || 'Anonymous',
      displayName: user.displayName || 'Anonymous User',
      photoURL: user.photoURL || `https://placehold.co/100x100/667eea/ffffff?text=${(user.email || 'A').charAt(0).toUpperCase()}`,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isAnonymous: user.isAnonymous
    };
    await setDoc(userDocRef, userData, { merge: true });

    // *** FIX: Redirect to the main dashboard shell page at the root level. ***
    window.location.href = './dashboard.html';

  } catch (error) {
    console.error("Error creating/updating user document:", error);
    showMessage("There was an issue setting up your profile. Please try again.", true);
  }
};

// --- Event Listeners ---
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authForm.email.value;
    const password = authForm.password.value;
    const name = authForm.name ? authForm.name.value : '';
    const confirmPassword = authForm['confirm-password'] ? authForm['confirm-password'].value : '';

    if (isSignUp && password !== confirmPassword) {
      showMessage("Passwords do not match.", true);
      return;
    }
     if (isSignUp && !name) {
      showMessage("Please enter your name.", true);
      return;
    }

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      await handleAuthSuccess(userCredential);
    } catch (error) {
      console.error("Authentication Error:", error.code, error.message);
      let friendlyMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        friendlyMessage = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = "An account with this email address already exists. Please sign in instead.";
      } else if (error.code === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/weak-password') {
        friendlyMessage = "Password should be at least 6 characters.";
      }
      showMessage(friendlyMessage, true);
    }
  });
}

if (formToggleLink) {
  formToggleLink.addEventListener('click', e => {
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
       console.error("Google Sign-In Error:", error);
      showMessage("Could not sign in with Google. Please try again.", true);
    }
  });
}

if (anonBtn) {
  anonBtn.addEventListener('click', async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      await handleAuthSuccess(userCredential);
    } catch (error) {
       console.error("Anonymous Sign-In Error:", error);
      showMessage("Could not sign in anonymously. Please try again.", true);
    }
  });
}
