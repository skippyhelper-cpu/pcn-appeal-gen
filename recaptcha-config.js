/**
 * Google reCAPTCHA v3 Configuration
 * ==================================
 * Uses RECAPTCHA_SITE_KEY from config.js (generated from .env)
 * 
 * IMPORTANT: This file expects js/config.js to be loaded first!
 * Run `npm run build` to generate config.js from .env
 */

// Get site key from config.js (loaded before this file)
const RECAPTCHA_SITE_KEY = window.RECAPTCHA_SITE_KEY || '__RECAPTCHA_SITE_KEY__';

// Execute reCAPTCHA on form submit
function executeRecaptcha(action) {
    return new Promise((resolve, reject) => {
        if (typeof grecaptcha === 'undefined') {
            reject(new Error('reCAPTCHA not loaded'));
            return;
        }
        grecaptcha.ready(function() {
            grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: action})
                .then(function(token) {
                    resolve(token);
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    });
}

// Log warning if using placeholder
if (RECAPTCHA_SITE_KEY === '__RECAPTCHA_SITE_KEY__') {
    console.warn('reCAPTCHA not configured - run: npm run build');
}
