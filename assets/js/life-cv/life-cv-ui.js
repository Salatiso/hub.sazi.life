// File: /assets/js/life-cv/life-cv-ui.js
// This new file manages the UI for the Life-CV page.

/**
 * Initializes the Life-CV page by finding the content area
 * and filling it with the user's data.
 * @param {string} userId The ID of the currently logged-in user.
 */
export function initLifeCvPage(userId) {
    const contentArea = document.getElementById('lifecv-content');
    if (!contentArea) {
        console.error('Error: Life-CV content area not found on the page!');
        return;
    }

    // Replace "Loading..." with actual content.
    // This is placeholder data. Later, you can fetch this from Firestore.
    const userProfile = {
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

    // Render the profile data into the page.
    renderLifeCv(userProfile, contentArea);
}

/**
 * Takes profile data and generates the HTML to display it.
 * @param {object} data The user's profile data.
 * @param {HTMLElement} container The element to render the content into.
 */
function renderLifeCv(data, container) {
    container.innerHTML = `
        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold border-b border-border-color pb-2 mb-4">Personal Summary</h2>
            <p class="text-secondary">${data.summary || 'No summary provided.'}</p>
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
                <div class="mb-4 last:mb-0">
                    <h3 class="text-lg font-bold text-primary">${job.title}</h3>
                    <p class="text-md font-semibold text-secondary">${job.company} | ${job.period}</p>
                    <p class="text-sm text-secondary mt-1">${job.description}</p>
                </div>
            `).join('')}
        </div>
        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold border-b border-border-color pb-2 mb-4">Education</h2>
            ${data.education.map(edu => `
                <div class="mb-4 last:mb-0">
                    <h3 class="text-lg font-bold text-primary">${edu.degree}</h3>
                    <p class="text-md font-semibold text-secondary">${edu.institution} | ${edu.period}</p>
                    <p class="text-sm text-secondary mt-1">${edu.description}</p>
                </div>
            `).join('')}
        </div>
    `;
}
