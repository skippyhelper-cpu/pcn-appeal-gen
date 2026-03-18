# PCN Appeal Generator - Deployment Checklist

## Pre-Deployment Setup

### 1. Firebase Project Setup

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create new project (or use existing)
firebase projects:create pcn-appeal-generator

# Note the project ID
```

### 2. Configure Firebase Config

Edit `js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "pcn-appeal-generator.firebaseapp.com",
    projectId: "pcn-appeal-generator",
    storageBucket: "pcn-appeal-generator.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

To get these values:
1. Go to Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Click the web app (</>) icon
4. Copy the config object

### 3. Stripe Setup

1. Create/Login to Stripe account: https://dashboard.stripe.com
2. Get API keys from Developers → API keys
3. Set Firebase Functions config:

```bash
# For test mode
firebase functions:config:set stripe.secret_key="sk_test_..." stripe.webhook_secret="whsec_test_..."

# For live mode (when ready)
firebase functions:config:set stripe.secret_key="sk_live_..." stripe.webhook_secret="whsec_live_..."
```

4. Update Stripe public key in `js/app.js`:

```javascript
// Around line 30, uncomment and update:
stripe = Stripe('pk_live_...'); // or pk_test_... for testing
```

5. Set up webhook endpoint in Stripe Dashboard:
   - Endpoint URL: `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/stripeWebhook`
   - Events to listen for: `checkout.session.completed`, `payment_intent.payment_failed`

### 4. hCaptcha Setup

1. Sign up at https://www.hcaptcha.com/
2. Get site key and secret key
3. Update in `index.html`:

```html
<!-- Replace with your actual site key -->
<div id="captcha-container" class="h-captcha" data-sitekey="YOUR_SITE_KEY" data-callback="onCaptchaSuccess"></div>
```

4. For production, verify server-side in Cloud Functions (optional but recommended)

### 5. Email Setup (Optional but Recommended)

For welcome emails, install Firebase Trigger Email extension:

```bash
firebase ext:install firestore-send-email
```

Or configure in Firebase Console → Extensions → Trigger Email

You'll need SMTP credentials from your email provider (SendGrid, Mailgun, etc.)

## Deployment Steps

### Step 1: Install Dependencies

```bash
cd functions
npm install
```

### Step 2: Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Step 3: Deploy Functions

```bash
firebase deploy --only functions
```

Note the function URLs output - you'll need these for Stripe webhooks.

### Step 4: Deploy Hosting

```bash
firebase deploy --only hosting
```

Your site will be live at: `https://YOUR_PROJECT_ID.web.app`

### Step 5: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/stripeWebhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook signing secret
5. Update Firebase config:

```bash
firebase functions:config:set stripe.webhook_secret="whsec_..."
firebase deploy --only functions
```

## Testing

### Test the Flow

1. Visit your deployed site
2. Fill in test PCN details:
   - PCN Ref: TEST123456
   - Vehicle Reg: AB12CDE
   - Council: Test Council
   - Code: 01
   - Date: Any past date
   - Time: 10:00
   - Location: Test Street
   - Circumstances: Test circumstances
   - Email: your@email.com

3. Complete CAPTCHA (use test key for hCaptcha if available)
4. Use Stripe test card: `4242 4242 4242 4242`
5. Verify:
   - Payment succeeds
   - PDF downloads
   - Record appears in Firestore
   - Email sent (if configured)

### Test Duplicate Detection

1. Submit same PCN reference again
2. Should show "already paid" message

### Test Stripe Webhook

In Stripe Dashboard → Developers → Webhooks → your endpoint:
- Click "Send test event"
- Select `checkout.session.completed`
- Verify function receives and processes event

## Post-Deployment

### 1. Custom Domain (Optional)

```bash
firebase hosting:channel:deploy production
# Or configure custom domain in Firebase Console
```

### 2. Monitoring

- Firebase Console → Functions → Logs
- Stripe Dashboard → Developers → Logs
- Set up alerts for function errors

### 3. Security Review

- Review Firestore rules in production
- Enable App Check if needed
- Monitor for abuse

### 4. GDPR Compliance

- Add privacy policy page
- Add terms of service
- Configure data retention (delete old records after X months)
- Add cookie consent if using analytics

## Files to Update Before Production

| File | What to Update |
|------|----------------|
| `js/firebase-config.js` | Firebase project config |
| `js/app.js` | Stripe public key (uncomment line ~30) |
| `index.html` | hCaptcha site key |
| `functions/index.js` | Email template URLs |
| `success.html` | Domain URLs in email template |

## Rollback

If something goes wrong:

```bash
# Rollback hosting
firebase hosting:clone production:previous production

# Rollback functions
firebase functions:delete createCheckoutSession --force
firebase functions:delete stripeWebhook --force
firebase deploy --only functions
```

## Support

- Firebase Docs: https://firebase.google.com/docs
- Stripe Docs: https://stripe.com/docs
- hCaptcha Docs: https://docs.hcaptcha.com/

## Success Criteria Checklist

- [ ] Site loads at custom domain or firebaseapp.com
- [ ] Form validation works
- [ ] Duplicate PCN detection works
- [ ] CAPTCHA displays and validates
- [ ] Stripe checkout opens
- [ ] Payment processes successfully
- [ ] Webhook updates Firestore
- [ ] PDF generates and downloads
- [ ] Email sends (if configured)
- [ ] Mobile responsive
- [ ] No console errors
- [ ] All 10 templates work