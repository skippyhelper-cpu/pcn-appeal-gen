/**
 * Firebase Configuration
 * ======================
 * Uses values from config.js (generated from .env)
 * 
 * IMPORTANT: This file expects js/config.js to be loaded first!
 * Run `npm run build` to generate config.js from .env
 */

// Use config from build process (js/config.js must be loaded before this)
// Fallback to window.firebaseConfig if already set by config.js
if (typeof firebaseConfig === 'undefined' && typeof window !== 'undefined' && window.firebaseConfig) {
    var firebaseConfig = window.firebaseConfig;
}

// Initialize Firebase
if (typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    
    // Initialize Firestore
    window.db = firebase.firestore();
    
    // Initialize Storage
    window.storage = firebase.storage();
    
    console.log('Firebase initialized for project:', firebaseConfig.projectId);
} else {
    console.warn('Firebase not initialized - config.js may not be loaded. Run: npm run build');
}
