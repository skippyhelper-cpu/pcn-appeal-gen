# PCN Appeal Generator - Project Documentation

**Last Updated:** March 25, 2026  
**Status:** Production Ready (80% Complete)  
**Live URL:** https://pcn-appeal-generator.web.app  
**Brand:** FineFighters (finefighters.co.uk)

---

## 1. Project Overview

The PCN (Penalty Charge Notice) Appeal Generator is a web application that generates professional appeal letters for UK parking tickets. Users pay £2.99 per letter via Stripe, fill in their PCN details, and receive a professionally formatted PDF appeal letter.

### Key Features
- **10 Static Templates:** Professional appeal letters for all common contravention codes
- **Payment Integration:** Stripe Checkout with £2.99 pricing
- **PDF Generation:** Client-side (jsPDF) and server-side (Puppeteer/Chromium)
- **Evidence Upload:** Firebase Storage for photos/documents (embedded in PDFs)
- **Duplicate Prevention:** PCN reference tracking via Firestore
- **Email Delivery:** Resend API for confirmation emails with PDF attachments
- **Rate Limiting:** IP-based rate limiting (10 req/min)
- **GDPR Compliant:** 30-day auto-cleanup of old data

---

## 2. Architecture & Tech Stack

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Vanilla JavaScript (ES6+) | No framework overhead |
| **Styling** | Tailwind CSS (CDN) | Responsive design |
| **PDF Generation** | jsPDF + html2canvas | Client-side PDF downloads |
| **Storage** | Firebase Storage | Evidence image uploads |
| **CAPTCHA** | Google reCAPTCHA v3 | Bot protection |

### Backend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Platform** | Firebase Cloud Functions (v2) | Serverless backend |
| **Runtime** | Node.js 20 | Cloud Functions runtime |
| **Database** | Firestore | Appeal and payment records |
| **PDF Generation** | Puppeteer + Chromium | Server-side PDF rendering |
| **Email** | Resend API | Transactional emails |
| **Payment** | Stripe Checkout | Payment processing |

### Infrastructure
| Component | Provider | Purpose |
|-----------|----------|---------|
| **Hosting** | Firebase Hosting | Static site hosting |
| **CDN** | Firebase | Global content delivery |
| **Secrets** | Firebase Secret Manager | API key storage |
| **Domain** | IONOS | finefighters.co.uk |

---

## 3. File Structure

```
pcn-appeal/
│
├── index.html              # Main application (3-step wizard)
├── app.html               # Alternate entry point
├── success.html           # Post-payment download page
├── payment.html           # Payment processing page
├── preview.html           # PDF preview page
├── test.html              # Local testing (no Firebase)
├── faq.html               # FAQ page
├── feedback.html          # User feedback form
├── privacy.html           # Privacy policy
├── terms.html             # Terms of service
├── favicon.svg            # Site icon
│
├── css/
│   ├── styles.css         # Custom styles
│   ├── tailwind-config.js # Tailwind configuration
│   └── tailwind-config-preview.js
│
├── js/
│   ├── app.js             # Main application logic (~400 lines)
│   ├── firebase-config.js # Firebase initialization
│   ├── pdf-generator.js   # PDF generation with jsPDF (~210 lines)
│   ├── templates.js       # 10 static appeal templates (~680 lines)
│   ├── config.js          # Generated from .env (git-ignored)
│   ├── recaptcha-config.js # reCAPTCHA configuration
│   └── utils.js           # Utility functions
│
├── functions/             # Firebase Cloud Functions
│   ├── index.js           # Main functions (checkout, webhook, email)
│   ├── package.json       # Function dependencies
│   └── node_modules/      # Function dependencies
│
├── scripts/               # Build and utility scripts
│   └── build-config.js    # Environment variable builder
│
├── public/                # Static assets
│
├── template_files_extracted/  # Original template sources
│   └── pcn_templates/
│
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── storage.rules          # Firebase Storage rules
│
├── .env                   # Environment variables (git-ignored)
├── .env.example           # Environment template
├── .gitignore             # Git exclusions
│
├── README.md              # Project overview
├── BUILD_COMPLETE.md      # Build completion summary
├── BUILD_PLAN.md          # Original build plan
├── DEPLOYMENT.md          # Deployment checklist
├── PCN_APPEAL_SRS_v2.md   # Requirements specification
├── ENV_SETUP.md           # Environment setup guide
├── EVIDENCE_IMAGES_FIX.md # Evidence embedding documentation
├── CIPHER_CONTEXT.md      # Development context for Cipher
│
└── PROJECT_DOCUMENTATION.md  # This file
```

