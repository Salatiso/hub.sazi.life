// /assets/js/firebase-config.js

// Firebase v10 modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_pRVkeVzciCPowxsj44NRVlbyZvFPueI",
  authDomain: "lifecv-d2724.firebaseapp.com",
  projectId: "lifecv-d2724",
  storageBucket: "lifecv-d2724.appspot.com",
  messagingSenderId: "1039752653127",
  appId: "1:1039752653127:web:54afa09b21c98ef231c462",
  measurementId: "G-BDCNHBQTR2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
