/**
 * Firebase Configuration
 * ======================
 * Uses values from config.js (generated from .env)
 * 
 * IMPORTANT: This file expects js/config.js to be loaded first!
 * Run `npm run build` to generate config.js from .env
 */

// Guard against multiple loads
if (window.firebaseConfigLoaded) {
    console.log('Firebase config already loaded, skipping');
} else {
    window.firebaseConfigLoaded = true;

    // Initialize Firebase using config from config.js
    // config.js must be loaded before this file and sets window.firebaseConfig
    (function() {
        'use strict';
        
        // Get config from window (set by config.js)
        const config = (typeof window !== 'undefined' && window.firebaseConfig) || 
                       (typeof firebaseConfig !== 'undefined' ? firebaseConfig : null);
        
        if (!config) {
            console.warn('Firebase not initialized - config.js may not be loaded. Run: npm run build');
            return;
        }
        
        // Initialize Firebase
        if (typeof firebase !== 'undefined') {
            try {
                // Check if Firebase is already initialized
                if (!firebase.apps.length) {
                    firebase.initializeApp(config);
                }
                
                // Initialize Firestore
                window.db = firebase.firestore();
                
                // Initialize Storage
                window.storage = firebase.storage();
                
                console.log('Firebase initialized for project:', config.projectId);
            } catch (error) {
                console.error('Firebase initialization error:', error);
            }
        } else {
            console.warn('Firebase SDK not loaded');
        }
    })();
}