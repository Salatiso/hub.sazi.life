### FamilyHub: Technical Specification

Document ID: FAMILYHUB-TECH-SPEC-V1.0  
Date: 2025-07-16  
Status: For Implementation  
1\. Module Vision & Philosophy  
The FamilyHub is a private digital intranet designed to help families organize, collaborate, and formally recognize the value of every member's contribution, both financial and non-financial. It is built on the principles of clear governance, shared identity, and the holistic valuation of work.  
**2\. Core Features**

* **Family Creation & Management:** A wizard to create a family entity, define its values, and invite members.  
* **Governance & Roles:** A system for assigning roles (Administrator, Chairperson, Executive, Guardian) based on the "Delegation of Authority" charter.  
* **Contribution Logging:** A simple interface for any member to log their contributions (chores, childcare, financial support, etc.).  
* **Automated Valuation Engine:** A backend system that assigns a real-world monetary value to non-financial contributions.  
* **Shared Public Pages:** Customizable templates for creating a public-facing family profile.

3\. Firestore Data Model  
The FamilyHub introduces new top-level collections to manage family entities separately from individual users.  
| Collection Path | Document ID | Key Fields & Description |  
| /families | {familyId} | The main document for a family entity. Fields: familyName (String), familyValues (String), adminId (String, links to a userId). |  
| /families/{familyId}/members | {userId} | Defines each member's role within the family. Fields: role (String: "Admin", "Chairperson", "Executive", "Guardian", "Member"), dateJoined (Timestamp). |  
| /families/{familyId}/contributions | {contributionId} | A log of all contributions. Fields: contributorId (String), description (String), contributionType (String), timeSpentHours (Number), moneySpent (Number), calculatedValue (Number). |  
| /config | valuationRates | A single document storing the "rate card" for valuing work. Fields: cookingHourRate (Number), childcareHourRate (Number), restaurantMealMultiplier (Number). |  
**4\. Key API & Logic Flows**

* **Valuation Engine (Cloud Function):** A Firebase Cloud Function (onContributionCreate) is triggered whenever a new document is added to a contributions sub-collection.  
  1. The function reads the contributionType and timeSpentHours.  
  2. It fetches the corresponding rate from the /config/valuationRates document.  
  3. It calculates the calculatedValue and updates the contribution document with this new field.  
* **Governance ("Handshake" Protocol):** This will be managed client-side initially for simplicity. When a user wants to publish a family asset:  
  1. A "request" document is created in /families/{familyId}/release\_requests.  
  2. The dashboard UI for members with "Executive" or "Chairperson" roles will show a notification and an "Approve" button for this request.  
  3. Only when the required number of approvals are logged against the request document will the isPublic flag on the asset be set to true.