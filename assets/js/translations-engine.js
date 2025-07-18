// File: /assets/js/translations-engine.js
// Description: Dynamically loads and manages language translations.

let currentTranslations = {};

/**
 * Loads the translation file for a given language.
 * Defaults to English if the requested language is not found.
 * @param {string} lang - The two-letter language code (e.g., 'en', 'xh').
 */
async function loadLanguage(lang = 'en') {
    try {
        // Dynamically import the module for the requested language
        const module = await import(`./translations/${lang}.js`);
        currentTranslations = module.default;
    } catch (error) {
        console.warn(`Translation file for '${lang}' not found. Defaulting to English.`);
        // Fallback to English if the language file fails to load
        const module = await import(`./translations/en.js`);
        currentTranslations = module.default;
    }
}

/**
 * Gets a translated string for a given key.
 * @param {string} key - The key for the translation string (e.g., 'sidebar_overview').
 * @returns {string} The translated string, or the key itself if not found.
 */
function translate(key) {
    return currentTranslations[key] || key;
}

/**
 * Initializes the translation engine and applies translations to the page.
 * @param {string} initialLang - The initial language to load.
 */
export async function initTranslations(initialLang) {
    await loadLanguage(initialLang);
    applyTranslations();
}

/**
 * Finds all elements with a 'data-translate-key' and updates their text.
 */
export function applyTranslations() {
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        element.textContent = translate(key);
    });
}
