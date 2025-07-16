### LifeCV: Technical Specification

Document ID: LIFECV-TECH-SPEC-V1.0  
Date: 2025-07-16  
Status: For Implementation  
1\. Module Vision & Philosophy  
The LifeCV is the central pillar of the Sazi Ecosystem's value proposition. It is a dynamic, verifiable portfolio that proves a user's competence through their actions, not just their credentials. It is designed to be a living document, automatically updated by a user's engagement across all integrated platforms (FinanceHelp, FamilyValue, eKhaya, etc.).  
**2\. Core Features**

* **Automated Entry Aggregation:** Automatically pulls in achievements from other ecosystem platforms.  
* **Manual Entry:** Allows users to add their own experiences, skills, and traditional credentials.  
* **Dynamic Sections:** Organizes entries into clear categories (Experience, Skills, Portfolio, Contributions, Education).  
* **PDF & Public Profile Generation:** Allows users to download a professional PDF or share a live web profile of their LifeCV.

3\. Firestore Data Model  
The LifeCV is a single, powerful sub-collection within each user's document.  
| Collection Path | Document ID | Key Fields & Description |  
| /users/{userId}/lifecv\_entries | {entryId} | A single entry in the user's LifeCV. Fields: entryType (String: "skill", "experience", "portfolio", "contribution", "education", "financial\_milestone"), title (String), description (String), date (Timestamp), sourcePlatform (String: "FinanceHelp", "FamilyValue", "Manual"), tags (Array of strings), metadata (Object for extra data like company name or achievement level). |  
**4\. Key API & Logic Flows**

* **Entry Creation (Cloud Function):** The primary integration point is a single, secure Firebase Cloud Function: addLifeCvEntry.  
* **Process Flow:**  
  1. An external platform (e.g., FinanceHelp) makes an authenticated API call to the addLifeCvEntry function.  
  2. The request payload includes the userId and the full entry object (title, description, sourcePlatform, etc.).  
  3. The Cloud Function validates the request and writes the new entry to the /users/{userId}/lifecv\_entries collection in Firestore.  
* **Client-Side Rendering (life-cv.html):** The LifeCV page fetches all documents from the user's lifecv\_entries collection and dynamically renders them into the appropriate sections on the page.