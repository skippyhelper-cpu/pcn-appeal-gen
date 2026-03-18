#!/bin/bash
# Stripe Webhook Setup Helper

echo "=== Stripe Webhook Setup ==="
echo ""
echo "1. Go to: https://dashboard.stripe.com/webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Endpoint URL: https://pcn-appeal-generator.web.app/stripeWebhook"
echo "4. Select events:"
echo "   - checkout.session.completed"
echo "   - payment_intent.payment_failed"
echo "5. Click 'Add endpoint'"
echo "6. Copy the 'Signing secret' (starts with whsec_)"
echo ""
echo "Then run:"
echo "firebase functions:config:set stripe.webhook_secret='whsec_xxxx'"
echo ""
echo "Or for environment variables:"
echo "export STRIPE_WEBHOOK_SECRET='whsec_xxxx'"
