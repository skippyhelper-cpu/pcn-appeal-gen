# Quick Start Guide - PCN Appeal Generator

## Test Locally (No Setup Required)

1. **Open test.html in your browser:**
   ```bash
   # Option 1: Direct file open
   # Just double-click test.html in your file manager
   
   # Option 2: Local server (recommended)
   cd /home/filip/.openclaw/workspace/projects/pcn-appeal
   python3 -m http.server 8080
   # Then visit: http://localhost:8080/test.html
   ```

2. **Fill in the test form** (pre-populated with test data)

3. **Click "Generate Test PDF"**

4. **PDF downloads immediately** - no payment required in test mode

## Deploy to Firebase (Production)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login and Create Project
```bash
firebase login
firebase projects:create pcn-appeal-generator
```

### 3. Configure Firebase
Edit `js/firebase-config.js` with your Firebase project credentials from:
Firebase Console → Project Settings → Your apps → Web app

### 4. Configure Stripe
```bash
# Get keys from https://dashboard.stripe.com/apikeys
firebase functions:config:set stripe.secret_key="sk_test_..." stripe.webhook_secret="whsec_..."
```

Then edit `js/app.js` line ~30 to uncomment and add your Stripe public key:
```javascript
stripe = Stripe('pk_test_...');
```

### 5. Configure hCaptcha
Get site key from https://www.hcaptcha.com/ and update `index.html` line ~140:
```html
<div class="h-captcha" data-sitekey="YOUR_SITE_KEY"></div>
```

### 6. Deploy
```bash
cd /home/filip/.openclaw/workspace/projects/pcn-appeal

# Install function dependencies
cd functions
npm install
cd ..

# Deploy everything
firebase deploy
```

### 7. Test Live Site
Visit: `https://pcn-appeal-generator.web.app`

Use Stripe test card: **4242 4242 4242 4242**

## File Checklist

Before deploying, ensure these files are updated:

- [ ] `js/firebase-config.js` - Firebase credentials
- [ ] `js/app.js` - Stripe public key (uncomment line 30)
- [ ] `index.html` - hCaptcha site key
- [ ] `functions/index.js` - Email template URLs (optional)

## Common Issues

**"Firebase not defined" error:**
- Make sure `js/firebase-config.js` has valid Firebase config

**Payment fails:**
- Check Stripe keys are correct
- Verify webhook secret is set in Firebase Functions config

**PDF doesn't download:**
- Check browser popup blocker
- Verify jsPDF CDN is loading (check browser console)

**CAPTCHA not showing:**
- Get valid hCaptcha site key
- Check browser console for errors

## Support Files

- `README.md` - Full project documentation
- `DEPLOYMENT.md` - Detailed deployment checklist
- `BUILD_COMPLETE.md` - Build summary
- `test.html` - Local testing without Firebase

---

**Ready to ship!** 🚀