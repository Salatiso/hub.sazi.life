// File: /assets/js/life-cv/life-cv-ui.js
// Manages the UI and data rendering for the Life-CV page.

import { db } from '../firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Initializes the Life-CV page, fetches user data, and renders it.
 * @param {string} userId The ID of the currently logged-in user.
 */
export async function initLifeCvPage(userId) {
    const contentArea = document.getElementById('lifecv-content');
    if (!contentArea) {
        console.error('Life-CV content area not found!');
        return;
    }

    contentArea.innerHTML = `<p class="text-center text-secondary">Fetching your Life-CV data...</p>`;

    try {
        // This is a placeholder for where you would fetch real data from Firestore.
        // For now, we'll simulate it with static content to demonstrate functionality.
        // In the future, you would replace this with:
        // const userDocRef = doc(db, "users", userId, "lifecv", "main");
        // const docSnap = await getDoc(userDocRef);
        // if (docSnap.exists()) {
        //     const userProfile = docSnap.data();
        //     renderLifeCv(userProfile, contentArea);
        // } else { ... }

        const userProfile = {
            name: "Salatiso Mdeni",
            title: "Lead Ecosystem Architect",
            summary: "A visionary leader with a passion for building integrated digital ecosystems that empower communities. Experienced in software development, project management, and strategic planning, with a unique perspective gained from a life of resilience and self-driven education.",
            skills: ["JavaScript", "Firebase", "Tailwind CSS", "HTML5", "Project Management", "Strategic Thinking", "Community Building"],
            experience: [
                {
                    title: "Founder & CEO",
                    company: "Sazi.life",
                    period: "2023 - Present",
                    description: "Leading the development of a comprehensive digital ecosystem designed to support personal, professional, and community growth through technology."
                }
            ],
            education: [
                {
                    degree: "Self-Taught & Lifelong Learner",
                    institution: "School of Life, Transkei",
                    period: "1982 - Present",
                    description: "Acquired foundational knowledge, resilience, and a deep-seated drive for learning in an environment that demanded it. This experience forms the bedrock of a practical, results-oriented approach to problem-solving."
                }
            ]
        };

        // Render the fetched data
        renderLifeCv(userProfile, contentArea);

    } catch (error) {
        console.error("Error fetching Life-CV data:", error);
        contentArea.innerHTML = `<p class="text-center text-red-500">Could not load your Life-CV. Please try again later.</p>`;
    }
}

/**
 * Renders the Life-CV data into the provided HTML element.
 * @param {object} data The user's profile data.
 * @param {HTMLElement} container The element to render the content into.
 */
function renderLifeCv(data, container) {
    // Clear previous content and render new data
    container.innerHTML = `
        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold border-b border-border-color pb-2 mb-4">Personal Summary</h2>
            <p class="text-secondary">${data.summary || 'No summary provided.'}</p>
        </div>

        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold border-b border-border-color pb-2 mb-4">Core Skills</h2>
            <div class="flex flex-wrap gap-2">
                ${data.skills && data.skills.length > 0
                    ? data.skills.map(skill => `<span class="bg-accent-color/20 text-accent-color text-sm font-semibold px-3 py-1 rounded-full">${skill}</span>`).join('')
                    : '<p class="text-secondary">No skills listed.</p>'
                }
            </div>
        </div>

        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold border-b border-border-color pb-2 mb-4">Experience</h2>
            ${data.experience && data.experience.length > 0
                ? data.experience.map(job => `
                    <div class="mb-4 last:mb-0">
                        <h3 class="text-lg font-bold text-primary">${job.title}</h3>
                        <p class="text-md font-semibold text-secondary">${job.company} | ${job.period}</p>
                        <p class="text-sm text-secondary mt-1">${job.description}</p>
                    </div>
                `).join('')
                : '<p class="text-secondary">No experience listed.</p>'
            }
        </div>
        
        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold border-b border-border-color pb-2 mb-4">Education</h2>
            ${data.education && data.education.length > 0
                ? data.education.map(edu => `
                    <div class="mb-4 last:mb-0">
                        <h3 class="text-lg font-bold text-primary">${edu.degree}</h3>
                        <p class="text-md font-semibold text-secondary">${edu.institution} | ${edu.period}</p>
                        <p class="text-sm text-secondary mt-1">${edu.description}</p>
                    </div>
                `).join('')
                : '<p class="text-secondary">No education listed.</p>'
            }
        </div>
    `;
}
