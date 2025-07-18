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
        // This is a placeholder for where you would fetch real data.
        // For now, we'll simulate it with static content.
        const userProfile = {
            name: "Salatiso Mdeni",
            title: "Lead Ecosystem Architect",
            summary: "A visionary leader with a passion for building integrated digital ecosystems that empower communities. Experienced in software development, project management, and strategic planning.",
            skills: ["JavaScript", "Firebase", "Tailwind CSS", "HTML5", "Project Management", "Strategic Thinking"],
            experience: [
                {
                    title: "Founder & CEO",
                    company: "Sazi.life",
                    period: "2023 - Present",
                    description: "Leading the development of a comprehensive digital ecosystem to support personal and professional growth."
                }
            ],
            education: [
                {
                    degree: "Self-Taught & Life-Long Learner",
                    institution: "School of Life (Under a Tree)",
                    period: "1982 - Present",
                    description: "Gained foundational knowledge and resilience that formal education cannot always provide."
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
    container.innerHTML = `
        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold border-b border-border-color pb-2 mb-4">Personal Summary</h2>
            <p class="text-secondary">${data.summary}</p>
        </div>

        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold border-b border-border-color pb-2 mb-4">Core Skills</h2>
            <div class="flex flex-wrap gap-2">
                ${data.skills.map(skill => `<span class="bg-accent-color/20 text-accent-color text-sm font-semibold px-3 py-1 rounded-full">${skill}</span>`).join('')}
            </div>
        </div>

        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold border-b border-border-color pb-2 mb-4">Experience</h2>
            ${data.experience.map(job => `
                <div class="mb-4">
                    <h3 class="text-lg font-bold text-primary">${job.title}</h3>
                    <p class="text-md font-semibold text-secondary">${job.company} | ${job.period}</p>
                    <p class="text-sm text-secondary mt-1">${job.description}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold border-b border-border-color pb-2 mb-4">Education</h2>
            ${data.education.map(edu => `
                <div class="mb-4">
                    <h3 class="text-lg font-bold text-primary">${edu.degree}</h3>
                    <p class="text-md font-semibold text-secondary">${edu.institution} | ${edu.period}</p>
                    <p class="text-sm text-secondary mt-1">${edu.description}</p>
                </div>
            `).join('')}
        </div>
    `;
}
