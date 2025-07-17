# The Hub: Master Technical Specification

**Document ID:** HUB-SPEC-V2.0
**Date:** 2025-07-17
**Status:** Final - As-Built

## 1. Overarching Philosophy & Branding

The Hub is a suite of interconnected web applications built on the **Salatiso** philosophy of providing individuals and families with the tools for self-reliance and empowerment. The architecture prioritizes user control, data portability (via the LifeCV), and real-world value.

## 2. Core Technology Stack

- **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript (ES6 Modules).
- **Backend & Database:** Google Firebase (Central Project: `lifecv-d2724`).

## 3. Master File Repository Structure

This is the definitive file structure for the `hub.sazi.life` project.


hub.sazi.life/
├── dashboard/
│ ├── components/
│ ├── finhelp/
│ ├── familyhub/
│ ├── commshub/
│ ├── lifesync/
│ └── public-pages/
├── documents/
│ ├── The_Hub-Master_Technical_Specification.md
│ └── The_Hub-Site_Audit_Report.md
│ └── strategy-brand_evolution.md
├── public/
│ └── (Public page templates)
├── templates/
│ └── marketing/
│ ├── explainers/
│ ├── brochures/
│ └── posters/
└── assets/
└── js/
└── (All JS modules)
## 4. Module Specifications

This document serves as a container for the individual technical specifications of each module. Refer to the specific spec documents for detailed schemas and logic flows.