---

## 4. How It Works

### 4.1 User Flow

```
Landing Page (index.html)
    ↓
Step 1: Enter PCN Details
  - PCN Reference, Vehicle Reg, Council
  - Contravention Code, Date, Time, Location
  - Circumstances description
  - Evidence file upload (Firebase Storage)
    ↓
[Check: PCN already paid?]
    ↓ Yes → Show "Already paid" message
    ↓ No
Step 2: Review & CAPTCHA
  - Review entered details
  - Complete reCAPTCHA v3
    ↓
Step 3: Payment
  - Stripe Checkout session
  - £2.99 charge
    ↓
[Stripe Webhook]
    ↓
Success Page (success.html)
  - Generate/download PDF
  - Email sent with PDF attachment
```

### 4.2 Data Flow

1. **Appeal Creation:** User submits form → Firestore document created
2. **Duplicate Check:** Cloud Function checks if PCN ref already paid
3. **Payment:** Stripe Checkout session created → User pays
4. **Webhook:** Stripe webhook marks appeal as paid
5. **PDF Generation:** Server-side PDF generated with Puppeteer
6. **Email:** Resend API sends confirmation with PDF attachment
7. **Download:** Client can also download PDF via jsPDF

### 4.3 Database Schema

**Collection: `appeals`**
```javascript
{
  pcnRef: string,              // PCN reference number
  vehicleReg: string,          // Vehicle registration
  council: string,             // Issuing council
  contraventionCode: string,   // Code (01, 02, 11, etc.)
  contraventionDate: string,   // YYYY-MM-DD
  contraventionTime: string,   // HH:MM
  location: string,            // Location of contravention
  circumstances: string,       // User's explanation
  country: string,             // 'england' or 'wales'
  
  // Applicant details
  email: string,
  applicantName: string,
  applicantAddress: string,
  applicantPostcode: string,
  
  // Evidence
  evidenceFiles: array,        // Array of {url, name, type}
  evidenceDescriptions: string, // User descriptions of evidence
  
  // Payment status
  paid: boolean,
  paidAt: timestamp,
  stripeSessionId: string,
  stripePaymentId: string,
  paymentInitiatedAt: timestamp,
  
  // Metadata
  createdAt: timestamp,
  letterGenerated: boolean,
  appealId: string             // Document ID
}
```

**Collection: `payments`**
```javascript
{
  appealId: string,
  pcnRef: string,
  email: string,
  amount: number,              // 299 (pence)
  currency: string,            // 'gbp'
  stripePaymentId: string,
  stripeSessionId: string,
  createdAt: timestamp
}
```

**Collection: `feedback`**
```javascript
{
  message: string,
  createdAt: timestamp
}
```

---

## 5. Cloud Functions

### 5.1 `createCheckoutSession`
- **Trigger:** HTTP POST
- **Purpose:** Create Stripe Checkout session
- **Rate Limit:** 10 requests/minute per IP
- **Input:** `appealId`, `email`, `pcnRef`
- **Output:** `{ sessionId, url }`

### 5.2 `stripeWebhook`
- **Trigger:** HTTP POST (Stripe webhook)
- **Purpose:** Handle payment events
- **Events:**
  - `checkout.session.completed` → Mark paid, send email
  - `payment_intent.payment_failed` → Mark failed, send failure email
- **
Output:** `{ received: true }`
- **Memory:** 1GB, Timeout: 120s

### 5.3 `getAppeal`
- **Trigger:** HTTP GET
- **Purpose:** Retrieve appeal data after payment
- **Query Param:** `appeal=<appealId>`
- **Auth:** Checks `paid` flag server-side
- **Output:** Appeal data (excludes sensitive fields)

