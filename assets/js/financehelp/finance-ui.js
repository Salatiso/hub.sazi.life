// File: /assets/js/financehelp/finance-ui.js
// This module handles the user interface and event listeners for the FinanceHelp feature.

import * as db from './finance-db.js';
import * as logic from './finance-logic.js';

// --- Asset Page ---
export function initAssetPage(userId) {
    const addAssetForm = document.getElementById('add-asset-form');
    const assetsList = document.getElementById('assets-list');

    if (addAssetForm) {
        addAssetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addAssetForm);
            const assetData = Object.fromEntries(formData.entries());
            assetData.currentValue = parseFloat(assetData.currentValue);
            try {
                await db.addAsset(userId, assetData);
                addAssetForm.reset();
                loadAndDisplayAssets(userId, assetsList);
            } catch (error) {
                alert('Error adding asset.');
            }
        });
    }
    if (assetsList) {
        loadAndDisplayAssets(userId, assetsList);
    }
}

async function loadAndDisplayAssets(userId, listElement) {
    if (!listElement) return;
    try {
        const assets = await db.getAssets(userId);
        listElement.innerHTML = '';
        if (assets.length === 0) {
            listElement.innerHTML = '<p class="text-secondary text-center py-4">No assets added yet.</p>';
            return;
        }
        assets.forEach(asset => {
            const assetEl = document.createElement('div');
            assetEl.className = 'bg-main p-4 rounded-lg flex justify-between items-center';
            assetEl.innerHTML = `
                <div>
                    <h4 class="font-bold text-primary">${asset.name}</h4>
                    <p class="text-sm text-secondary">${asset.assetType}</p>
                </div>
                <p class="text-lg font-semibold text-primary">R ${asset.currentValue.toLocaleString()}</p>
            `;
            listElement.appendChild(assetEl);
        });
    } catch (error) {
        listElement.innerHTML = '<p class="text-red-500 text-center py-4">Could not load assets.</p>';
    }
}

// --- Expense Page ---
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
                alert('Could not find any recognizable transactions.');
            }
        });
    }
}

function displayParsedTransactions(transactions, container, userId) {
    container.innerHTML = '<h3 class="font-bold mb-2">Confirm Transactions</h3>';
    transactions.forEach(tx => {
        const txEl = document.createElement('div');
        txEl.className = 'bg-main p-3 rounded-lg flex justify-between items-center';
        txEl.innerHTML = `
            <div>
                <p class="text-sm">${tx.description}</p>
                <p class="font-bold">R ${tx.amount.toFixed(2)}</p>
            </div>
            <button class="btn-primary text-xs">Save</button>
        `;
        txEl.querySelector('button').addEventListener('click', async () => {
            await db.addExpense(userId, { description: tx.description, amount: tx.amount, category: 'Uncategorized' });
            txEl.remove();
        });
        container.appendChild(txEl);
    });
}

// --- NEW: Tax Pack Page ---
export function initTaxPackPage(userId) {
    const generateBtn = document.getElementById('generate-tax-pack-btn');
    const container = document.getElementById('tax-report-container');

    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            container.innerHTML = '<p class="text-secondary text-center py-8">Generating your report...</p>';
            try {
                // In a real app, you would fetch all these from the DB
                const mockData = {
                    income: [{ incomeType: 'Salary', amount: 750000 }],
                    expenses: [{ category: 'Medical', amount: 15000 }],
                    taxDocs: [{ docType: 'IRP5', parsedData: { paye: 200000 } }]
                };
                
                const reportData = logic.generateTaxPack(mockData);
                renderTaxReport(reportData, container);

            } catch (error) {
                container.innerHTML = '<p class="text-red-500 text-center py-8">Could not generate report.</p>';
            }
        });
    }
}

function renderTaxReport(data, container) {
    container.innerHTML = `
        <div class="space-y-4">
            <div>
                <h3 class="text-secondary text-sm font-semibold uppercase">Income</h3>
                <div class="mt-2 space-y-1 text-primary">
                    <div class="flex justify-between"><span>Gross Employment Income:</span><span>R ${data.income.grossEmploymentIncome.toLocaleString()}</span></div>
                </div>
            </div>
            <div>
                <h3 class="text-secondary text-sm font-semibold uppercase">Deductions</h3>
                <div class="mt-2 space-y-1 text-primary">
                    <div class="flex justify-between"><span>PAYE:</span><span>R ${data.deductions.paye.toLocaleString()}</span></div>
                    <div class="flex justify-between"><span>Medical Expenses:</span><span>R ${data.deductions.medicalExpenses.toLocaleString()}</span></div>
                </div>
            </div>
        </div>
    `;
}
