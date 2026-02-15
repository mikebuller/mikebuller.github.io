// Shared Firebase Initialization Script
// Used by index.html, live-scores.html, and rounds.html

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, deleteField, query, where, orderBy, onSnapshot, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Encrypted Firebase configuration (AES-256-GCM with PBKDF2 key derivation, 100k iterations)
const ENCRYPTED_CONFIG = "uKM6aVSB3RZSzPonDOS99pGpViMTWGDeVcpAhaN129HBEeUmEosPOI6vk3sMgpKmLSrWelZalynmgqJOfhFgyz3v+7I6y76nMOVCItP4VTep2pDzi9MZWynRqjo4nZPBa0DVzdWGJ2Gm+JAZ2lV8wNS6so0Qi4jAG0tebqoD/uIMxblgw3Kk5JfeDsgSiaBaG4PzHc7jO7oZNQ09+gZSYNxjPQGMydyAs2WNEf1Ix7slo4ERoYkIf5vSgdKCeJ9+fQh68wf8P6oYfu5sh86VT03QrCvBB9YB5F+/fodm40QaN3rlGDMc5GxPAzarcrM3sSKyxE0IHUIRK/HmP8kjB5n9cLT6YW2BwDLa6xb/mZmjpQGtls/0rFv6K2OndnMtZNX4dOKWHty3QqKi7GKJGoRE78beu5SDjKPPpN1HygQTfm7NSD8eXVCR1zjPXHDhU9I=";

// Decrypt Firebase config using password with PBKDF2 + AES-GCM
async function decryptConfig(password) {
    try {
        // Decode base64
        const combined = Uint8Array.from(atob(ENCRYPTED_CONFIG), c => c.charCodeAt(0));
        
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
        return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}

// Initialize Firebase with password prompt
async function initializeFirebase() {
    // Check if password is stored in localStorage
    let password = localStorage.getItem('fbPassword');
    
    if (!password) {
        password = prompt('Enter password to access live scoring features:');
        if (!password) {
            console.log('No password provided, Firebase features disabled');
            return false;
        }
    }
    
    const firebaseConfig = await decryptConfig(password);
    
    if (!firebaseConfig) {
        localStorage.removeItem('fbPassword');
        alert('Invalid password. Please refresh the page and try again.');
        return false;
    }
    
    // Store password for session
    localStorage.setItem('fbPassword', password);
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Make Firestore available globally
    window.db = db;
    window.firestoreHelpers = { 
        collection, 
        doc, 
        getDoc, 
        getDocs, 
        setDoc, 
        updateDoc, 
        deleteDoc,
        deleteField, 
        query, 
        where, 
        orderBy, 
        onSnapshot,
        arrayUnion
    };
    
    console.log('Firebase initialized successfully');
    
    // Call page-specific initialization if defined
    if (typeof window.onFirebaseReady === 'function') {
        window.onFirebaseReady();
    }
    
    return true;
}

// Initialize on load
initializeFirebase();