### 5.4 `sendConfirmationEmail`
- **Trigger:** Called internally from webhook
- **Purpose:** Send email with PDF attachment
- **PDF Generation:** Puppeteer + Chromium (serverless)
- **Email Provider:** Resend API
- **Attachments:** PDF with embedded evidence images

### 5.5 `cleanupOldAppeals`
- **Trigger:** Scheduled (every 24 hours)
- **Purpose:** GDPR compliance - delete old data
- **Retention:** 30 days
- **Cleans:** `appeals`, `payments` collections

### 5.6 `resendConfirmationEmail`
- **Trigger:** HTTP GET
- **Purpose:** Resend email if user requests
- **Query Param:** `appealId=<id>`

### 5.7 `testBypassPayment` (Development Only)
- **Trigger:** HTTP POST
- **Purpose:** Bypass payment in emulator mode
- **Security:** Only works with `FUNCTIONS_EMULATOR=true`
- **Requires:** `testSecret` matching `TEST_BYPASS_SECRET`

---

## 6. Environment Configuration

### 6.1 Frontend Variables (.env)
```bash
# Stripe
STRIPE_PUBLIC_KEY=pk_live_...

# reCAPTCHA
RECAPTCHA_SITE_KEY=...

# Firebase (public config)
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

### 6.2 Backend Secrets (Firebase Secret Manager)
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set RECAPTCHA_SECRET_KEY
firebase functions:secrets:set TEST_BYPASS_SECRET  # Dev only
```

### 6.3 Build Process
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Fill in your keys

# 3. Build configuration
npm run build

