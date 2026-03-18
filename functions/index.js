const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Stripe will be initialized inside functions with secret
const getStripe = () => Stripe(process.env.STRIPE_SECRET_KEY);

// Resend API key
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const db = admin.firestore();

/**
 * Create Stripe Checkout Session
 * Called when user is ready to pay
 */
exports.createCheckoutSession = functions
    .runWith({ secrets: ["STRIPE_SECRET_KEY"] })
    .https.onRequest(async (req, res) => {
    const stripe = getStripe();
    return cors(req, res, async () => {
        try {
            // Only allow POST
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { appealId, email, pcnRef } = req.body;

            if (!appealId || !email || !pcnRef) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Verify appeal exists and is not paid
            const appealDoc = await db.collection('appeals').doc(appealId).get();
            if (!appealDoc.exists) {
                return res.status(404).json({ error: 'Appeal not found' });
            }

            const appealData = appealDoc.data();
            if (appealData.paid) {
                return res.status(400).json({ error: 'This PCN has already been paid' });
            }

            // Create Stripe Checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer_email: email,
                line_items: [
                    {
                        price_data: {
                            currency: 'gbp',
                            product_data: {
                                name: 'PCN Appeal Letter',
                                description: `Appeal letter for PCN ${pcnRef}`,
                            },
                            unit_amount: 299, // £2.99 in pence
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `https://pcn-appeal-generator.web.app/success.html?payment=success&appeal=${appealId}`,
                cancel_url: `https://pcn-appeal-generator.web.app/app.html?payment=cancelled`,
                metadata: {
                    appealId: appealId,
                    pcnRef: pcnRef,
                    email: email
                }
            });

            // Store session ID with appeal
            await db.collection('appeals').doc(appealId).update({
                stripeSessionId: session.id,
                paymentInitiatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Return the checkout URL for direct redirect
            return res.json({ 
                sessionId: session.id,
                url: session.url 
            });

        } catch (error) {
            console.error('Error creating checkout session:', error);
            return res.status(500).json({ error: 'Failed to create payment session' });
        }
    });
});

/**
 * Stripe Webhook Handler
 * Handles payment completion events
 */
exports.stripeWebhook = functions
    .runWith({ secrets: ["STRIPE_SECRET_KEY"] })
    .https.onRequest(async (req, res) => {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const appealId = session.metadata.appealId;
            const pcnRef = session.metadata.pcnRef;
            const email = session.metadata.email;
            const paymentIntentId = session.payment_intent;

            console.log(`Payment completed for appeal ${appealId}`);

            try {
                // Get appeal data for email
                const appealDoc = await db.collection('appeals').doc(appealId).get();
                const appealData = appealDoc.exists ? appealDoc.data() : {};

                // Update appeal as paid
                await db.collection('appeals').doc(appealId).update({
                    paid: true,
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    stripePaymentId: paymentIntentId,
                    letterGenerated: true
                });

                // Store payment record
                await db.collection('payments').add({
                    appealId: appealId,
                    pcnRef: pcnRef,
                    email: email,
                    amount: 299,
                    currency: 'gbp',
                    stripePaymentId: paymentIntentId,
                    stripeSessionId: session.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Send confirmation email via Resend
                await sendConfirmationEmail(email, pcnRef, appealId, appealData);

            } catch (error) {
                console.error('Error processing payment:', error);
            }

            break;
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            console.log('Payment failed:', paymentIntent.id);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
});

/**
 * Send Confirmation Email via Resend
 */
async function sendConfirmationEmail(email, pcnRef, appealId, appealData) {
    const downloadUrl = `https://pcn-appeal-generator.web.app/success.html?payment=success&appeal=${appealId}`;
    
    const contraventionDate = appealData.contraventionDate || '';
    const location = appealData.location || '';
    const council = appealData.council || '';
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 32px; margin-top: 20px;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #1e40af; font-size: 24px; margin: 0;">PCN Appeal Generator</h1>
                </div>
                
                <!-- Success Icon -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" fill="none" stroke="#22c55e" stroke-width="3" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>
                
                <!-- Title -->
                <h2 style="text-align: center; color: #111827; font-size: 20px; margin-bottom: 8px;">Payment Successful!</h2>
                <p style="text-align: center; color: #6b7280; margin-bottom: 32px;">Your appeal letter is ready for download.</p>
                
                <!-- Receipt Details -->
                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="color: #111827; font-size: 16px; margin: 0 0 16px 0;">Receipt Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="color: #6b7280; padding: 8px 0;">Reference</td>
                            <td style="color: #111827; text-align: right; padding: 8px 0; font-family: monospace;">${appealId.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; padding: 8px 0;">PCN Reference</td>
                            <td style="color: #111827; text-align: right; padding: 8px 0;">${pcnRef}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; padding: 8px 0;">Council</td>
                            <td style="color: #111827; text-align: right; padding: 8px 0;">${council}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; padding: 8px 0;">Amount Paid</td>
                            <td style="color: #111827; text-align: right; padding: 8px 0; font-weight: bold;">£2.99</td>
                        </tr>
                    </table>
                </div>
                
                <!-- Download Button -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <a href="${downloadUrl}" style="display: inline-block; background-color: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Download Your Appeal Letter
                    </a>
                </div>
                
                <!-- Important Notice -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                        <strong>Important:</strong> Please review your letter carefully before submitting to the council. 
                        This is a template and may require customisation for your specific circumstances.
                    </p>
                </div>
                
                <!-- Instructions -->
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Next Steps</h3>
                    <ol style="color: #4b5563; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Download your appeal letter using the button above</li>
                        <li style="margin-bottom: 8px;">Review and customise the letter if needed</li>
                        <li style="margin-bottom: 8px;">Submit to your council within the deadline (usually 28 days)</li>
                        <li>Keep a copy for your records</li>
                    </ol>
                </div>
                
                <!-- Footer -->
                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        PCN Appeal Generator | This is an automated email - please do not reply
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                        <a href="https://pcn-appeal-generator.web.app/privacy.html" style="color: #6b7280;">Privacy Policy</a>
                        &nbsp;|&nbsp;
                        <a href="https://pcn-appeal-generator.web.app/terms.html" style="color: #6b7280;">Terms of Service</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
PCN Appeal Generator - Payment Successful

Your appeal letter for PCN ${pcnRef} is ready for download.

Receipt Details:
- Reference: ${appealId.toUpperCase()}
- PCN Reference: ${pcnRef}
- Council: ${council}
- Amount Paid: £2.99

Download your letter: ${downloadUrl}

Important: Please review your letter carefully before submitting to the council.

Next Steps:
1. Download your appeal letter using the link above
2. Review and customise the letter if needed
3. Submit to your council within the deadline (usually 28 days)
4. Keep a copy for your records

PCN Appeal Generator
This is an automated email - please do not reply.
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'PCN Appeal Generator <noreply@pcn-appeal-generator.web.app>',
                to: email,
                subject: `Your PCN Appeal Letter - ${pcnRef}`,
                html: html,
                text: text
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resend API error:', errorText);
            return false;
        }

        const result = await response.json();
        console.log(`Confirmation email sent to ${email}`, result.id);
        return true;
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return false;
    }
}

/**
 * Get Appeal by ID (for returning users)
 */
exports.getAppeal = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            const appealId = req.query.appeal;
            
            if (!appealId) {
                return res.status(400).json({ error: 'Missing appeal ID' });
            }

            const appealDoc = await db.collection('appeals').doc(appealId).get();
            
            if (!appealDoc.exists) {
                return res.status(404).json({ error: 'Appeal not found' });
            }

            const data = appealDoc.data();
            
            // Only return data if paid
            if (!data.paid) {
                return res.status(403).json({ error: 'Payment not completed' });
            }

            return res.json({
                pcnRef: data.pcnRef,
                vehicleReg: data.vehicleReg,
                council: data.council,
                contraventionCode: data.contraventionCode,
                contraventionDate: data.contraventionDate,
                contraventionTime: data.contraventionTime,
                location: data.location,
                circumstances: data.circumstances,
                country: data.country || 'england'
            });

        } catch (error) {
            console.error('Error fetching appeal:', error);
            return res.status(500).json({ error: 'Failed to fetch appeal' });
        }
    });
});

/**
 * TEST MODE - Bypass Payment
 * Only works in development/testing - marks appeal as paid without payment
 */
exports.testBypassPayment = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            // Only allow POST
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { appealId } = req.body;

            if (!appealId) {
                return res.status(400).json({ error: 'Missing appealId' });
            }

            // Verify appeal exists
            const appealDoc = await db.collection('appeals').doc(appealId).get();
            if (!appealDoc.exists) {
                return res.status(404).json({ error: 'Appeal not found' });
            }

            // Mark as paid (TEST MODE)
            await db.collection('appeals').doc(appealId).update({
                paid: true,
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                testMode: true,
                letterGenerated: true
            });

            console.log(`[TEST MODE] Appeal ${appealId} marked as paid`);

            return res.json({ 
                success: true, 
                appealId,
                redirectUrl: `https://pcn-appeal-generator.web.app/success.html?payment=success&appeal=${appealId}`
            });

        } catch (error) {
            console.error('Error in test bypass:', error);
            return res.status(500).json({ error: 'Failed to bypass payment' });
        }
    });
});