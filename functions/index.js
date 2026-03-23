/**
 * RATE LIMITING CONSIDERATIONS FOR PRODUCTION
 * ============================================
 * This application should implement rate limiting in production to prevent abuse.
 * 
 * Recommended approaches:
 * 1. Firebase Extensions: Install "Rate Limit API Calls" extension from Firebase
 *    - Provides per-user and per-IP rate limiting
 *    - Easy integration with Firebase Functions
 * 
 * 2. Cloud Armor: Configure DDoS protection and rate limiting rules
 *    - Works at the load balancer level
 *    - Can block malicious traffic before reaching functions
 * 
 * 3. reCAPTCHA Enterprise: For form submissions and payment endpoints
 *    - Protects against automated bot attacks
 *    - Provides risk scores for each request
 * 
 * Current implementation does NOT include rate limiting.
 * Add rate limiting before deploying to production.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const cors = require('cors')({ origin: true });

admin.initializeApp();

const getStripe = () => Stripe(process.env.STRIPE_SECRET_KEY);

const RESEND_API_KEY = process.env.RESEND_API_KEY;

const db = admin.firestore();

const VALID_CONTRAVENTION_CODES = ['01', '02', '05', '06', '11', '12', '16', '21', '25', '30', '31', '34', '40', '45', '47', '62'];

const VALIDATION_LIMITS = {
    appealId: { minLength: 1, maxLength: 100 },
    email: { maxLength: 320 },
    pcnRef: { minLength: 1, maxLength: 50 },
    council: { minLength: 1, maxLength: 200 },
    vehicleReg: { minLength: 1, maxLength: 20 },
    location: { minLength: 1, maxLength: 500 },
    circumstances: { minLength: 10, maxLength: 5000 }
};

const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
};

const validators = {
    appealId: (value) => {
        const errors = [];
        const sanitized = sanitizeString(value);
        
        if (!sanitized) {
            errors.push('Appeal ID is required');
        } else if (!/^[a-zA-Z0-9-]+$/.test(sanitized)) {
            errors.push('Appeal ID must be alphanumeric with hyphens only');
        } else if (sanitized.length < VALIDATION_LIMITS.appealId.minLength || sanitized.length > VALIDATION_LIMITS.appealId.maxLength) {
            errors.push(`Appeal ID must be between ${VALIDATION_LIMITS.appealId.minLength} and ${VALIDATION_LIMITS.appealId.maxLength} characters`);
        }
        
        return { valid: errors.length === 0, errors, sanitized };
    },

    email: (value) => {
        const errors = [];
        const sanitized = sanitizeString(value);
        
        if (!sanitized) {
            errors.push('Email is required');
        } else {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(sanitized)) {
                errors.push('Invalid email format');
            } else if (sanitized.length > VALIDATION_LIMITS.email.maxLength) {
                errors.push(`Email must not exceed ${VALIDATION_LIMITS.email.maxLength} characters`);
            }
        }
        
        return { valid: errors.length === 0, errors, sanitized: sanitized.toLowerCase() };
    },

    pcnRef: (value) => {
        const errors = [];
        const sanitized = sanitizeString(value);
        
        if (!sanitized) {
            errors.push('PCN reference is required');
        } else if (!/^[a-zA-Z0-9\s/-]+$/.test(sanitized)) {
            errors.push('PCN reference must be alphanumeric (spaces, hyphens, and forward slashes allowed)');
        } else if (sanitized.length < VALIDATION_LIMITS.pcnRef.minLength || sanitized.length > VALIDATION_LIMITS.pcnRef.maxLength) {
            errors.push(`PCN reference must be between ${VALIDATION_LIMITS.pcnRef.minLength} and ${VALIDATION_LIMITS.pcnRef.maxLength} characters`);
        }
        
        return { valid: errors.length === 0, errors, sanitized };
    },

    contraventionCode: (value) => {
        const errors = [];
        const sanitized = sanitizeString(value);
        
        if (!sanitized) {
            errors.push('Contravention code is required');
        } else {
            const normalizedCode = sanitized.replace(/^0+/, '').padStart(2, '0');
            if (!VALID_CONTRAVENTION_CODES.includes(normalizedCode) && !VALID_CONTRAVENTION_CODES.includes(sanitized)) {
                errors.push(`Invalid contravention code. Valid codes are: ${VALID_CONTRAVENTION_CODES.join(', ')}`);
            }
        }
        
        return { valid: errors.length === 0, errors, sanitized };
    },

    council: (value) => {
        const errors = [];
        const sanitized = sanitizeString(value);
        
        if (!sanitized) {
            errors.push('Council is required');
        } else if (sanitized.length < VALIDATION_LIMITS.council.minLength || sanitized.length > VALIDATION_LIMITS.council.maxLength) {
            errors.push(`Council name must be between ${VALIDATION_LIMITS.council.minLength} and ${VALIDATION_LIMITS.council.maxLength} characters`);
        }
        
        return { valid: errors.length === 0, errors, sanitized };
    },

    vehicleReg: (value) => {
        const errors = [];
        const sanitized = sanitizeString(value);
        
        if (!sanitized) {
            errors.push('Vehicle registration is required');
        } else {
            const normalizedReg = sanitized.replace(/\s+/g, '').toUpperCase();
            if (!/^[A-Z0-9]{1,20}$/i.test(normalizedReg)) {
                errors.push('Vehicle registration must be alphanumeric');
            } else if (normalizedReg.length > VALIDATION_LIMITS.vehicleReg.maxLength) {
                errors.push(`Vehicle registration must not exceed ${VALIDATION_LIMITS.vehicleReg.maxLength} characters`);
            }
        }
        
        return { valid: errors.length === 0, errors, sanitized };
    },

    contraventionDate: (value) => {
        const errors = [];
        const sanitized = sanitizeString(value);
        
        if (!sanitized) {
            errors.push('Contravention date is required');
        } else {
            const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
            const match = sanitized.match(dateRegex);
            
            if (!match) {
                errors.push('Invalid date format. Use YYYY-MM-DD');
            } else {
                const year = parseInt(match[1], 10);
                const month = parseInt(match[2], 10) - 1;
                const day = parseInt(match[3], 10);
                const date = new Date(year, month, day);
                
                if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
                    errors.push('Invalid date');
                } else {
                    const now = new Date();
                    now.setHours(23, 59, 59, 999);
                    
                    if (date > now) {
                        errors.push('Contravention date cannot be in the future');
                    }
                    
                    const minYear = 2000;
                    if (year < minYear) {
                        errors.push(`Contravention date must be after ${minYear}`);
                    }
                }
            }
        }
        
        return { valid: errors.length === 0, errors, sanitized };
    },

    contraventionTime: (value) => {
        const errors = [];
        const sanitized = sanitizeString(value);
        
        if (!sanitized) {
            errors.push('Contravention time is required');
        } else {
            const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
            if (!timeRegex.test(sanitized)) {
                errors.push('Invalid time format. Use HH:MM (24-hour format)');
            }
        }
        
        return { valid: errors.length === 0, errors, sanitized };
    },

    location: (value) => {
        const errors = [];
        const sanitized = sanitizeString(value);
        
        if (!sanitized) {
            errors.push('Location is required');
        } else if (sanitized.length < VALIDATION_LIMITS.location.minLength || sanitized.length > VALIDATION_LIMITS.location.maxLength) {
            errors.push(`Location must be between ${VALIDATION_LIMITS.location.minLength} and ${VALIDATION_LIMITS.location.maxLength} characters`);
        }
        
        return { valid: errors.length === 0, errors, sanitized };
    },

    circumstances: (value) => {
        const errors = [];
        const sanitized = sanitizeString(value);
        
        if (!sanitized) {
            errors.push('Circumstances are required');
        } else if (sanitized.length < VALIDATION_LIMITS.circumstances.minLength) {
            errors.push(`Circumstances must be at least ${VALIDATION_LIMITS.circumstances.minLength} characters`);
        } else if (sanitized.length > VALIDATION_LIMITS.circumstances.maxLength) {
            errors.push(`Circumstances must not exceed ${VALIDATION_LIMITS.circumstances.maxLength} characters`);
        }
        
        return { valid: errors.length === 0, errors, sanitized };
    }
};

const validateFields = (data, fields) => {
    const errors = {};
    const sanitized = {};
    
    for (const field of fields) {
        if (validators[field]) {
            const result = validators[field](data[field]);
            if (!result.valid) {
                errors[field] = result.errors;
            }
            sanitized[field] = result.sanitized;
        }
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors,
        sanitized
    };
};

exports.createCheckoutSession = functions
    .runWith({ secrets: ["STRIPE_SECRET_KEY"] })
    .https.onRequest(async (req, res) => {
    const stripe = getStripe();
    return cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { appealId, email, pcnRef } = req.body;

            const validation = validateFields(
                { appealId, email, pcnRef },
                ['appealId', 'email', 'pcnRef']
            );

            if (!validation.valid) {
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    details: validation.errors 
                });
            }

            const appealDoc = await db.collection('appeals').doc(validation.sanitized.appealId).get();
            if (!appealDoc.exists) {
                return res.status(404).json({ error: 'Appeal not found' });
            }

            const appealData = appealDoc.data();
            if (appealData.paid) {
                return res.status(400).json({ error: 'This PCN has already been paid' });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer_email: validation.sanitized.email,
                line_items: [
                    {
                        price_data: {
                            currency: 'gbp',
                            product_data: {
                                name: 'PCN Appeal Letter',
                                description: `Appeal letter for PCN ${validation.sanitized.pcnRef}`,
                            },
                            unit_amount: 299,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `https://pcn-appeal-generator.web.app/success.html?payment=success&appeal=${encodeURIComponent(validation.sanitized.appealId)}`,
                cancel_url: `https://pcn-appeal-generator.web.app/app.html?payment=cancelled`,
                metadata: {
                    appealId: validation.sanitized.appealId,
                    pcnRef: validation.sanitized.pcnRef,
                    email: validation.sanitized.email
                }
            });

            await db.collection('appeals').doc(validation.sanitized.appealId).update({
                stripeSessionId: session.id,
                paymentInitiatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

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

exports.stripeWebhook = functions
    .runWith({ secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] })
    .https.onRequest(async (req, res) => {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const appealId = session.metadata.appealId;
            const pcnRef = session.metadata.pcnRef;
            const email = session.metadata.email;
            const paymentIntentId = session.payment_intent;

            console.log(`Payment completed for appeal ${appealId}`);

            try {
                let appealDoc;
                try {
                    appealDoc = await db.collection('appeals').doc(appealId).get();
                } catch (dbError) {
                    console.error('Database error fetching appeal for webhook:', dbError.message);
                    break;
                }
                
                const appealData = appealDoc.exists ? appealDoc.data() : {};

                try {
                    await db.collection('appeals').doc(appealId).update({
                        paid: true,
                        paidAt: admin.firestore.FieldValue.serverTimestamp(),
                        stripePaymentId: paymentIntentId,
                        letterGenerated: true
                    });
                } catch (updateError) {
                    console.error('Error updating appeal status:', updateError.message);
                }

                try {
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
                } catch (paymentError) {
                    console.error('Error creating payment record:', paymentError.message);
                }

                const emailResult = await sendConfirmationEmail(email, pcnRef, appealId, appealData);
                if (!emailResult) {
                    console.warn(`Confirmation email may not have been sent for appeal ${appealId}`);
                }

            } catch (error) {
                console.error('Unexpected error processing payment webhook:', error.message);
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

    res.json({ received: true });
});

async function sendConfirmationEmail(email, pcnRef, appealId, appealData) {
    const downloadUrl = `https://pcn-appeal-generator.web.app/success.html?payment=success&appeal=${encodeURIComponent(appealId)}`;
    
    const contraventionDate = appealData.contraventionDate || '';
    const location = appealData.location || '';
    const council = appealData.council || '';
    
    let html;
    try {
        html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 32px; margin-top: 20px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #1e40af; font-size: 24px; margin: 0;">PCN Appeal Generator</h1>
                </div>
                
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" fill="none" stroke="#22c55e" stroke-width="3" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>
                
                <h2 style="text-align: center; color: #111827; font-size: 20px; margin-bottom: 8px;">Payment Successful!</h2>
                <p style="text-align: center; color: #6b7280; margin-bottom: 32px;">Your appeal letter is ready for download.</p>
                
                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="color: #111827; font-size: 16px; margin: 0 0 16px 0;">Receipt Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="color: #6b7280; padding: 8px 0;">Reference</td>
                            <td style="color: #111827; text-align: right; padding: 8px 0; font-family: monospace;">${escapeHtml(appealId.toUpperCase())}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; padding: 8px 0;">PCN Reference</td>
                            <td style="color: #111827; text-align: right; padding: 8px 0;">${escapeHtml(pcnRef)}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; padding: 8px 0;">Council</td>
                            <td style="color: #111827; text-align: right; padding: 8px 0;">${escapeHtml(council)}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; padding: 8px 0;">Amount Paid</td>
                            <td style="color: #111827; text-align: right; padding: 8px 0; font-weight: bold;">£2.99</td>
                        </tr>
                    </table>
                </div>
                
                <div style="text-align: center; margin-bottom: 24px;">
                    <a href="${downloadUrl}" style="display: inline-block; background-color: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Download Your Appeal Letter
                    </a>
                </div>
                
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                        <strong>Important:</strong> Please review your letter carefully before submitting to the council. 
                        This is a template and may require customisation for your specific circumstances.
                    </p>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Next Steps</h3>
                    <ol style="color: #4b5563; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Download your appeal letter using the button above</li>
                        <li style="margin-bottom: 8px;">Review and customise the letter if needed</li>
                        <li style="margin-bottom: 8px;">Submit to your council within the deadline (usually 28 days)</li>
                        <li>Keep a copy for your records</li>
                    </ol>
                </div>
                
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

    } catch (error) {
        console.error('Error building email content:', error);
        return false;
    }
    
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

    const sendEmailWithRetry = async (retryCount = 0, maxRetries = 2) => {
        const baseDelay = 1000;
        const delay = baseDelay * Math.pow(2, retryCount);
        
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
                const isRetryable = response.status >= 500 || response.status === 429;
                
                if (isRetryable && retryCount < maxRetries) {
                    console.warn(`Email send failed (attempt ${retryCount + 1}), retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return sendEmailWithRetry(retryCount + 1, maxRetries);
                }
                
                console.error('Resend API error:', errorText);
                return { success: false, emailId: null };
            }

            const result = await response.json();
            console.log(`Confirmation email sent to ${email}, email ID: ${result.id}`);
            return { success: true, emailId: result.id };
        } catch (error) {
            if (retryCount < maxRetries) {
                console.warn(`Email send error (attempt ${retryCount + 1}), retrying in ${delay}ms...`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay));
                return sendEmailWithRetry(retryCount + 1, maxRetries);
            }
            
            console.error('Error sending confirmation email after retries:', error.message);
            return { success: false, emailId: null };
        }
    };
    
    const result = await sendEmailWithRetry();
    return result.success;
}

const escapeHtml = (str) => {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

exports.getAppeal = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            if (req.method !== 'GET') {
                return res.status(405).json({ error: 'Method not allowed' });
            }
            
            const appealId = req.query.appeal;
            
            if (!appealId || typeof appealId !== 'string') {
                return res.status(400).json({ error: 'Appeal ID is required' });
            }
            
            const validation = validators.appealId(appealId);
            if (!validation.valid) {
                return res.status(400).json({ 
                    error: 'Invalid appeal ID', 
                    details: validation.errors 
                });
            }

            let appealDoc;
            try {
                appealDoc = await db.collection('appeals').doc(validation.sanitized).get();
            } catch (dbError) {
                console.error('Database error fetching appeal:', dbError.message);
                return res.status(503).json({ error: 'Service temporarily unavailable. Please try again.' });
            }
            
            if (!appealDoc.exists) {
                return res.status(404).json({ error: 'Appeal not found' });
            }

            const data = appealDoc.data();
            
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
            console.error('Unexpected error in getAppeal:', error.message);
            return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
        }
    });
});

exports.testBypassPayment = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            if (process.env.FUNCTIONS_EMULATOR !== 'true') {
                console.warn('[SECURITY] testBypassPayment called in production - blocked');
                return res.status(403).json({ error: 'This endpoint is disabled in production' });
            }

            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { appealId, testSecret } = req.body;

            const expectedSecret = process.env.TEST_BYPASS_SECRET || 'dev-test-secret';
            if (testSecret !== expectedSecret) {
                console.warn('[SECURITY] Invalid test secret provided');
                return res.status(403).json({ error: 'Invalid test secret' });
            }

            const validation = validators.appealId(appealId);
            if (!validation.valid) {
                return res.status(400).json({ 
                    error: 'Invalid appeal ID', 
                    details: validation.errors 
                });
            }

            const appealDoc = await db.collection('appeals').doc(validation.sanitized).get();
            if (!appealDoc.exists) {
                return res.status(404).json({ error: 'Appeal not found' });
            }

            await db.collection('appeals').doc(validation.sanitized).update({
                paid: true,
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                testMode: true,
                letterGenerated: true
            });

            console.log(`[TEST MODE] Appeal ${validation.sanitized} marked as paid`);

            return res.json({ 
                success: true, 
                appealId: validation.sanitized,
                redirectUrl: `/success.html?payment=success&appeal=${encodeURIComponent(validation.sanitized)}`
            });

        } catch (error) {
            console.error('Error in test bypass:', error);
            return res.status(500).json({ error: 'Failed to bypass payment' });
        }
    });
});