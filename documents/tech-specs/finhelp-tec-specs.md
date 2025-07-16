### FinanceHelp: Technical Specification

Document ID: FINHELP-TECH-SPEC-V2.0  
Date: 2025-07-16  
Status: For Implementation  
1\. Module Vision & Philosophy  
FinanceHelp is the financial engine of the Sazi Ecosystem. Its purpose is to empower users with a holistic understanding and control over their financial lives, from childhood education to tax readiness and wealth management. It transforms complex financial data into clear, actionable insights, always reinforcing the core Sazi philosophy of self-reliance.  
**2\. Core Features**

* **Dynamic Asset & Liability Register:** A comprehensive log for all user assets (movable, immovable, financial) and liabilities.  
* **Budgeting & Expense Tracking:** Tools for creating monthly budgets and logging expenses, including a powerful SMS import feature.  
* **Financial Health Analysis:** An "Affordability Score" and Net Wealth calculation to provide a real-time snapshot of financial standing.  
* **Tax Pack Generation:** One-click compilation of all relevant financial data into a SARS-ready report.  
* **Public Report Sharing:** Secure, customizable sharing of financial summaries for loan or bond applications.  
* **Children's Register:** A simplified, educational interface for teaching financial literacy.

3\. Firestore Data Model  
This schema provides the detailed structure for storing all financial data securely.  
| Collection Path | Document ID | Key Fields & Description |  
| /users/{userId}/financial\_profile | singleton\_profile | A single document holding metadata. Fields: affordabilityScore (Number), netWealth (Number). |  
| /users/{userId}/assets | {assetId} | Stores all user assets. Fields: assetType (String), name (String), currentValue (Number), isPublic (Boolean), publicData (Object). |  
| /users/{userId}/liabilities | {liabilityId} | Stores all user debts. Fields: liabilityType (String), institution (String), outstandingBalance (Number). |  
| /users/{userId}/income\_streams | {incomeId} | Stores all sources of income. Fields: sourceName (String), amount (Number), frequency (String). |  
| /users/{userId}/expense\_transactions | {expenseId} | A log of all individual expenses. Fields: description (String), amount (Number), category (String), transactionDate (Timestamp). |  
| /users/{userId}/budgets | {budgetId} | User-defined budgets. Fields: category (String), plannedAmount (Number), period (String). |  
**4\. Key API & Logic Flows**

* **SMS Parsing (finance-logic.js):** The parseSms function will use an array of regular expressions to identify transaction details from major South African banks. It will return an array of structured transaction objects.  
* **Net Wealth Calculation (Cloud Function):** A nightly-run Firebase Cloud Function (calculateNetWealth) will be triggered to read all documents in a user's assets and liabilities collections, calculate the total, and update the netWealth field in their financial\_profile. This prevents slow, client-side calculations.  
* **Public Report Generation (publisher.js):** When a user creates a public financial report, a new document is created in a top-level /public\_reports/{reportId} collection. This document stores which data points are shared and has an expiry date. The public page will read from this document, not directly from the user's private data.