# 4. Deploy
firebase deploy
```

---

## 7. Security Measures

### 7.1 Input Validation
All user inputs are validated server-side:
- **XSS Protection:** HTML escaping with `escapeHtml()`
- **Injection Prevention:** Sanitization removes `<`, `>`, `javascript:`, event handlers
- **Length Limits:** All fields have min/max length constraints
- **Format Validation:** Email regex, date parsing, contravention code validation

### 7.2 Rate Limiting
- **In-Memory Store:** Tracks requests per IP
- **Window:** 60 seconds
- **Limit:** 10 requests per minute per IP
- **Response:** 429 Too Many Requests

### 7.3 Firestore Rules
- **Appeals:** Public create (before payment), read requires payment check
- **Payments:** No client access (Cloud Functions only)
- **Feedback:** Public create, admin-only read
- **No Direct Updates:** All updates via Cloud Functions

### 7.4 Stripe Security
- **Webhook Verification:** Signature validation with `stripe.webhooks.constructEvent()`
- **Metadata:** Appeal ID stored in Stripe session for reconciliation
- **Test Mode:** Test keys for development

### 7.5 CORS
- **Origin:** `*` (public API)
- **Methods:** Restricted to POST/GET as appropriate
- **Credentials:** Not required

---

## 8. Contravention Codes Supported

| Code | Description | Template Focus |
|------|-------------|----------------|
| **01** | Parked in restricted street | Signage issues, loading exemption |
| **02** | Parked in loading restricted street | Active loading, signage |
| **05** | Paid parking time expired | Payment validation, machine issues |
| **06** | No valid pay-and-display ticket | Pay-by-phone, machine issues |
| **11** | Parked without payment | Cashless parking, signs |
| **12** | No permit in residents' bay | Permit validity, not displayed |
| **16** | No permit in permit space | Permit held, technical issues |
| **21** | Parked in suspended bay | Suspension unclear, signage |
| **25** | Parked in loading place | Active loading, bay markings |
| **30** | Parked longer than permitted | Circumstances, emergency |
| **31** | Stopped in box junction | Exit clear, traffic conditions |
| **34** | Bus lane violation | Operating hours, signage |
| **40** | Blue badge issues | Badge display, disabled bay |
| **45** | Taxi rank violation | Dropping off, rank markings |
| **47** | Bus stop/stand violation | Reason for stopping, signs |
| **62** | Wheels on footpath | Vehicle position, narrow roads |

### Country Variations
- **England:** Traffic Management Act 2004, 2007 Regulations
- **Wales:** Traffic Management Act 2004, 2008 (Wales) Regulations

---

## 9. PDF Generation

### 9.1 Client-Side (jsPDF)
**File:** `js/pdf-generator.js`
- **Library:** jsPDF + autoTable plugin
- **Process:** HTML → Canvas → PDF
- **Evidence:** Base64 image embedding
- **Fallback:** Server-side PDF if CORS issues

### 9.2 Server-Side (Puppeteer)
**Function:** `generatePDF()` in `functions/index.js`
- **Browser:** Puppeteer + Chromium (serverless)
- **Process:** HTML → PDF (A4, 25mm margins)
- **Evidence:** Fetched from Firebase Storage, base64 embedded
- **Advantage:** No CORS issues, more reliable

### 9.3 Evidence Image Handling
```javascript
// Fetch image from Firebase Storage
const fetchImageAsBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};
```

---

## 10. Known Issues & Limitations

### 10.1 Current Limitations
1. **No User Accounts:** Payment = authentication, no persistent user profiles
2. **Single Country:** Primarily England (basic Wales support)
3. **Static Templates:** No AI generation, 16 pre-written templates
4. **No Appeals Tracking:** Users can't track appeal status after sending
5. **Email Only:** No SMS or push notifications

### 10.2 Technical Debt
1. **CORS Issues:** Client-side PDF may fail with Firebase Storage CORS
2. **Rate Limiting:** In-memory store (resets on function cold start)
3. **Image Resizing:** No server-side image optimization
4. **No CDN for PDFs:** Generated on-demand every time

### 10.3 Incomplete Features
1. **hCaptcha:** Placeholder key in place (using reCAPTCHA v3 instead)
2. **Webhook Testing:** Local webhook testing requires Stripe CLI
3. **Analytics:** No tracking/integration (Google Analytics, etc.)

---

## 11. Deployment Checklist

### Pre-Deployment
- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Firebase Storage enabled
- [ ] Stripe account configured
- [ ] Resend account configured
- [ ] reCAPTCHA keys generated
- [ ] Domain configured (IONOS → Firebase)

### Configuration
- [ ] `.env` file created with all keys
- [ ] Firebase config updated
- [ ] Stripe secrets set via CLI
- [ ] Resend API key set
- [ ] reCAPTCHA keys configured

### Testing
- [ ] Local emulator testing
- [ ] Test payment with Stripe test card (4242 4242 4242 4242)
- [ ] PDF generation works
- [ ] Email delivers with attachment
- [ ] Evidence images embed correctly
- [ ] Duplicate PCN detection works

### Production
- [ ] Deploy to Firebase Hosting
- [ ] Deploy Cloud Functions
- [ ] Configure Stripe webhook URL
- [ ] Test live payment
- [ ] Verify email delivery
- [ ] Check Firestore rules

---

## 12. Maintenance

### 12.1 Regular Tasks
- **Daily:** Monitor Firebase Functions logs
- **Weekly:** Check Stripe dashboard for failed payments
- **Monthly:** Review Firestore storage usage
- **Quarterly:** Update dependencies (`npm audit fix`)

### 12.2 Monitoring
- **Firebase Console:** Functions, Firestore, Hosting
- **Stripe Dashboard:** Payments, webhooks, disputes
- **Resend Dashboard:** Email delivery rates
- **Google Cloud:** Billing, quotas

### 12.3 Backup
- **Firestore:** Automated daily backups

Output:** `{ received: true }`
- **Memory:** 1GB, Timeout: 120s

### 5.3 `getAppeal`
- **Trigger:** HTTP GET
- **Purpose:** Retrieve appeal data after payment
- **Query Param:** `appeal=<appealId>`
- **Auth:** Checks `paid` flag server-side
- **Output:** Appeal data (excludes sensitive fields)

### 5.4 `sendConfirmationEmail`
- **Trigger:** Called internally from webhook
- **Purpose:** Send email with PDF attachment
- **PDF Generation:** Puppeteer + Chromium (serverless)
- **Email Provider:** Resend API
- **Attachments:** PDF with embedded evidence images

### 5.5 `cleanupOldAppeals`
- **Trigger:** Scheduled (every 24 hours)
- **Purpose:** GDPR compliance - delete old data
- **Retention:** 30 days
- **Cleans:** `appeals`, `payments` collections

### 5.6 `resendConfirmationEmail`
- **Trigger:** HTTP GET
- **Purpose:** Resend email if user requests
- **Query Param:** `appealId=<id>`

### 5.7 `testBypassPayment` (Development Only)
- **Trigger:** HTTP POST
- **Purpose:** Bypass payment in emulator mode
- **Security:** Only works with `FUNCTIONS_EMULATOR=true`
- **Requires:** `testSecret` matching `TEST_BYPASS_SECRET`

---

## 6. Environment Configuration

### 6.1 Frontend Variables (.env)
```bash
# Stripe
STRIPE_PUBLIC_KEY=pk_live_...

