// File: /assets/js/financehelp/finance-ui.js
// This module handles the user interface and event listeners for the FinanceHelp feature.

import * as db from './finance-db.js';
import * as logic from './finance-logic.js';

/**
 * Initializes the event listeners for the Asset Management page.
 * @param {string} userId - The ID of the current user.
 */
export function initAssetPage(userId) {
    const addAssetForm = document.getElementById('add-asset-form');
    const assetsList = document.getElementById('assets-list');

    if (addAssetForm) {
        addAssetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addAssetForm);
            const assetData = Object.fromEntries(formData.entries());
            
            // Convert numeric values
            assetData.purchaseValue = parseFloat(assetData.purchaseValue);
            assetData.currentValue = parseFloat(assetData.currentValue);

            try {
                await db.addAsset(userId, assetData);
                addAssetForm.reset();
                loadAndDisplayAssets(userId, assetsList); // Refresh the list
            } catch (error) {
                alert('Error adding asset. Please try again.');
            }
        });
    }

    if (assetsList) {
        loadAndDisplayAssets(userId, assetsList);
    }
}

/**
 * Loads assets from the database and displays them on the page.
 * @param {string} userId - The ID of the current user.
 * @param {HTMLElement} listElement - The HTML element to display the assets in.
 */
async function loadAndDisplayAssets(userId, listElement) {
    if (!listElement) return;
    try {
        const assets = await db.getAssets(userId);
        listElement.innerHTML = ''; // Clear current list
        if (assets.length === 0) {
            listElement.innerHTML = '<p class="text-secondary">No assets added yet.</p>';
            return;
        }
        assets.forEach(asset => {
            const assetEl = document.createElement('div');
            assetEl.className = 'card p-4 rounded-lg';
            assetEl.innerHTML = `
                <h4 class="font-bold text-primary">${asset.name}</h4>
                <p class="text-sm text-secondary">${asset.assetType}</p>
                <p class="text-lg font-semibold text-primary mt-2">Value: R ${asset.currentValue.toLocaleString()}</p>
            `;
            listElement.appendChild(assetEl);
        });
    } catch (error) {
        listElement.innerHTML = '<p class="text-red-500">Could not load assets.</p>';
    }
}


/**
 * Initializes the event listeners for the Expense Tracking page.
 * @param {string} userId - The ID of the current user.
 */
export function initExpensePage(userId) {
    const smsPasteArea = document.getElementById('sms-paste-area');
    const parsedTransactionsContainer = document.getElementById('parsed-transactions');

    if (smsPasteArea) {
        smsPasteArea.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const transactions = logic.parseSms(pastedText);

            if (transactions.length > 0) {
                displayParsedTransactions(transactions, parsedTransactionsContainer, userId);
            } else {
                alert('Could not find any recognizable transactions in the pasted text.');
            }
        });
    }
}

/**
 * Displays parsed transactions and provides a button to save them.
 * @param {Array} transactions - Array of parsed transaction objects.
 * @param {HTMLElement} container - The container to display the transactions in.
 * @param {string} userId - The ID of the current user.
 */
function displayParsedTransactions(transactions, container, userId) {
    container.innerHTML = '<h3>Confirm Transactions</h3>';
    transactions.forEach(tx => {
        const txEl = document.createElement('div');
        txEl.className = 'bg-main p-3 rounded flex justify-between items-center';
        txEl.innerHTML = `
            <div>
                <p>${tx.description}</p>
                <p class="font-bold">R ${tx.amount.toFixed(2)}</p>
            </div>
            <button class="btn-primary text-xs">Save</button>
        `;
        txEl.querySelector('button').addEventListener('click', async () => {
            // Here you would add a category selector before saving
            await db.addExpense(userId, { description: tx.description, amount: tx.amount, category: 'Uncategorized' });
            txEl.remove(); // Remove after saving
        });
        container.appendChild(txEl);
    });
}

// You would create similar `init` functions for other FinanceHelp pages (Budget, Tax, etc.)
