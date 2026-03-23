// Firebase configuration for FineFighters
const firebaseConfig = {
    apiKey: "AIzaSyCgMSN9xBJ9iZhgmevdQCB8OM19hMtvYTg",
    authDomain: "pcn-appeal-generator.firebaseapp.com",
    projectId: "pcn-appeal-generator",
    storageBucket: "pcn-appeal-generator.firebasestorage.app",
    messagingSenderId: "487797350039",
    appId: "1:487797350039:web:e79c6ee017fd14c54753d2",
    measurementId: "G-49TJRR76VG"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    
    // Initialize Firestore
    window.db = firebase.firestore();
    
    // Initialize Storage
    window.storage = firebase.storage();
}

// Make config available globally
window.firebaseConfig = firebaseConfig;
