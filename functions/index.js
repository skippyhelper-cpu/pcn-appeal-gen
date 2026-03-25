/**
 * RATE LIMITING IMPLEMENTED
 * ========================
 * Server-side rate limiting is implemented:
 * - In-memory rate limit store tracks requests per IP
 * - 10 requests per minute limit per IP
 * - Returns 429 when exceeded
 * 
 * For production, also consider:
 * - Firebase Extensions: "Rate Limit API Calls" extension
 * - Cloud Armor: DDoS protection and rate limiting rules
 * - reCAPTCHA Enterprise: Bot attack protection
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const cors = require('cors')({ origin: true });
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

admin.initializeApp();

const getStripe = () => Stripe(process.env.STRIPE_SECRET_KEY);

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Get base URL from environment or use default
const getBaseUrl = () => {
    return process.env.APP_BASE_URL || 'https://pcn-appeal-generator.web.app';
};

const db = admin.firestore();

const VALID_CONTRAVENTION_CODES = ['01', '02', '05', '06', '11', '12', '16', '21', '25', '30', '31', '34', '40', '45', '47', '62'];

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

// In-memory rate limit store (use Firebase Firestore for production)
const rateLimitStore = new Map();

// Check rate limit for a given IP
const checkRateLimit = (ip) => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    
    // Clean up old entries
    const userHistory = rateLimitStore.get(ip);
    if (userHistory) {
        const recentRequests = userHistory.filter(timestamp => timestamp > windowStart);
        if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
            return false;
        }
        // Update with recent requests
        rateLimitStore.set(ip, [...recentRequests, now]);
    } else {
        rateLimitStore.set(ip, [now]);
    }
    return true;
};

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
            
            // Rate limiting check
            const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
            if (!checkRateLimit(clientIp)) {
                return res.status(429).json({ error: 'Too many requests. Please try again later.' });
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
                success_url: `${getBaseUrl()}/success.html?payment=success&appeal=${encodeURIComponent(validation.sanitized.appealId)}`,
                cancel_url: `${getBaseUrl()}/app.html?payment=cancelled`,
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
    .runWith({ 
        secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
        memory: '1GB',
        timeoutSeconds: 120
    })
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
            console.log('Payment failed:', paymentIntent.id, 'reason:', paymentIntent.last_payment_error?.message);
            
            try {
                // Find the appeal by stripePaymentId
                const appealsQuery = await db.collection('appeals')
                    .where('stripePaymentId', '==', paymentIntent.id)
                    .limit(1)
                    .get();
                
                if (!appealsQuery.empty) {
                    const appealDoc = appealsQuery.docs[0];
                    const appealId = appealDoc.id;
                    const appealData = appealDoc.data();
                    
                    // Update appeal status to payment_failed
                    await db.collection('appeals').doc(appealId).update({
                        status: 'payment_failed',
                        paymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
                        paymentFailureReason: paymentIntent.last_payment_error?.message || 'Unknown error'
                    });
                    
                    console.log(`Appeal ${appealId} marked as payment_failed`);
                    
                    // Send failure notification email
                    if (appealData.email) {
                        await sendPaymentFailedEmail(appealData.email, appealData.pcnRef, appealId, paymentIntent.last_payment_error?.message);
                    }
                } else {
                    console.warn('No appeal found for failed payment:', paymentIntent.id);
                }
            } catch (error) {
                console.error('Error handling payment failure:', error.message);
            }
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Fetch image as base64 for embedding in PDF
async function fetchImageAsBase64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        // Get content type from headers
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        // Convert to buffer using arrayBuffer (works in Node.js 18+)
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        
        return `data:${contentType};base64,${base64}`;
    } catch (error) {
        console.error('Error fetching image:', url, error.message);
        return null;
    }
}

// Generate PDF from HTML using puppeteer + chromium (serverless)
async function generatePDF(appealData) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        
        // Generate the appeal letter HTML
        const htmlContent = await generateAppealLetterHTML(appealData);
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Generate PDF as buffer
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '25mm',
                right: '25mm',
                bottom: '25mm',
                left: '25mm'
            },
            printBackground: true
        });
        
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Generate the appeal letter HTML content
async function generateAppealLetterHTML(data) {
    const date = formatDate(new Date());
    const contraventionDate = formatDate(data.contraventionDate);
    const country = data.country || 'england';
    
    // Get template content based on contravention code
    const templateContent = getTemplateContent(data.contraventionCode, country);
    
    // Fetch evidence images as base64
    let evidenceImagesHtml = '';
    if (data.evidenceFiles && data.evidenceFiles.length > 0) {
        const imageFiles = data.evidenceFiles.filter(f => f.type && f.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            evidenceImagesHtml = `
            <div style="margin-top: 40px; page-break-before: always;">
                <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px;">APPENDIX - Supporting Evidence</h2>
                <p style="margin-bottom: 16px;">The following ${imageFiles.length} image(s) have been provided as supporting evidence:</p>
            `;
            
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const base64 = await fetchImageAsBase64(file.url);
                
                if (base64) {
                    evidenceImagesHtml += `
                    <div style="margin-bottom: 24px;">
                        <p style="font-weight: bold; margin-bottom: 8px;">Evidence ${i + 1}: ${escapeHtml(file.name)}</p>
                        ${file.description ? `<p style="font-style: italic; color: #666; margin-bottom: 8px;">${escapeHtml(file.description)}</p>` : ''}
                        <img src="${base64}" style="max-width: 100%; height: auto; border: 1px solid #ccc;" />
                    </div>
                    `;
                } else {
                    evidenceImagesHtml += `
                    <div style="margin-bottom: 24px;">
                        <p style="font-weight: bold; margin-bottom: 8px;">Evidence ${i + 1}: ${escapeHtml(file.name)}</p>
                        ${file.description ? `<p style="font-style: italic; color: #666; margin-bottom: 8px;">${escapeHtml(file.description)}</p>` : ''}
                        <p style="color: #999; font-style: italic;">[Image could not be loaded]</p>
                    </div>
                    `;
                }
            }
            
            evidenceImagesHtml += `</div>`;
        }
    }
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PCN Appeal Letter - ${escapeHtml(data.pcnRef)}</title>
    <style>
        body { 
            font-family: 'Times New Roman', Times, serif; 
            line-height: 1.6; 
            max-width: 650px; 
            margin: 0 auto; 
            padding: 20px;
            color: #000;
        }
        .header { text-align: right; margin-bottom: 30px; }
        .date { margin-bottom: 30px; }
        .recipient { margin-bottom: 30px; }
        .subject { 
            font-weight: bold; 
            margin-bottom: 20px; 
            border-left: 3px solid #333; 
            padding-left: 12px;
        }
        .subject p { margin: 0 0 4px 0; }
        h3 { 
            margin-top: 28px; 
            font-size: 1em; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
            margin-bottom: 10px;
        }
        p { margin: 0 0 12px 0; }
        ul { margin: 8px 0 16px 0; padding-left: 25px; }
        li { margin-bottom: 4px; }
        .signature { margin-top: 40px; }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #ccc;
            font-size: 12px;
            color: #666;
        }
        .footer p { margin: 0 0 4px 0; }
    </style>
</head>
<body>
    <div class="header">
        <p>${escapeHtml(data.applicantName || 'Your Name')}</p>
        <p>${escapeHtml(data.applicantAddress || 'Your Address')}</p>
        <p>${escapeHtml(data.applicantPostcode || 'Your Postcode')}</p>
    </div>
    
    <div class="date">
        <p>${date}</p>
    </div>
    
    <div class="recipient">
        <p>Parking Services</p>
        <p>${escapeHtml(data.council)}</p>
    </div>
    
    <div class="subject">
        <p>RE: Formal Representations Against Penalty Charge Notice ${escapeHtml(data.pcnRef)}</p>
        <p>Vehicle Registration: ${escapeHtml(data.vehicleReg)}</p>
        <p>Date of Contravention: ${contraventionDate}</p>
        <p>Location: ${escapeHtml(data.location)}</p>
    </div>
    
    <p>Dear Sir or Madam,</p>
    
    <p>I am writing to make formal representations against Penalty Charge Notice ${escapeHtml(data.pcnRef)}, issued by ${escapeHtml(data.council)} in respect of vehicle ${escapeHtml(data.vehicleReg)} at ${escapeHtml(data.location)} on ${contraventionDate}.</p>
    
    <p>Having reviewed the circumstances and the evidence available, I believe the Penalty Charge Notice should be cancelled on the following grounds.</p>
    
    <h3>1. The Contravention Did Not Occur</h3>
    <p>${escapeHtml(data.circumstances)}</p>
    
    <h3>2. ${templateContent.section2Title}</h3>
    ${templateContent.section2Content}
    
    <h3>3. ${templateContent.section3Title}</h3>
    ${templateContent.section3Content}
    
    <h3>4. Legal Framework</h3>
    ${templateContent.legalFramework}
    
    <p>In light of the above, I respectfully request that the Penalty Charge Notice is cancelled in full.</p>
    
    <p>If you do not accept these representations, please treat this letter as a formal request for the following evidence:</p>
    
    <ul>
        <li>All Civil Enforcement Officer (CEO) notes and observations made at the time of the alleged contravention;</li>
        <li>All photographic evidence taken by the CEO or any CCTV/camera system;</li>
        <li>The relevant Traffic Regulation Order(s) (TRO) and any amendments or variations;</li>
        <li>Confirmation that the TRO is valid, properly made and currently in force;</li>
        <li>A full explanation of how all statutory requirements under the Traffic Management Act 2004 and the ${templateContent.regulations} have been satisfied.</li>
    </ul>
    
    <p>I reserve the right to appeal to the Traffic Penalty Tribunal should representations be rejected, and to rely on any additional grounds that may arise from the evidence disclosed.</p>
    
    <p>I look forward to your response within the statutory period.</p>
    
    <div class="signature">
        <p>Yours faithfully,</p>
        <br>
        <p>${escapeHtml(data.applicantName || 'Your Name')}</p>
    </div>
    
    <div class="footer">
        <p><strong>Vehicle Registration:</strong> ${escapeHtml(data.vehicleReg)}</p>
        <p><strong>PCN Reference:</strong> ${escapeHtml(data.pcnRef)}</p>
        <p><strong>Date of Contravention:</strong> ${contraventionDate}</p>
        <p><strong>Location:</strong> ${escapeHtml(data.location)}</p>
    </div>
    ${evidenceImagesHtml}
</body>
</html>
    `;
}

// Get template content based on contravention code and country
function getTemplateContent(code, country = 'england') {
    const templates = {
        england: {
            '01': {
                section2Title: 'Signage and Road Markings',
                section2Content: `<p>For a code 01 contravention to be valid, the waiting restrictions must be properly signed and marked. The yellow lines at this location should comply with the Traffic Signs Regulations and General Directions 2016 (TSRGD 2016). If the lines are faded, broken, or the wrong width, or if the time plate signs are missing or hard to read, the restriction may not be enforceable.</p><p>The High Court case <em>Herron v The Parking Adjudicator</em> [2010] confirmed that signage problems at the actual location of the contravention can make a PCN invalid.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN must include certain information required by the Traffic Management Act 2004 and the 2007 Regulations, such as the date of the notice and the date of the alleged contravention. If any of this information is missing or incorrect, the PCN may be invalid.</p>`,
                legalFramework: `<p>This PCN was issued under Section 66 of the Traffic Management Act 2004. The parking restriction should be backed by a valid Traffic Regulation Order under the Road Traffic Regulation Act 1984, with signage that meets TSRGD 2016 standards.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '02': {
                section2Title: 'Loading Restriction Signs',
                section2Content: `<p>For a code 02 contravention, there should be yellow kerb marks (blips) on the pavement edge as well as yellow lines. If I was loading or unloading at the time, and there are no kerb marks or the no-loading signs don't meet the requirements, then this contravention may not apply.</p>`,
                section3Title: 'Correct Contravention Code',
                section3Content: `<p>The PCN should correctly identify what happened. Issuing a code 02 PCN where no loading restriction exists would not be appropriate.</p>`,
                legalFramework: `<p>Loading restrictions require a Traffic Regulation Order under the Road Traffic Regulation Act 1984 and must be signed according to TSRGD 2016.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '05': {
                section2Title: 'Payment Was Valid',
                section2Content: `<p>A code 05 PCN is issued when paid parking time has run out. If I had paid for parking and the session was still active when the CEO checked, then no contravention occurred.</p>`,
                section3Title: 'Payment Machine Problems',
                section3Content: `<p>If the pay and display machine wasn't working at the time, I couldn't have bought a ticket. Please confirm whether the machine was operational.</p>`,
                legalFramework: `<p>Paid parking enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '06': {
                section2Title: 'Pay-by-Phone Payment',
                section2Content: `<p>When parking is paid for by phone or app, you don't need to display a paper ticket. If I had a valid parking session on the app at the time, this PCN shouldn't have been issued.</p>`,
                section3Title: 'Machine Not Working',
                section3Content: `<p>If the pay and display machine was broken, I couldn't get a ticket to display. Please confirm if the machine was working at the time.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '11': {
                section2Title: 'Payment Was Made',
                section2Content: `<p>Code 11 applies to cashless parking areas. If I paid by phone or app and had a valid session running when the CEO checked, then there was no contravention.</p>`,
                section3Title: 'Signs for Cashless Parking',
                section3Content: `<p>The signs should make it clear that payment is electronic only and explain how to pay.</p>`,
                legalFramework: `<p>The council's power comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '12': {
                section2Title: 'I Had a Valid Permit',
                section2Content: `<p>I had a valid permit to park in this area at the time. The permit wasn't visible for reasons outside my control.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN needs to comply with the Traffic Management Act 2004 and the 2007 Regulations.</p>`,
                legalFramework: `<p>Parking enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '16': {
                section2Title: 'Valid Permit',
                section2Content: `<p>I had a valid permit for this permit space at the time. The permit may not have been clearly displayed, but I was authorised to park there.</p>`,
                section3Title: 'Bay Markings and Signs',
                section3Content: `<p>Permit bays must be clearly marked with signs that meet TSRGD 2016 requirements.</p>`,
                legalFramework: `<p>Enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '21': {
                section2Title: 'Suspension Signs Not Clear',
                section2Content: `<p>The suspended bay wasn't clearly marked. The signs either weren't there, weren't visible, or didn't give enough notice of the suspension.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN must meet the requirements of the Traffic Management Act 2004 and the 2007 Regulations.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '25': {
                section2Title: 'Loading or Unloading',
                section2Content: `<p>I was actively loading or unloading goods at the time. This is allowed in loading bays under the Road Traffic Regulation Act 1984.</p>`,
                section3Title: 'Bay Markings',
                section3Content: `<p>Loading bays need clear markings and signs that comply with TSRGD 2016.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004. Loading exemptions come from the Road Traffic Regulation Act 1984.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '30': {
                section2Title: 'Circumstances Beyond My Control',
                section2Content: `<p>I couldn't move the vehicle within the time limit due to circumstances I couldn't control.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN must comply with the Traffic Management Act 2004 and the 2007 Regulations.</p>`,
                legalFramework: `<p>Enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '31': {
                section2Title: 'Exit Was Clear',
                section2Content: `<p>When I entered the box junction, my exit was clear. I expected to drive straight through, but other traffic moved and blocked me. This is a valid defence.</p>`,
                section3Title: 'Box Junction Markings',
                section3Content: `<p>Box junction markings must meet TSRGD 2016 standards. If they're faded or wrong, the box junction can't be enforced.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004. Box junction rules come from TSRGD 2016.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '34': {
                section2Title: 'Bus Lane Signs',
                section2Content: `<p>At the time of this alleged contravention, either the bus lane wasn't operating, or the signs weren't adequate.</p>`,
                section3Title: 'Operating Hours',
                section3Content: `<p>Bus lanes only operate during specific times. If this happened outside those hours, there was no contravention.</p>`,
                legalFramework: `<p>Enforcement is under Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '40': {
                section2Title: 'Blue Badge Display',
                section2Content: `<p>A Blue Badge should show the photo, expiry date and badge number. If the badge was there but hard to read, the CEO should have tried harder to check it.</p>`,
                section3Title: 'Disabled Bay Requirements',
                section3Content: `<p>Disabled bays need a Traffic Regulation Order and signs that meet TSRGD 2016.</p>`,
                legalFramework: `<p>The council needs to show: a valid Traffic Regulation Order for the bay, compliant signage, and that no valid Blue Badge was properly displayed.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '45': {
                section2Title: 'Dropping Off Passengers',
                section2Content: `<p>Code 45 is for vehicles stopped on a taxi rank. If I only stopped briefly to let someone out or pick them up, that's different from "stopping" on the rank.</p>`,
                section3Title: 'Rank Markings',
                section3Content: `<p>Taxi ranks need clear road markings and signs meeting TSRGD 2016.</p>`,
                legalFramework: `<p>Taxi ranks are set up by Traffic Regulation Orders under the Road Traffic Regulation Act 1984.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '47': {
                section2Title: 'Reason for Stopping',
                section2Content: `<p>I had a good reason for stopping, or the bus stop signs weren't adequate. Stopping on a bus stop can be justified in emergencies or breakdowns.</p>`,
                section3Title: 'Bus Stop Signs',
                section3Content: `<p>Bus stops need proper markings and signs that meet TSRGD 2016.</p>`,
                legalFramework: `<p>Enforcement comes from Section 66 of the Traffic Management Act 2004 and the relevant Traffic Regulation Order.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            },
            '62': {
                section2Title: 'Where the Vehicle Was',
                section2Content: `<p>Code 62 is for parking with wheels on the footpath. If my vehicle was completely on the road, then this contravention doesn't apply.</p>`,
                section3Title: 'Narrow Roads',
                section3Content: `<p>Sometimes there's no choice but to have wheels partly on the pavement because the road is too narrow.</p>`,
                legalFramework: `<p>Footway parking enforcement comes from Section 66 of the Traffic Management Act 2004 and Schedule 3A of the Road Traffic Regulation Act 1984.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (England) General Regulations 2007'
            }
        },
        wales: {
            '01': {
                section2Title: 'Signage and Road Markings',
                section2Content: `<p>For a code 01 contravention to be valid, the waiting restrictions must be properly signed and marked. The yellow lines should comply with TSRGD 2016.</p>`,
                section3Title: 'Procedural Requirements',
                section3Content: `<p>The PCN must include certain information required by the Traffic Management Act 2004 and the 2008 Wales Regulations.</p>`,
                legalFramework: `<p>This PCN was issued under Section 66 of the Traffic Management Act 2004. Welsh councils must follow the Civil Enforcement of Parking Contraventions (Wales) Regulations 2008.</p>`,
                regulations: 'Civil Enforcement of Parking Contraventions (Wales) Regulations 2008'
            }
        }
    };
    
    const countryTemplates = templates[country] || templates['england'];
    return countryTemplates[code] || templates['england']['01'];
}

// Format date for display
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

async function sendConfirmationEmail(email, pcnRef, appealId, appealData) {
    const downloadUrl = `https://pcn-appeal-generator.web.app/success.html?payment=success&appeal=${encodeURIComponent(appealId)}`;
    
    // Generate PDF attachment
    let pdfAttachment = null;
    try {
        const pdfBuffer = await generatePDF(appealData);
        if (pdfBuffer) {
            pdfAttachment = pdfBuffer.toString('base64');
            console.log(`PDF generated for appeal ${appealId}, size: ${pdfBuffer.length} bytes`);
        }
    } catch (pdfError) {
        console.error('Failed to generate PDF, will send email without attachment:', pdfError.message);
    }
    
    // Humanised email template
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 32px; margin-top: 20px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #00236f; font-size: 24px; margin: 0;">FineFighters</h1>
            </div>
            
            <p style="color: #111827; font-size: 16px; line-height: 1.6;">Hi ${escapeHtml(appealData.applicantName || 'there')},</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Thanks for using finefighters.co.uk - we hope we made things a bit easier for you!</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;"><strong>Your appeal letter is ready to send.</strong> Here's what to do next:</p>
            
            <ul style="color: #374151; font-size: 16px; line-height: 1.8;">
                <li><strong>By email:</strong> Find your council's parking appeals email on their website and forward the letter over</li>
                <li><strong>By post:</strong> Print it out and send recorded - just in case you need proof they received it</li>
            </ul>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">The council has 14 days to get back to you. If they reject it, you can escalate to an independent adjudicator.</p>
            
            ${pdfAttachment ? `
            <div style="text-align: center; margin: 32px 0;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">Your appeal letter is attached to this email as a PDF.</p>
            </div>
            ` : `
            <div style="text-align: center; margin: 32px 0;">
                <a href="${downloadUrl}" style="display: inline-block; background-color: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Download Your Appeal Letter
                </a>
            </div>
            `}
            
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="color: #111827; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase;">Reference Details</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="color: #6b7280; padding: 6px 0;">Reference</td>
                        <td style="color: #111827; text-align: right; padding: 6px 0; font-family: monospace;">${escapeHtml(appealId.toUpperCase())}</td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280; padding: 6px 0;">PCN Reference</td>
                        <td style="color: #111827; text-align: right; padding: 6px 0;">${escapeHtml(pcnRef)}</td>
                    </tr>
                </table>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Any questions? Just reply to this email.</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Good luck!</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Cheers,<br>The FineFighters Team</p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    FineFighters | This is an automated email - please do not reply
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                    <a href="https://finefighters.co.uk/privacy" style="color: #6b7280;">Privacy Policy</a>
                    &nbsp;|&nbsp;
                    <a href="https://finefighters.co.uk/terms" style="color: #6b7280;">Terms of Service</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
Hi ${appealData.applicantName || 'there'},

Thanks for using finefighters.co.uk - we hope we made things a bit easier for you!

Your appeal letter is ready to send. Here's what to do next:

- By email: Find your council's parking appeals email on their website and forward the letter over
- By post: Print it out and send recorded - just in case you need proof they received it

The council has 14 days to get back to you. If they reject it, you can escalate to an independent adjudicator.

${pdfAttachment ? 'Your appeal letter is attached to this email as a PDF.' : `Download your letter: ${downloadUrl}`}

Reference: ${appealId.toUpperCase()}
PCN Reference: ${pcnRef}

Any questions? Just reply to this email.

Good luck!

Cheers,
The FineFighters Team
    `;

    const sendEmailWithRetry = async (retryCount = 0, maxRetries = 2) => {
        const baseDelay = 1000;
        const delay = baseDelay * Math.pow(2, retryCount);
        
        try {
            // Build email payload with optional attachment
            const emailPayload = {
                from: 'FineFighters <noreply@finefighters.co.uk>',
                to: email,
                subject: `Your PCN Appeal Letter - ${pcnRef}`,
                html: html,
                text: text
            };
            
            // Add PDF attachment if available
            if (pdfAttachment) {
                emailPayload.attachments = [{
                    filename: `PCN_Appeal_${pcnRef.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                    content: pdfAttachment,
                    type: 'application/pdf'
                }];
            }
            
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailPayload)
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

// Send payment failure notification email
async function sendPaymentFailedEmail(email, pcnRef, appealId, failureReason) {
    const retryUrl = `${getBaseUrl()}/app.html`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 32px; margin-top: 20px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #00236f; font-size: 24px; margin: 0;">FineFighters</h1>
            </div>
            
            <p style="color: #111827; font-size: 16px; line-height: 1.6;">Hi there,</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">We weren't able to process your payment for PCN appeal <strong>${escapeHtml(pcnRef)}</strong>.</p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Payment declined:</strong> ${escapeHtml(failureReason || 'Your card was declined')}</p>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">This can happen for a few reasons:</p>
            
            <ul style="color: #374151; font-size: 16px; line-height: 1.8;">
                <li>Insufficient funds</li>
                <li>Card expired or blocked</li>
                <li>Bank security settings</li>
            </ul>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${retryUrl}" style="display: inline-block; background-color: #00236f; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Try Again
                </a>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Your appeal details have been saved. You can try again with a different card if needed.</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Any questions? Just reply to this email.</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Cheers,<br>The FineFighters Team</p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    FineFighters | Reference: ${escapeHtml(appealId.toUpperCase())}
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
Hi there,

We weren't able to process your payment for PCN appeal ${pcnRef}.

Payment declined: ${failureReason || 'Your card was declined'}

This can happen for a few reasons:
- Insufficient funds
- Card expired or blocked
- Bank security settings

Try again at: ${retryUrl}

Your appeal details have been saved. You can try again with a different card if needed.

Any questions? Just reply to this email.

Cheers,
The FineFighters Team

Reference: ${appealId.toUpperCase()}
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'FineFighters <noreply@finefighters.co.uk>',
                to: email,
                subject: `Payment Failed - PCN Appeal ${pcnRef}`,
                html: html,
                text: text
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to send payment failure email:', errorText);
            return false;
        }

        const result = await response.json();
        console.log(`Payment failure email sent to ${email}, email ID: ${result.id}`);
        return true;
    } catch (error) {
        console.error('Error sending payment failure email:', error.message);
        return false;
    }
}

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
                country: data.country || 'england',
                applicantName: data.applicantName || '',
                applicantAddress: data.applicantAddress || '',
                applicantPostcode: data.applicantPostcode || '',
                evidenceFiles: data.evidenceFiles || []
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
// Scheduled function to delete appeals older than 30 days
exports.cleanupOldAppeals = functions
    .runWith({ secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY"] })
    .pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
        const db = admin.firestore();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        try {
            // Delete old appeals
            const appealsSnapshot = await db.collection('appeals')
                .where('createdAt', '<', thirtyDaysAgo)
                .get();
            
            const deletePromises = [];
            appealsSnapshot.forEach((doc) => {
                deletePromises.push(doc.ref.delete());
            });
            
            const appealsDeleted = await Promise.all(deletePromises);
            console.log(`Deleted ${appealsDeleted.length} old appeals`);
            
            // Delete old payments
            const paymentsSnapshot = await db.collection('payments')
                .where('createdAt', '<', thirtyDaysAgo)
                .get();
            
            const paymentDeletePromises = [];
            paymentsSnapshot.forEach((doc) => {
                paymentDeletePromises.push(doc.ref.delete());
            });
            
            const paymentsDeleted = await Promise.all(paymentDeletePromises);
            console.log(`Deleted ${paymentsDeleted.length} old payments`);
            
            return null;
        } catch (error) {
            console.error('Error cleaning up old data:', error);
            return null;
        }
    });

// Resend confirmation email for an existing appeal
exports.resendConfirmationEmail = functions
    .runWith({ 
        secrets: ["RESEND_API_KEY", "STRIPE_SECRET_KEY"],
        memory: '512MB',
        timeoutSeconds: 120
    })
    .https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            const { appealId } = req.query;
            
            if (!appealId) {
                return res.status(400).json({ error: 'Appeal ID is required' });
            }
            
            const appealDoc = await db.collection('appeals').doc(appealId).get();
            
            if (!appealDoc.exists) {
                return res.status(404).json({ error: 'Appeal not found' });
            }
            
            const appealData = appealDoc.data();
            
            if (!appealData.paid) {
                return res.status(400).json({ error: 'Appeal has not been paid' });
            }
            
            const result = await sendConfirmationEmail(appealData.email, appealData.pcnRef, appealId, appealData);
            
            if (result) {
                return res.json({ success: true, message: 'Confirmation email sent' });
            } else {
                return res.status(500).json({ error: 'Failed to send email' });
            }
        } catch (error) {
            console.error('Error resending confirmation email:', error);
            return res.status(500).json({ error: error.message });
        }
    });
});

// Download appeal PDF endpoint
exports.downloadAppealPDF = functions
    .runWith({
        secrets: ["STRIPE_SECRET_KEY"],
        memory: '1GB',
        timeoutSeconds: 120
    })
    .https.onRequest(async (req, res) => {
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

            const appealData = appealDoc.data();
            
            if (!appealData.paid) {
                return res.status(403).json({ error: 'Payment not completed' });
            }

            // Generate PDF
            const pdfBuffer = await generatePDF(appealData);
            
            if (!pdfBuffer) {
                return res.status(500).json({ error: 'Failed to generate PDF' });
            }

            // Set response headers for PDF download
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="PCN_Appeal_${appealData.pcnRef.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`,
                'Content-Length': pdfBuffer.length
            });

            return res.send(pdfBuffer);

        } catch (error) {
            console.error('Error in downloadAppealPDF:', error);
            return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
        }
    });
});
