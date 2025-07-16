// File: /assets/js/financehelp/finance-db.js
// This module handles all interactions with the Firestore database for the FinanceHelp feature.

import {
    getFirestore,
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

// Initialize Firestore
const db = getFirestore();

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

// --- Functions for Liabilities ---

/**
 * Adds a new liability to the user's collection in Firestore.
 * @param {string} userId - The ID of the current user.
 * @param {object} liabilityData - The liability data to be saved.
 * @returns {Promise<string>} The ID of the newly created document.
 */
export async function addLiability(userId, liabilityData) {
    try {
        const liabilityCollectionRef = collection(db, 'users', userId, 'liabilities');
        const docRef = await addDoc(liabilityCollectionRef, {
            ...liabilityData,
            createdAt: serverTimestamp()
        });
        console.log("Liability added with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding liability: ", error);
        throw error;
    }
}

// --- Functions for Income Streams ---

/**
 * Adds a new income stream to the user's collection in Firestore.
 * @param {string} userId - The ID of the current user.
 * @param {object} incomeData - The income data to be saved.
 * @returns {Promise<string>} The ID of the newly created document.
 */
export async function addIncomeStream(userId, incomeData) {
    try {
        const incomeCollectionRef = collection(db, 'users', userId, 'income_streams');
        const docRef = await addDoc(incomeCollectionRef, {
            ...incomeData,
            createdAt: serverTimestamp()
        });
        console.log("Income stream added with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding income stream: ", error);
        throw error;
    }
}


// --- Functions for Expense Transactions ---

/**
 * Adds a new expense transaction to the user's collection in Firestore.
 * @param {string} userId - The ID of the current user.
 * @param {object} expenseData - The expense data to be saved.
 * @returns {Promise<string>} The ID of the newly created document.
 */
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

// You can add more functions here for updating, deleting, and fetching other data types (budgets, tax_docs, etc.) following the same pattern.
