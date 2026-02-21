// Shared Encryption/Decryption Utilities
// Used across firebase-init.js, admin.js, and other modules requiring password verification.
// Uses PBKDF2 key derivation + AES-256-GCM encryption via the Web Crypto API.

// Encrypted admin verification token (AES-256-GCM with PBKDF2, 100k iterations)
// Plaintext "ADMIN_ACCESS_GRANTED" encrypted with the admin password.
// The password itself is NOT stored anywhere in the code.
const ENCRYPTED_ADMIN_TOKEN = "ZRw4OlM07euFJchExkGtPTaV9RpSDJRzwf1/mhDvmEviarMa+qn9JQYgv6hmUwcNtPpxOZXVfLq41cwiqOe+bw==";

/**
 * Decrypt an AES-256-GCM encrypted base64 string using a password.
 * Format: salt (16 bytes) + iv (12 bytes) + authTag (16 bytes) + encrypted data
 * @param {string} encryptedBase64 - The base64-encoded encrypted data
 * @param {string} password - The password to derive the decryption key
 * @returns {Promise<string|null>} The decrypted string, or null if decryption fails
 */
async function decryptWithPassword(encryptedBase64, password) {
    try {
        // Decode base64
        const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

        // Extract: salt (16 bytes) + iv (12 bytes) + authTag (16 bytes) + encrypted data
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const authTag = combined.slice(28, 44);
        const encrypted = combined.slice(44);

        // Combine encrypted data with auth tag for Web Crypto API
        const encryptedWithTag = new Uint8Array(encrypted.length + authTag.length);
        encryptedWithTag.set(encrypted);
        encryptedWithTag.set(authTag, encrypted.length);

        // Derive key using PBKDF2 (100,000 iterations, SHA-256)
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["decrypt"]
        );

        // Decrypt using AES-256-GCM
        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encryptedWithTag
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}

/**
 * Verify the admin password by attempting to decrypt the admin token.
 * @param {string} password - The password to verify
 * @returns {Promise<boolean>} True if the password is correct
 */
async function verifyAdminPassword(password) {
    const result = await decryptWithPassword(ENCRYPTED_ADMIN_TOKEN, password);
    return result === 'ADMIN_ACCESS_GRANTED';
}

/**
 * Check if the current session has valid admin access.
 * Re-verifies the stored password cryptographically.
 * @returns {Promise<boolean>} True if admin access is valid
 */
async function checkAdminAccess() {
    const password = localStorage.getItem('adminPassword');
    if (!password) return false;
    return await verifyAdminPassword(password);
}
