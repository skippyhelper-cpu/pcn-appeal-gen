# PCN Appeal Generator - SRS v2.0 (Simplified)
## Software Requirements Specification

**Version:** 2.0  
**Date:** 2026-03-17  
**Status:** Ready for Development  
**Approach:** Minimal, no over-engineering

---

## 1. Executive Summary

Simple web app that generates PCN appeal letters. User pays £2.99 per letter. No subscriptions, no complex auth.

---

## 2. Tech Stack (Final)

| Component | Technology | Reason |
|-----------|-----------|--------|
| **Hosting** | Firebase Hosting | Free tier, CLI available |
| **Database** | Firestore | Part of Firebase, simple |
| **Auth** | None | Payment = verification |
| **Payment** | Stripe | Filip has it, CLI available |
| **Frontend** | HTML + Tailwind + Vanilla JS | Simple, no framework needed |
| **PDF** | jsPDF or Puppeteer | Client-side generation |
| **CAPTCHA** | hCaptcha | Free tier available |
| **Email** | Firebase/Resend | Welcome email only |

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | User can enter PCN details (ref, reg, date, time, location, council) | Must |
| FR-002 | User can select contravention code from dropdown | Must |
| FR-003 | User can describe circumstances (text area) | Must |
| FR-004 | System checks if PCN ref already paid | Must |
| FR-005 | User sees CAPTCHA before payment | Must |
| FR-006 | User pays £2.99 via Stripe | Must |
| FR-007 | System generates appeal letter from template | Must |
| FR-008 | User can download PDF letter | Must |
| FR-009 | Welcome email sent after payment | Should |
| FR-010 | System stores PCN ref as "paid" | Must |

### 3.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-001 | Page loads < 3 seconds |
| NFR-002 | Mobile responsive |
| NFR-003 | Works offline after payment (PWA) |
| NFR-004 | GDPR compliant (minimal data collection) |

---

## 4. Database Schema

```
Firestore Collection: appeals
├── pcnRef: string (unique, indexed)
├── vehicleReg: string
├── council: string
├── contraventionCode: string
├── date: timestamp
├── time: string
├── location: string
├── circumstances: string
├── email: string
├── paid: boolean
├── paidAt: timestamp
├── stripePaymentId: string
├── letterGenerated: boolean
└── createdAt: timestamp
```

---

## 5. User Flow

```
Landing Page
    ↓
Enter PCN Details
    ↓
[Check: PCN already paid?]
    ↓ Yes → Show "Already paid" message
    ↓ No
Select Template/Grounds
    ↓
Enter Circumstances
    ↓
[CAPTCHA]
    ↓
Stripe Payment (£2.99)
    ↓
[Webhook: Mark paid]
    ↓
Generate Letter
    ↓
Download PDF
    ↓
[Email: Welcome + receipt]
```

---

## 6. Templates (10 Static)

1. **01 - Parked in restricted street** - Signage issues, loading exemption
2. **02 - Parked in loading restricted street** - Active loading, signage
3. **11 - Parked without payment** - Faulty machine, permit held
4. **12 - No permit in residents' bay** - Permit valid, not displayed
5. **16 - No permit in permit space** - Permit held, technical issue
6. **21 - Parked in suspended bay** - Suspension unclear
7. **25 - Parked in loading place** - Active loading
8. **30 - Parked longer than permitted** - Loading, emergency
9. **31 - Stopped in box junction** - Exit clear, traffic conditions
10. **34/47 - Bus lane/bus stop** - Outside hours, signage

---

## 7. Build Plan

### Phase 1: Foundation (Week 1)

#### Task 1.1: Firebase Setup
- [ ] Create Firebase project
- [ ] Enable Firestore
- [ ] Enable Firebase Hosting
- [ ] Install Firebase CLI locally
- [ ] **TEST:** Deploy hello world page

#### Task 1.2: Project Structure
- [ ] Create folder structure
- [ ] Set up basic HTML files
- [ ] Add Tailwind CSS CDN
- [ ] **TEST:** Page loads with styling

#### Task 1.3: Stripe Setup
- [ ] Configure Stripe account
- [ ] Get API keys
- [ ] Install Stripe CLI
- [ ] **TEST:** Stripe CLI working

---

### Phase 2: Core Features (Week 2)

#### Task 2.1: PCN Form
- [ ] Create form with all fields
- [ ] Add contravention code dropdown
- [ ] Client-side validation
- [ ] **TEST:** Form submits to Firestore

#### Task 2.2: Duplicate Check
- [ ] Check PCN ref before payment
- [ ] Show error if already paid
- [ ] **TEST:** Duplicate detection works

#### Task 2.3: Template Selection
- [ ] Show template options based on code
- [ ] Simple routing logic (no AI)
- [ ] **TEST:** Correct template selected

---

### Phase 3: Payment (Week 3)

#### Task 3.1: CAPTCHA
- [ ] Add hCaptcha to form
- [ ] Verify on server
- [ ] **TEST:** CAPTCHA blocks bots

#### Task 3.2: Stripe Integration
- [ ] Create payment intent
- [ ] Stripe Checkout session
- [ ] **TEST:** Test payment succeeds

#### Task 3.3: Webhook Handler
- [ ] Handle Stripe webhook
- [ ] Mark PCN as paid in Firestore
- [ ] **TEST:** Webhook updates database

---

### Phase 4: Letter Generation (Week 4)

#### Task 4.1: Template Engine
- [ ] Create 10 HTML templates
- [ ] Insert user data into template
- [ ] **TEST:** Template renders correctly

#### Task 4.2: PDF Generation
- [ ] Convert HTML to PDF (jsPDF)
- [ ] Download button
- [ ] **TEST:** PDF downloads and opens

#### Task 4.3: Email
- [ ] Send welcome email
- [ ] Include receipt
- [ ] **TEST:** Email delivers

---

### Phase 5: Polish & Deploy (Week 5)

#### Task 5.1: Mobile Responsive
- [ ] Test on mobile devices
- [ ] Fix any layout issues
- [ ] **TEST:** Works on phone

#### Task 5.2: Error Handling
- [ ] Add error messages
- [ ] Graceful failures
- [ ] **TEST:** Errors show correctly

#### Task 5.3: Deploy
- [ ] Deploy to Firebase Hosting
- [ ] Configure custom domain (if needed)
- [ ] **TEST:** Live site works

---

## 8. Testing Checklist

### Before Each Phase
- [ ] Previous phase tests passing
- [ ] Code reviewed
- [ ] No console errors

### Final Testing
- [ ] Full user flow works end-to-end
- [ ] Payment processes correctly
- [ ] PDF generates and downloads
- [ ] Email sends
- [ ] Mobile responsive
- [ ] No duplicate payments possible

---

## 9. Success Criteria

- [ ] User can complete full flow in < 5 minutes
- [ ] Payment processes successfully
- [ ] PDF letter generates correctly
- [ ] No duplicate payments for same PCN
- [ ] Mobile works
- [ ] Deployed and live

---

*Minimal build. No over-engineering. Ship it.*
