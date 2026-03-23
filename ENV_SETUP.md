# Environment Configuration Setup

This project uses environment variables to manage sensitive keys and configuration. This document explains how to set up and manage these values.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values in `.env`:**
   - Stripe publishable key
   - reCAPTCHA site key
   - Firebase configuration

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## File Structure

```
pcn-appeal/
├── .env                    # Your actual keys (NEVER commit this)
├── .env.example            # Template with placeholder values
├── .gitignore              # Excludes .env and generated config
├── js/
│   ├── config.js           # Generated from .env (git-ignored)
│   ├── firebase-config.js  # Uses config.js values
│   └── ...
└── scripts/
    └── build-config.js     # Build script
```

## Environment Variables

### Frontend (Public Keys)

These are safe to expose in the browser:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` or `pk_test_...` |
| `VITE_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key | `6Ld...` |
| `VITE_FIREBASE_*` | Firebase client config | From Firebase Console |

### Backend (Secret Keys)

These are managed via Firebase Secrets, NOT in .env:

- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `RESEND_API_KEY` - Resend email API key
- `RECAPTCHA_SECRET_KEY` - reCAPTCHA verification secret

Set these with Firebase CLI:
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set RESEND_API_KEY
```

## Build Process

Running `npm run build`:

1. Reads `.env` file
2. Generates `js/config.js` with your values
3. Replaces `__RECAPTCHA_SITE_KEY__` placeholder in HTML files
4. Output is ready for deployment

## Security Notes

### What's Safe to Expose

- **Stripe Publishable Key** (`pk_live_...`) - Used by Stripe.js in the browser
- **reCAPTCHA Site Key** - Required for client-side verification
- **Firebase Client Config** - Designed to be public (protected by security rules)

### What's NOT Safe to Expose

- **Stripe Secret Key** (`sk_live_...`) - Full API access
- **Stripe Webhook Secret** - Validates webhook signatures
- **reCAPTCHA Secret Key** - Server-side verification
- **Any API keys with write permissions**

### Git Protection

The following files are excluded from git (see `.gitignore`):

- `.env` and `.env.local`
- `js/config.js` (generated)
- Any files matching `*secret*` or `*.pem`

## Development Workflow

### Local Development

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your keys

# 2. Build and serve locally
npm run serve
```

### Production Deployment

```bash
# 1. Ensure .env has production keys
# 2. Build and deploy
npm run deploy
```

### Updating Keys

1. Update `.env` with new values
2. Run `npm run build`
3. Deploy with `npm run deploy`

## Troubleshooting

### "Missing required environment variables"

- Ensure `.env` exists and contains all `VITE_*` variables
- Check for typos in variable names

### "reCAPTCHA not working"

- Verify `VITE_RECAPTCHA_SITE_KEY` is set correctly
- Ensure the domain is registered in Google Cloud Console
- Check browser console for errors

### "Firebase not initialized"

- Run `npm run build` first
- Verify `js/config.js` was generated
- Check browser console for config errors

## Files That Use Environment Variables

| File | Variables Used |
|------|----------------|
| `js/firebase-config.js` | All `VITE_FIREBASE_*` |
| `recaptcha-config.js` | `VITE_RECAPTCHA_SITE_KEY` |
| `app.html` | `VITE_RECAPTCHA_SITE_KEY` (in script URL) |
| `js/app.js` | `STRIPE_PUBLISHABLE_KEY` (via config.js) |

## Related Documentation

- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env#secret_manager)
- [Stripe Security](https://stripe.com/docs/keys)
- [reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)