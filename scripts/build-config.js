#!/usr/bin/env node

/**
 * Build Configuration Script
 * ==========================
 * Reads .env file and:
 * 1. Generates js/config.js with injected values
 * 2. Replaces __RECAPTCHA_SITE_KEY__ placeholder in HTML files
 * 
 * Usage: npm run build
 * 
 * Required .env variables (VITE_ prefix):
 *   VITE_STRIPE_PUBLISHABLE_KEY
 *   VITE_RECAPTCHA_SITE_KEY
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 *   VITE_FIREBASE_MEASUREMENT_ID
 */

const fs = require('fs');
const path = require('path');

// Try to load dotenv if available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, parse .env manually
}

// Read .env file manually as fallback
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0 && !process.env[key.trim()]) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

// Required environment variables (VITE_ prefix)
const REQUIRED_VARS = [
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_RECAPTCHA_SITE_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
];

// Check for missing variables
const missing = REQUIRED_VARS.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.error('\nCreate .env from .env.example and fill in the values.');
  process.exit(1);
}

const config = {
  STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
  RECAPTCHA_SITE_KEY: process.env.VITE_RECAPTCHA_SITE_KEY,
  FIREBASE: {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
  }
};

// Generate js/config.js
const configContent = `/**
 * Environment Configuration
 * =========================
 * AUTO-GENERATED - DO NOT EDIT
 * 
 * Generated from .env by: npm run build
 * 
 * To change values:
 * 1. Update .env file
 * 2. Run: npm run build
 */

// Guard against multiple loads
if (!window.configLoaded) {
    window.configLoaded = true;

    const ENV_CONFIG = ${JSON.stringify(config, null, 2)};

    // Firebase configuration
    const firebaseConfig = ENV_CONFIG.FIREBASE;

    // Stripe publishable key (safe for frontend)
    const STRIPE_PUBLISHABLE_KEY = ENV_CONFIG.STRIPE_PUBLISHABLE_KEY;

    // reCAPTCHA site key (safe for frontend)  
    const RECAPTCHA_SITE_KEY = ENV_CONFIG.RECAPTCHA_SITE_KEY;

    // Make available globally
    if (typeof window !== 'undefined') {
      window.ENV_CONFIG = ENV_CONFIG;
      window.firebaseConfig = firebaseConfig;
      window.STRIPE_PUBLISHABLE_KEY = STRIPE_PUBLISHABLE_KEY;
      window.RECAPTCHA_SITE_KEY = RECAPTCHA_SITE_KEY;
    }
}
`;

const configPath = path.join(__dirname, '..', 'js', 'config.js');
fs.writeFileSync(configPath, configContent);

console.log('✅ Generated js/config.js from .env');
console.log('');
console.log('   Stripe Key:', config.STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...');
console.log('   reCAPTCHA Key:', config.RECAPTCHA_SITE_KEY?.substring(0, 10) + '...');
console.log('   Firebase Project:', config.FIREBASE.projectId);

// Replace __RECAPTCHA_SITE_KEY__ placeholder in HTML files
const projectRoot = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(projectRoot)
  .filter(file => file.endsWith('.html'));

let replacedCount = 0;
htmlFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('__RECAPTCHA_SITE_KEY__')) {
    content = content.replace(/__RECAPTCHA_SITE_KEY__/g, config.RECAPTCHA_SITE_KEY);
    fs.writeFileSync(filePath, content);
    console.log(`   Updated: ${file}`);
    replacedCount++;
  }
});

if (replacedCount > 0) {
  console.log(`\n✅ Updated ${replacedCount} HTML file(s) with reCAPTCHA site key`);
}

console.log('\nBuild complete! Ready to deploy.');