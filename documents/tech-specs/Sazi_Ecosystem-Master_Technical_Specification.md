# Sazi Ecosystem: Master Technical Specification

**Document ID:** SAZI-ECO-SPEC-V1.0
**Date:** 2025-07-16
**Status:** Final - As-Built

## 1. Overarching Philosophy

The Sazi Ecosystem is a suite of interconnected web applications built on a single, unified philosophy: to provide individuals and families with the tools for self-reliance and empowerment. The architecture prioritizes user control, data portability (via the LifeCV), and real-world value over abstract credentials.

## 2. Core Technology Stack

- **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript (ES6 Modules).
- **Backend & Database:** Google Firebase (Central Project: `lifecv-d2724`).
  - **Authentication:** Firebase Authentication (Email/Password, Google, Anonymous).
  - **Database:** Firestore (NoSQL).
  - **Serverless Logic:** Firebase Cloud Functions.
  - **Storage:** Firebase Storage.

## 3. Master File Repository Structure

This is the definitive file structure for the `hub.sazi.life` project.

hub.sazi.life/├── .gitattributes├── README.md├── about.html├── index.html├── assets/│   ├── css/│   │   └── dashboard-styles.css│   └── js/│       ├── auth.js│       ├── dashboard.js│       ├── commshub/│       │   ├── comms-db.js│       │   ├── comms-logic.js│       │   └── comms-ui.js│       ├── familyhub/│       │   ├── family-db.js│       │   ├── family-logic.js│       │   └── family-ui.js│       └── financehelp/│           ├── finance-db.js│           ├── finance-logic.js│           └── finance-ui.js├── dashboard/│   ├── activity.html│   ├── index.html│   ├── overview.html│   ├── profile.html│   ├── components/│   │   ├── footer.html│   │   ├── header.html│   │   ├── language-switcher.html│   │   └── sidebar.html│   │   └── theme-switcher.html│   ├── commshub/│   │   └── index.html│   ├── familyhub/│   │   ├── create.html│   │   └── index.html│   ├── finhelp/│   │   ├── assets.html│   │   ├── expenses.html│   │   ├── index.html│   │   ├── public-share.html│   │   └── tax-pack.html│   ├── life-cv/│   │   └── life-cv.html│   ├── public-pages/│   │   └── editor.html│   ├── publications/│   │   ├── editor.html│   │   └── index.html│   └── training/│       ├── assign.html│       ├── host.html│       └── index.html├── documents/│   ├── Sazi_Ecosystem-Master_Technical_Specification.md│   └── Sazi_Hub-Site_Audit_Report.md├── public/│   ├── professional-family.html│   └── homely-family.html└── templates/└── Marketing/├── explainers/│   ├── Sazi_Ecosystem-Explainer.html│   ├── FinanceHelp-Explainer.md│   ├── FamilyHub-Explainer.md│   ├── LifeCV-Explainer.md│   └── CommsHub-Explainer.md├── brochures/│   └── Sazi_Ecosystem-Investor_Brochure.html└── posters/└── Sazi_Ecosystem-Launch_Poster.html
## 4. Module Specifications

This document serves as a container for the individual technical specifications of each module. Refer to the following documents for detailed schemas and logic flows:
* `FinanceHelp: Technical Specification`
* `LifeCV: Technical Specification`
* `FamilyHub: Technical Specification`
* `CommsHub: Technical Specification`