# reCAPTCHA
RECAPTCHA_SITE_KEY=...

# Firebase (public config)
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

### 6.2 Backend Secrets (Firebase Secret Manager)
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set RECAPTCHA_SECRET_KEY
firebase functions:secrets:set TEST_BYPASS_SECRET  # Dev only
```

### 6.3 Build Process
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Fill in your keys

# 3. Build configuration
npm run build

# 4. Deploy
firebase deploy
```

---

## 7. Security Measures

### 7.1 Input Validation
All user inputs are validated server-side:
- **XSS Protection:** HTML escaping with `escapeHtml()`
- **Injection Prevention:** Sanitization removes `<`, `>`, `javascript:`, event handlers
- **Length Limits:** All fields have min/max length constraints
- **Format Validation:** Email regex, date parsing, contravention code validation

### 7.2 Rate Limiting
- **In-Memory Store:** Tracks requests per IP
- **Window:** 60 seconds
- **Limit:** 10 requests per minute per IP
- **Response:** 429 Too Many Requests

### 7.3 Firestore Rules
- **Appeals:** Public create (before payment), read requires payment check
- **Payments:** No client access (Cloud Functions only)
- **Feedback:** Public create, admin-only read
- **No Direct Updates:** All updates via Cloud Functions

### 7.4 Stripe Security
- **Webhook Verification:** Signature validation with `stripe.webhooks.constructEvent()`
- **Metadata:** Appeal ID stored in Stripe session for reconciliation
- **Test Mode:** Test keys for development

### 7.5 CORS
- **Origin:** `*` (public API)
- **Methods:** Restricted to POST/GET as appropriate
- **Credentials:** Not required

---

## 8. Contravention Codes Supported

| Code | Description | Template Focus |
|------|-------------|----------------|
| **01** | Parked in restricted street | Signage issues, loading exemption |
| **02** | Parked in loading restricted street | Active loading, signage |
| **05** | Paid parking time expired | Payment validation, machine issues |
| **06** | No valid pay-and-display ticket | Pay-by-phone, machine issues |
| **11** | Parked without payment | Cashless parking, signs |
| **12** | No permit in residents' bay | Permit validity, not displayed |
| **16** | No permit in permit space | Permit held, technical issues |
| **21** | Parked in suspended bay | Suspension unclear, signage |
| **25** | Parked in loading place | Active loading, bay markings |
| **30** | Parked longer than permitted | Circumstances, emergency |
| **31** | Stopped in box junction | Exit clear, traffic conditions |
| **34** | Bus lane violation | Operating hours, signage |
| **40** | Blue badge issues | Badge display, disabled bay |
| **45** | Taxi rank violation | Dropping off, rank markings |
| **47** | Bus stop/stand violation | Reason for stopping, signs |
| **62** | Wheels on footpath | Vehicle position, narrow roads |

### Country Variations
- **England:** Traffic Management Act 2004, 2007 Regulations
- **Wales:** Traffic Management Act 2004, 2008 (Wales) Regulations

---

## 9. PDF Generation

### 9.1 Client-Side (jsPDF)
**File:** `js/pdf-generator.js`
- **Library:** jsPDF + autoTable plugin
- **Process:** HTML → Canvas → PDF
- **Evidence:** Base64 image embedding
- **Fallback:** Server-side PDF if CORS issues

