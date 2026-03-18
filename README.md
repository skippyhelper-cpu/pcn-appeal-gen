# PCN Appeal Generator

A simple web application that generates PCN (Penalty Charge Notice) appeal letters for UK parking tickets.

## Features

- **Simple Form**: Enter PCN details, vehicle registration, and circumstances
- **10 Static Templates**: Professional appeal letters for common contravention codes
- **Payment Integration**: £2.99 per letter via Stripe
- **PDF Generation**: Client-side PDF generation with jsPDF
- **Duplicate Prevention**: Checks if PCN reference has already been paid
- **Mobile Responsive**: Works on all devices

## Tech Stack

- **Frontend**: HTML, Tailwind CSS (CDN), Vanilla JavaScript
- **Backend**: Firebase Cloud Functions (minimal)
- **Database**: Firestore
- **Hosting**: Firebase Hosting
- **Payment**: Stripe
- **CAPTCHA**: hCaptcha
- **PDF**: jsPDF

## Project Structure

```
pcn-appeal/
├── index.html              # Main application page
├── js/
│   ├── app.js              # Main application logic
│   ├── firebase-config.js  # Firebase configuration
│   ├── pdf-generator.js    # PDF generation with jsPDF
│   └── templates.js        # 10 static appeal templates
├── functions/              # Firebase Cloud Functions
│   ├── index.js            # Stripe webhook & checkout
│   └── package.json
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Stripe account
- hCaptcha account (free)

### 2. Firebase Setup

```bash
# Login to Firebase
firebase login

# Create a new Firebase project or use existing
firebase projects:create pcn-appeal-generator

# Initialize Firebase in the project directory
firebase init

# Select: Hosting, Firestore, Functions
```

### 3. Configure Firebase

Edit `js/firebase-config.js` with your Firebase project config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 4. Stripe Setup

1. Get your Stripe API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Set Stripe secrets in Firebase:

```bash
firebase functions:config:set stripe.secret_key="sk_live_..." stripe.webhook_secret="whsec_..."
```

3. Update `js/app.js` with your Stripe public key:

```javascript
stripe = Stripe('pk_live_...');
```

### 5. hCaptcha Setup

1. Get your hCaptcha keys from [hCaptcha](https://www.hcaptcha.com/)
2. Update the hCaptcha sitekey in `index.html`:

```html
<div class="h-captcha" data-sitekey="YOUR_HCAPTCHA_SITEKEY"></div>
```

### 6. Deploy

```bash
# Deploy to Firebase
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
```

## Contravention Codes Supported

| Code | Description |
|------|-------------|
| 01 | Parked in a restricted street during prescribed hours |
| 02 | Parked in a loading restricted street |
| 11 | Parked without payment of parking charge |
| 12 | Parked in residents' parking without permit |
| 16 | Parked in permit space without permit |
| 21 | Parked in a suspended bay/space |
| 25 | Parked in a loading place during restricted hours |
| 30 | Parked for longer than permitted |
| 31 | Stopped in a box junction |
| 34 | Being in a bus lane |
| 47 | Stopped on a restricted bus stop |

## Local Development

```bash
# Serve locally with Firebase emulators
firebase emulators:start

# Or just open index.html in browser for frontend testing
# (Note: Firebase/Firebase features won't work without proper config)
```

## Testing Payments

Use Stripe test mode and test cards:
- `4242 4242 4242 4242` - Success
- `4000 0000 0000 0002` - Decline
- `4000 0025 0000 3155` - 3D Secure

## Environment Variables

Required Firebase Functions config:

```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_..." \
  stripe.webhook_secret="whsec_..."
```

## Security Notes

- Never commit API keys to version control
- Use Firebase environment variables for secrets
- Restrict Firestore rules in production
- Enable Stripe webhook signature verification

## License

MIT License - See LICENSE file for details

## Support

For issues with PCN appeals, contact the issuing council directly. This tool provides template letters only and does not constitute legal advice.