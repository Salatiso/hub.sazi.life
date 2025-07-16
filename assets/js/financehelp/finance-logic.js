// File: /assets/js/financehelp/finance-logic.js
// This module contains the business logic for the FinanceHelp feature,
// such as calculations and data parsing.

/**
 * Calculates the net wealth of a user.
 * @param {Array} assets - An array of the user's asset objects.
 * @param {Array} liabilities - An array of the user's liability objects.
 * @returns {number} The calculated net wealth.
 */
export function calculateNetWealth(assets, liabilities) {
    const totalAssets = assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + (liability.outstandingBalance || 0), 0);
    return totalAssets - totalLiabilities;
}

/**
 * Parses bank SMS notifications to extract transaction data.
 * @param {string} smsText - The raw text containing one or more SMS messages.
 * @returns {Array} An array of parsed transaction objects.
 */
export function parseSms(smsText) {
    const transactions = [];
    
    // Define Regular Expressions for different South African banks
    // These are examples and would need to be refined with real SMS data.
    const bankPatterns = {
        fnb: /FNB; R(-?[\d,]+\.\d{2}) paid at (.+?)\ on \d{2}\w{3}\. Avail R[\d,]+\.\d{2}\./g,
        absa: /Absa; Purchase of R([\d,]+\.\d{2}) at (.+?)\. Avail R[\d,]+\.\d{2}\./g,
        standard: /Std Bank: R([\d,]+\.\d{2}) paid to (.+?)\. Avail R[\d,]+\.\d{2}\./g,
        capitec: /Capitec: Debit of R([\d,]+\.\d{2}) from your account\. Purchase at (.+?)\./g
    };

    // Clean up the input text
    const cleanedText = smsText.replace(/,/g, ''); // Remove commas from numbers

    for (const bank in bankPatterns) {
        let match;
        while ((match = bankPatterns[bank].exec(cleanedText)) !== null) {
            transactions.push({
                amount: parseFloat(match[1]),
                description: match[2].trim(),
                source: 'SMS_Import',
                bank: bank
            });
        }
    }

    return transactions;
}

/**
 * Generates a tax-ready data pack for a specific tax year.
 * @param {object} userData - An object containing user's income, expenses, and tax documents.
 * @returns {object} A structured object ready for display or export.
 */
export function generateTaxPack(userData) {
    const { income, expenses, taxDocs } = userData;

    // Example logic: Sum up salary income
    const grossEmploymentIncome = income
        .filter(i => i.incomeType === 'Salary')
        .reduce((sum, i) => sum + i.amount, 0);

    // Example logic: Find PAYE from IRP5 docs
    const paye = taxDocs
        .filter(d => d.docType === 'IRP5' && d.parsedData)
        .reduce((sum, d) => sum + (d.parsedData.paye || 0), 0);
        
    // Example logic: Sum up medical expenses
    const medicalExpenses = expenses
        .filter(e => e.category === 'Medical')
        .reduce((sum, e) => sum + e.amount, 0);

    return {
        taxYear: new Date().getFullYear(),
        personalDetails: {
            // Fetch from user's main profile
        },
        income: {
            grossEmploymentIncome,
            // ... other income types
        },
        deductions: {
            paye,
            medicalExpenses,
            // ... other deductions
        }
    };
}

// Add other logic functions here, e.g., calculateAffordabilityScore, etc.