### 9.2 Server-Side (Puppeteer)
**Function:** `generatePDF()` in `functions/index.js`
- **Browser:** Puppeteer + Chromium (serverless)
- **Process:** HTML → PDF (A4, 25mm margins)
- **Evidence:** Fetched from Firebase Storage, base64 embedded
- **Advantage:** No CORS issues, more reliable

### 9.3 Evidence Image Handling
```javascript
// Fetch image from Firebase Storage
const fetchImageAsBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};
```

---

## 10. Known Issues & Limitations

### 10.1 Current Limitations
1. **No User Accounts:** Payment = authentication, no persistent user profiles
2. **Single Country:** Primarily England (basic Wales support)
3. **Static Templates:** No AI generation, 16 pre-written templates
4. **No Appeals Tracking:** Users can't track appeal status after sending
5. **Email Only:** No SMS or push notifications

### 10.2 Technical Debt
1. **CORS Issues:** Client-side PDF may fail with Firebase Storage CORS
2. **Rate Limiting:** In-memory store (resets on function cold start)
3. **Image Resizing:** No server-side image optimization
4. **No CDN for PDFs:** Generated on-demand every time

### 10.3 Incomplete Features
1. **hCaptcha:** Placeholder key in place (using reCAPTCHA v3 instead)
2. **Webhook Testing:** Local webhook testing requires Stripe CLI
3. **Analytics:** No tracking/integration (Google Analytics, etc.)

---

## 11. Deployment Checklist

### Pre-Deployment
- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Firebase Storage enabled
- [ ] Stripe account configured
- [ ] Resend account configured
- [ ] reCAPTCHA keys generated
- [ ] Domain configured (IONOS → Firebase)

### Configuration
- [ ] `.env` file created with all keys
- [ ] Firebase config updated
- [ ] Stripe secrets set via CLI
- [ ] Resend API key set
- [ ] reCAPTCHA keys configured

### Testing
- [ ] Local emulator testing
- [ ] Test payment with Stripe test card (4242 4242 4242 4242)
- [ ] PDF generation works
- [ ] Email delivers with attachment
- [ ] Evidence images embed correctly
- [ ] Duplicate PCN detection works

### Production
- [ ] Deploy to Firebase Hosting
- [ ] Deploy Cloud Functions
- [ ] Configure Stripe webhook URL
- [ ] Test live payment
- [ ] Verify email delivery
- [ ] Check Firestore rules

---

## 12. Maintenance

### 12.1 Regular Tasks
- **Daily:** Monitor Firebase Functions logs
- **Weekly:** Check Stripe dashboard for failed payments
- **Monthly:** Review Firestore storage usage
- **Quarterly:** Update dependencies (`npm audit fix`)

### 12.2 Monitoring
- **Firebase Console:** Functions, Firestore, Hosting
- **Stripe Dashboard:** Payments, webhooks, disputes
- **Resend Dashboard:** Email delivery rates
- **Google Cloud:** Billing, quotas

### 12.3 Backup
- **Firestore:** Automated daily backups via Google Cloud
- **Code:** GitHub repository (skippy-backup)

---

## 13. Where It Ended - Current State (March 2026)

### 13.1 What's Working
✅ **Core Flow:** Complete end-to-end from form submission to PDF download  
✅ **Payment Processing:** Stripe Checkout fully functional  
✅ **PDF Generation:** Both client-side and server-side working  
✅ **Email Delivery:** Resend API sending confirmation emails with PDF attachments  
✅ **Evidence Images:** Upload to Firebase Storage, embed in PDFs  
✅ **Duplicate Prevention:** PCN reference tracking prevents double-payment  
✅ **Security:** Rate limiting, input validation, XSS protection  
✅ **Firestore Rules:** Proper access control  
✅ **GDPR Compliance:** 30-day auto-cleanup  
✅ **Mobile Responsive:** Works on all device sizes  

