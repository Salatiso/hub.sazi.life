The Sazi Ecosystem - Unified Dashboard (hub.sazi.life)
Project Overview
This repository contains the front-end code for the Sazi Ecosystem's Unified Dashboard, hosted at hub.sazi.life. This platform serves as the central control center for users to manage their identity, assets, and learning journey across all integrated platforms, including sazi.life, SafetyHelp, eKhaya, and more.
The project is built with a "static-first" approach using HTML, Tailwind CSS, and vanilla JavaScript, with direct, secure integration to Firebase for all backend services.
Guiding Philosophy: Live. Learn. Lead.
The ecosystem is built on a simple yet powerful philosophy:
* Live: Gain practical, real-world experience.
* Learn: Distill that experience into wisdom and knowledge.
* Lead: Use that wisdom to build tools and guide others by example.
Core Features
* Unified Authentication (SSO): A single login provides access to the entire ecosystem.
* LifeCV: A dynamic, holistic portfolio of a user's skills, experiences, and contributions, aggregated from all platforms.
* Asset & Company Hub: A private digital "filing cabinet" for users to manage records for their properties, vehicles, and businesses.
* Public Pages: A tool to effortlessly turn private asset records into beautiful, public-facing classifieds pages.
* Training Hub: An interface for parents and managers to assign courses and for experts to host live training sessions.
Technical Stack (Phase 1)
* Frontend: HTML5, CSS3, JavaScript (ES6 Modules)
* Styling: Tailwind CSS v3
* Backend & Database: Google Firebase
   * Authentication: Email/Password, Google, Anonymous
   * Database: Firestore (using a Federated Data Model for commercial separation)
   * Storage: Firebase Storage for user-uploaded files (CVs, photos, etc.)
* Hosting: Deployed as a static site on Netlify, Vercel, or Firebase Hosting.
Getting Started
1. Clone the repository:
git clone [repository-url]
2. Navigate to the project directory:
cd hub.sazi.life
3. Open login.html in your browser to start exploring the application locally. All pages are linked with relative paths.
File Structure
The project follows a modular structure for easy maintenance.
   * /: Contains the public login and informational pages (about.html, privacy.html, etc.).
   * /assets/: Shared CSS and JavaScript files for the entire application.
   * /dashboard/: Contains all the authenticated user dashboard pages.
   * /dashboard/components/: Reusable HTML components (header, footer) loaded dynamically by JavaScript.
Next Steps: Backend Integration
The UI for all pages is complete. The next development phase involves writing the client-side JavaScript to connect the UI elements to Firebase:
   1. Fetch Data: Populate pages with data from Firestore.
   2. Save Data: Implement form submission logic to write data to Firestore.
   3. Implement Logic: Build out the business logic for features like publishing pages and assigning training.