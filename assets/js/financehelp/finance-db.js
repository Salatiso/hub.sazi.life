// File: /assets/js/financehelp/finance-db.js
// This module handles all interactions with the Firestore database for the FinanceHelp feature.

// --- Firebase & Module Imports ---
// Import the initialized db instance from the central config file
import { db } from '../firebase-config.js'; 
import {
    doc,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Note: We no longer initialize Firestore here. We use the imported 'db' instance.

/**
 * Adds a new asset to the user's collection in Firestore.
 * @param {string} userId - The ID of the current user.
 * @param {object} assetData - The asset data to be saved.
 * @returns {Promise<string>} The ID of the newly created document.
 */
export async function addAsset(userId, assetData) {
    try {
        const assetCollectionRef = collection(db, 'users', userId, 'assets');
        const docRef = await addDoc(assetCollectionRef, {
            ...assetData,
            createdAt: serverTimestamp()
        });
        console.log("Asset added with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding asset: ", error);
        throw error;
    }
}

/**
 * Fetches all assets for a given user.
 * @param {string} userId - The ID of the current user.
 * @returns {Promise<Array>} An array of asset objects.
 */
export async function getAssets(userId) {
    try {
        const assets = [];
        const q = query(collection(db, 'users', userId, 'assets'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            assets.push({ id: doc.id, ...doc.data() });
        });
        return assets;
    } catch (error) {
        console.error("Error fetching assets: ", error);
        throw error;
    }
}

// ... other functions (addLiability, addIncomeStream, addExpense) remain the same
// and will now work correctly because they use the imported 'db' instance.

export async function addExpense(userId, expenseData) {
    try {
        const expenseCollectionRef = collection(db, 'users', userId, 'expense_transactions');
        const docRef = await addDoc(expenseCollectionRef, {
            ...expenseData,
            createdAt: serverTimestamp()
        });
        console.log("Expense added with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding expense: ", error);
        throw error;
    }
}