### 13.2 What's Not Complete
⚠️ **hCaptcha Integration:** Placeholder key in place, using reCAPTCHA v3 instead  
⚠️ **IONOS Domain:** DNS verification pending for finefighters.co.uk  
⚠️ **Webhook Configuration:** Stripe webhook needs final configuration  
⚠️ **Production Secrets:** Some secrets need rotation/confirmation  
⚠️ **Load Testing:** Not tested under high traffic  
⚠️ **Analytics:** No tracking implemented  

### 13.3 Outstanding Tasks
1. **DNS Verification:** Complete IONOS domain setup for finefighters.co.uk
2. **Webhook Finalization:** Confirm Stripe webhook URL in production
3. **CAPTCHA Switch:** Replace reCAPTCHA with hCaptcha or finalize reCAPTCHA
4. **Documentation Review:** Ensure all env vars are documented
5. **Security Audit:** Review all secrets and rotate if needed
6. **Monitoring Setup:** Add error alerting (Sentry or similar)

### 13.4 Code Statistics
- **Total Lines:** ~2,500 lines (HTML, JS, CSS)
- **Core Files:** 8 HTML pages, 6 JS modules
- **Cloud Functions:** 7 functions
- **Templates:** 16 contravention code templates (England + Wales)
- **Dependencies:** Minimal (vanilla JS, no framework)

### 13.5 Repository
- **Location:** `/home/filip/.openclaw/workspace/projects/pcn-appeal/`
- **Git:** Initialized, regular commits
- **Backup:** GitHub (skippy-backup repo)
- **Firebase Project:** pcn-appeal-generator

### 13.6 Key Files Reference
| File | Purpose | Status |
|------|---------|--------|
| `index.html` | Main application | ✅ Complete |
| `success.html` | Post-payment page | ✅ Complete |
| `js/app.js` | Main logic | ✅ Complete |
| `js/templates.js` | 16 appeal templates | ✅ Complete |
| `js/pdf-generator.js` | PDF generation | ✅ Complete |
| `functions/index.js` | Cloud Functions | ✅ Complete |
| `firestore.rules` | Security rules | ✅ Complete |
| `.env` | Environment vars | ⚠️ Needs review |

### 13.7 Last Work Completed (March 24, 2026)
**Evidence Images Fix:**
- Fixed missing evidence images in PDFs
- Added server-side image fetching with Puppeteer
- Base64 embedding for reliable image inclusion
- Updated success.html to include evidenceFiles in formData
- Enhanced error handling for image fetch failures

**Files Modified:**
- `success.html` - Added evidenceFiles to window.formData
- `functions/index.js` - Added fetchImageAsBase64, updated generateAppealLetterHTML
- `js/pdf-generator.js` - Enhanced image handling and CORS fallback

---

## 14. For Future Developers

### 14.1 Getting Started
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in keys
3. Run `npm install` in `functions/` directory
4. Start Firebase emulators: `firebase emulators:start`
5. Open `test.html` for local testing

### 14.2 Common Issues
**Issue:** PDF images not showing  
**Fix:** Check Firebase Storage CORS configuration or use server-side PDF

**Issue:** Stripe webhook not firing  
**Fix:** Verify webhook URL in Stripe Dashboard matches deployed function URL

**Issue:** Rate limiting false positives  
**Fix:** In-memory store resets on cold starts, consider Firestore-backed rate limiting

### 14.3 Adding New Contravention Codes
1. Add code to `VALID_CONTRAVENTION_CODES` array in `functions/index.js`
2. Add template to `templates.england` and `templates.wales` objects
3. Update dropdown in `index.html`
4. Test PDF generation with new code

### 14.4 Modifying Email Templates
**File:** `functions/index.js` → `sendConfirmationEmail()` function  
**HTML:** Update `html` variable (lines ~700-800)  
**Text:** Update `text` variable for plain-text fallback  
**Redeploy:** `firebase deploy --only functions`

---

## 15. Contact & Ownership

- **Project Owner:** Filip (filstep@gmail.com)
- **Business:** Filspire Ltd
- **Domain:** finefighters.co.uk
- **Repository:** pcn-appeal (GitHub: skippy-backup)
- **Firebase Project:** pcn-appeal-generator

---

*Document created: March 25, 2026*  
*Last updated: March 25, 2026*  
*Status: 80% Complete, Production Ready pending DNS/webhook config*

