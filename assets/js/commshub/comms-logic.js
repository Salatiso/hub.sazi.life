// File: /assets/js/commshub/comms-logic.js
// Contains business logic for the CommsHub, like parsing imported chats.

/**
 * Parses an exported WhatsApp chat file (.txt).
 * @param {string} textContent - The raw string content of the .txt file.
 * @returns {Array} An array of structured message objects.
 */
export function parseWhatsAppChat(textContent) {
    const messages = [];
    // Regex to capture date, time, sender, and message content. Handles multi-line messages.
    const regex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}) - ([^:]+): ([\s\S]+?)(?=\n\d{1,2}\/\d{1,2}\/\d{2,4},|\n\n|$)/gm;
    
    let match;
    while ((match = regex.exec(textContent)) !== null) {
        messages.push({
            timestamp: match[1].trim(),
            sender: match[2].trim(),
            content: match[3].trim()
        });
    }

    return messages;
}
