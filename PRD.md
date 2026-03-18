# Council PCN Appeal Letter Generator - Product Requirements Document

## Document Information

| Field | Value |
|-------|-------|
| **Product Name** | PCN Appeal Generator |
| **Version** | 1.0 |
| **Status** | Draft |
| **Created** | 2026-03-17 |
| **Author** | Filip |
| **Last Updated** | 2026-03-17 |

---

## 1. Executive Summary

### 1.1 Product Vision

An AI-powered web application that helps UK motorists generate professional, legally-sound appeal letters for Council-issued Penalty Charge Notices (PCNs). The system guides users through a structured interview process, identifies valid grounds for appeal, and produces formatted letters ready for submission.

### 1.2 Problem Statement

UK councils issue millions of PCNs annually. Many are issued incorrectly or where valid mitigating circumstances exist. However, the appeals process is:

- **Complex** - Multiple grounds for appeal with specific legal requirements
- **Time-consuming** - Users must research legislation, draft letters, format correctly
- **Intimidating** - Legal language and formal procedures deter valid appeals
- **Error-prone** - Missing information or incorrect grounds lead to rejection

Research suggests up to 70% of motorists pay PCNs even when they have valid grounds to appeal, simply because they don't know how to challenge them effectively.

### 1.3 Solution

A guided interview application that:
1. Collects relevant facts about the PCN and circumstances
2. Identifies applicable grounds for appeal based on UK parking/bus lane/traffic regulations
3. Generates a professionally formatted appeal letter with correct legal references
4. Provides instructions for submission (online portal, email, post)

### 1.4 Success Metrics

| Metric | Target |
|--------|--------|
| Appeal success rate | >60% (vs ~50% national average) |
| User completion rate | >80% (start to finish) |
| Time to complete | <15 minutes average |
| User satisfaction | >4.5/5 rating |
| Monthly active users | 1,000+ within 6 months |

---

## 2. Target Users

### 2.1 Primary Persona: John, The Busy Professional

- **Age:** 35-55
- **Occupation:** Full-time employed professional
- **Tech Savvy:** Moderate
- **Situation:** Received a PCN, believes it was unfair, doesn't have time to research appeals process
- **Goal:** Quick, effective appeal without legal fees
- **Pain Points:** Time-poor, unfamiliar with parking regulations, anxious about getting it wrong

### 2.2 Secondary Persona: Margaret, The Careful Driver

- **Age:** 50-70
- **Occupation:** Retired or part-time
- **Tech Savvy:** Basic
- **Situation:** Rarely gets PCNs, this one feels wrong/unfair
- **Goal:** Fair outcome, principle matters more than money
- **Pain Points:** Legal jargon confusing, formal letters intimidating, wants to "do it right"

### 2.3 Tertiary Persona: Small Business Owner

- **Age:** 25-50
- **Occupation:** Self-employed (delivery, trades, services)
- **Tech Savvy:** Moderate
- **Situation:** Multiple PCNs from work driving, some unjustified
- **Goal:** Efficient bulk processing, reduce business costs
- **Pain Points:** Volume of PCNs, time cost vs fine cost, inconsistent enforcement

---

## 3. User Stories

### 3.1 Core User Stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| US-001 | User | Enter my PCN details quickly | I can start the appeal process without friction |
| US-002 | User | Be guided through relevant questions | I don't miss important information |
| US-003 | User | See which grounds for appeal apply to me | I know my options are valid |
| US-004 | User | Have the letter written for me | I don't need legal knowledge |
| US-005 | User | Understand what happens next | I feel confident submitting |
| US-006 | User | Save my progress | I can return later if interrupted |
| US-007 | User | Get my letter in multiple formats | I can submit via post, email, or portal |

### 3.2 Advanced User Stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| US-008 | Returning user | Access my previous appeals | I can reference or reuse them |
| US-009 | User with photos | Upload evidence images | My appeal is stronger with proof |
| US-010 | User | Get council-specific guidance | I submit to the right place correctly |
| US-011 | User | Understand my chances | I can decide if it's worth appealing |
| US-012 | User | Appeal to tribunal if rejected | I can escalate my case |

### 3.3 Admin/Analytics Stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| US-013 | Admin | View aggregate success rates | I can improve the system |
| US-014 | Admin | Update legal references | The system stays current |
| US-015 | Admin | See common rejection reasons | I can improve letter templates |

---

## 4. Functional Requirements

### 4.1 PCN Input Module (MVP)

**FR-001: PCN Reference Capture**
- System must accept PCN reference number
- System must accept vehicle registration number
- System must accept date of contravention
- System must accept time of contravention
- System must accept location of contravention
- System must accept council name (or auto-detect from location)

**FR-002: PCN Type Detection**
- System must identify PCN type from user input or selection:
  - Parking Charge Notice (on-street)
  - Parking Charge Notice (off-street/car park)
  - Bus Lane PCN
  - Moving Traffic PCN (e.g., box junction, one-way)
  - Lorry Ban PCN
  - Congestion Charge PCN

**FR-003: Contravention Code Identification**
- System must identify contravention code from PCN
- System must explain what each code means in plain English
- System must identify common codes:
  - 01: Parked in a restricted street during prescribed hours
  - 02: Parked or loading/unloading in a restricted street
  - 12: Parked in a residents' or shared use parking place without permit
  - 16: Parked in a permit space without permit
  - 21: Parked wholly or partly in a suspended bay/space
  - 47: Stopped on a restricted bus stop/stand
  - 31: Entering and stopping in a box junction when prohibited
  - 34: Being in a bus lane

### 4.2 Interview Module (MVP)

**FR-010: Structured Question Flow**
- System must present questions in logical sequence
- System must adapt questions based on PCN type and contravention code
- System must skip irrelevant questions
- System must allow users to go back and change answers

**FR-011: Circumstance Capture**
- System must capture mitigating circumstances:
  - Signage issues (unclear, missing, obscured)
  - Road markings issues (faded, confusing, missing)
  - Machine issues (faulty meter, out of order)
  - Permit issues (valid but not displayed, technical fault)
  - Loading/unloading activities
  - Medical emergencies
  - Vehicle breakdown
  - Blue Badge holder circumstances
  - Other (free text)

**FR-012: Evidence Capture**
- System must allow photo uploads (MVP: up to 5 images)
- System must allow description of each photo
- System must accept file types: JPG, PNG, PDF
- System must compress images for storage

**FR-013: Grounds for Appeal Identification**
- System must automatically identify applicable grounds based on answers:
  - Procedural impropriety (council errors)
  - Contravention did not occur
  - The penalty exceeded the relevant amount
  - The traffic order was invalid
  - Mitigating circumstances
- System must explain each ground in plain English
- System must recommend strongest ground(s)

### 4.3 Letter Generation Module (MVP)

**FR-020: Letter Template Engine**
- System must use structured templates for each appeal type
- System must insert user details correctly
- System must insert PCN details correctly
- System must insert council details correctly
- System must insert legal references appropriately
- System must generate coherent, professional prose

**FR-021: Legal Reference Insertion**
- System must reference relevant legislation:
  - Road Traffic Act 1991
  - Traffic Management Act 2004
  - Bus Lane Contraventions (Penalty Charges) Regulations 2005
  - The Civil Enforcement of Road Traffic Contraventions Regulations 2022
- System must reference relevant regulations:
  - The Local Authorities' Traffic Orders Regulations 1996
  - Applicable traffic orders (where known)
- System must reference PATAS/TPT case precedents where applicable

**FR-022: Letter Formatting**
- System must format letter with:
  - User's address block
  - Date
  - Council address block
  - Subject line with PCN reference
  - Formal salutation
  - Structured body paragraphs
  - Formal closing
  - Enclosure list
- System must generate in multiple formats:
  - PDF (primary)
  - DOCX (editable)
  - Plain text (copy/paste)

### 4.4 Submission Guidance Module (MVP)

**FR-030: Submission Instructions**
- System must provide council-specific submission methods
- System must provide council contact details (email, portal URL, address)
- System must explain appeal timeline (28 days)
- System must explain discount period (14 days for 50% discount)
- System must warn about late submissions

**FR-031: What to Expect**
- System must explain the appeals process stages:
  1. Informal appeal (optional)
  2. Formal representations
  3. Notice of Rejection/Notice of Acceptance
  4. Appeal to Tribunal (TPT/PATAS)
- System must provide timeline expectations

### 4.5 User Account Module (Post-MVP)

**FR-040: User Registration**
- System must allow email-based registration
- System must allow password reset
- System must store user profile information

**FR-041: Appeal History**
- System must save user appeals
- System must allow viewing previous appeals
- System must allow downloading previous letters
- System must track appeal status (user-reported)

### 4.6 Tribunal Appeal Module (Post-MVP)

**FR-050: Second-Stage Appeal Support**
- System must guide users through tribunal appeal process
- System must generate tribunal-specific forms
- System must explain evidence requirements for tribunal
- System must explain costs and risks

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Page load time | <3 seconds |
| NFR-002 | Letter generation time | <10 seconds |
| NFR-003 | Image upload processing | <5 seconds per image |
| NFR-004 | Concurrent users | 100+ without degradation |

### 5.2 Availability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-010 | Uptime | 99.5% monthly |
| NFR-011 | Planned maintenance | <4 hours/month, off-peak |
| NFR-012 | Recovery time | <1 hour from failure |

### 5.3 Security

| ID | Requirement |
|----|-------------|
| NFR-020 | All data in transit encrypted (HTTPS/TLS 1.3) |
| NFR-021 | User passwords hashed (bcrypt, cost factor 12+) |
| NFR-022 | Session tokens secured (HttpOnly, Secure, SameSite cookies) |
| NFR-023 | Input sanitisation for all user inputs |
| NFR-024 | Rate limiting on all endpoints (100 requests/minute) |
| NFR-025 | No storage of full credit card data |
| NFR-026 | GDPR compliance for all personal data |
| NFR-027 | Data retention: 2 years after last activity, then deletion |
| NFR-028 | Right to erasure implemented within 30 days |

### 5.4 Usability

| ID | Requirement |
|----|-------------|
| NFR-030 | WCAG 2.1 AA compliance |
| NFR-031 | Mobile-responsive design (works on 320px+ screens) |
| NFR-032 | Clear progress indicator throughout interview |
| NFR-033 | Help text available for each question |
| NFR-034 | Estimated time remaining displayed |
| NFR-035 | Auto-save progress every 30 seconds |

### 5.5 Reliability

| ID | Requirement |
|----|-------------|
| NFR-040 | Graceful degradation if AI service unavailable |
| NFR-041 | All generated letters logged for quality review |
| NFR-042 | Error tracking and alerting (Sentry or similar) |
| NFR-043 | Daily backups of user data |

---

## 6. Technical Architecture

### 6.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│                    (Next.js / React)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER                                  │
│                    (Next.js API Routes)                          │
├─────────────────────────────────────────────────────────────────┤
│  • /api/pcn/submit          • /api/appeal/generate              │
│  • /api/pcn/analyze         • /api/appeal/download              │
│  • /api/user/register       • /api/councils/search              │
│  • /api/user/login          • /api/health                       │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   AI SERVICE    │ │    DATABASE     │ │    STORAGE      │
│   (Claude API)  │ │   (PostgreSQL)  │ │   (S3/R2)       │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • Letter gen    │ │ • Users         │ │ • Evidence      │
│ • Grounds       │ │ • Appeals       │ │   photos        │
│   analysis      │ │ • Councils      │ │ • Generated     │
│ • Template      │ │ • Templates     │ │   letters       │
│   filling       │ │ • Legal refs    │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 6.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14+ (App Router) | SSR, API routes, excellent DX |
| **UI Components** | shadcn/ui + Tailwind CSS | Accessible, consistent, rapid dev |
| **Backend API** | Next.js API Routes | Unified codebase, serverless-ready |
| **Database** | PostgreSQL (Supabase) | Relational data, good free tier |
| **ORM** | Prisma | Type-safe, migrations |
| **AI** | Anthropic Claude API | High quality legal text generation |
| **File Storage** | Cloudflare R2 | S3-compatible, no egress fees |
| **Auth** | NextAuth.js / Clerk | Secure, GDPR-compliant |
| **PDF Generation** | React-PDF / Puppeteer | Server-side rendering |
| **Hosting** | Vercel | Zero-config deployment, edge functions |
| **Monitoring** | Sentry | Error tracking, performance |
| **Analytics** | PostHog (self-hostable) | Privacy-first, GDPR-friendly |

### 6.3 Data Model

```sql
-- Users (Post-MVP)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Appeals
CREATE TABLE appeals (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    
    -- PCN Details
    pcn_reference VARCHAR(100) NOT NULL,
    vehicle_registration VARCHAR(20) NOT NULL,
    council_name VARCHAR(255) NOT NULL,
    council_code VARCHAR(50),
    
    -- Contravention Details
    contravention_code VARCHAR(10),
    contravention_date DATE NOT NULL,
    contravention_time TIME NOT NULL,
    contravention_location TEXT NOT NULL,
    pcn_type VARCHAR(50) NOT NULL,
    pcn_amount DECIMAL(10,2),
    
    -- Appeal Details
    selected_grounds TEXT[],
    user_explanation TEXT,
    mitigating_circumstances TEXT[],
    evidence_descriptions TEXT,
    
    -- Output
    generated_letter TEXT,
    letter_pdf_url TEXT,
    letter_docx_url TEXT,
    
    -- Tracking
    status VARCHAR(50) DEFAULT 'draft',
    submitted_at TIMESTAMP,
    outcome VARCHAR(50),
    outcome_date DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Evidence Files
CREATE TABLE evidence_files (
    id UUID PRIMARY KEY,
    appeal_id UUID REFERENCES appeals(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Councils (reference data)
CREATE TABLE councils (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    website_url TEXT,
    appeal_portal_url TEXT,
    appeal_email VARCHAR(255),
    appeal_address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Legal References (reference data)
CREATE TABLE legal_references (
    id UUID PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    reference VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    applicable_grounds TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Appeal Templates
CREATE TABLE appeal_templates (
    id UUID PRIMARY KEY,
    pcn_type VARCHAR(50) NOT NULL,
    contravention_code VARCHAR(10),
    template_name VARCHAR(255) NOT NULL,
    template_content TEXT NOT NULL,
    required_fields TEXT[],
    optional_fields TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6.4 AI Integration

**Prompt Engineering Approach:**

The system uses structured prompts with:

1. **System Prompt**: Legal context, tone guidelines, UK regulations
2. **Template Injection**: Grounds-specific template with placeholders
3. **User Data**: Structured facts from interview
4. **Constraints**: Length limits, formatting requirements

**Example Prompt Structure:**
```
SYSTEM:
You are a legal assistant specializing in UK parking and traffic appeals.
Write formal appeal letters that are professional, concise, and legally sound.
Reference applicable legislation and regulations.
Tone: Professional but not aggressive, factual, clear.

TEMPLATE:
[Inject relevant template based on PCN type and grounds]

USER DATA:
PCN Reference: [ref]
Council: [council name]
Contravention Code: [code] - [description]
Date/Time: [date] at [time]
Location: [location]
Vehicle Registration: [reg]

Grounds for Appeal:
- [ground 1]: [explanation]
- [ground 2]: [explanation]

User's Explanation:
[user's own words about circumstances]

Evidence:
- [evidence item 1]
- [evidence item 2]

CONSTRAINTS:
- Length: 400-600 words
- Do not invent facts not provided
- Do not guarantee outcomes
- Include reference to discount period if applicable
- Request cancellation of PCN
```

---

## 7. User Interface Design

### 7.1 User Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Landing    │────▶│   PCN Input  │────▶│   Interview  │
│    Page      │     │    Form      │     │   Wizard     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                                                   ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Download   │◀────│   Letter     │◀────│   Grounds    │
│    Page      │     │   Preview    │     │   Summary    │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 7.2 Page Specifications

**Landing Page:**
- Hero section with value proposition
- "Start Your Appeal" CTA button
- Trust signals (success stats, testimonials)
- How it works (3-step process)
- FAQ section
- No login required to start

**PCN Input Page:**
- Clean form with clear labels
- OCR/upload PCN photo option (post-MVP)
- Council auto-complete/dropdown
- Contravention code lookup with explanations
- Progress bar (Step 1 of 4)

**Interview Wizard:**
- One question per screen (mobile-friendly)
- Clear progress indicator
- Back/Next navigation
- Save and continue later option
- Help text expandable for each question
- Conditional question logic

**Grounds Summary Page:**
- Identified grounds listed with checkmarks
- Brief explanation of each ground
- User can deselect grounds
- "Edit answers" option
- Estimated success indicator (post-MVP)

**Letter Preview Page:**
- Full letter rendered
- Editable sections highlighted
- Download options (PDF, DOCX, TXT)
- Copy to clipboard button
- Submission instructions sidebar

**Download Page:**
- Download buttons prominent
- Submission instructions for specific council
- What to expect next
- Option to save to account (if logged in)
- Share via email option

### 7.3 Mobile Considerations

- Touch-friendly form inputs (min 44px tap targets)
- Vertical layout optimized
- Camera integration for evidence photos
- Offline draft saving (localStorage)
- Progressive Web App (PWA) for home screen install

---

## 8. Legal & Compliance

### 8.1 Disclaimer Requirements

**On Every Letter:**
```
IMPORTANT: This letter was generated by an automated system and does not 
constitute legal advice. While every effort has been made to ensure accuracy, 
you should verify all information before submission. The outcome of your 
appeal depends on the specific circumstances and the council's discretion.
```

**On Website Footer:**
- Not legal advice disclaimer
- No guarantee of success
- Privacy policy link
- Terms of service link
- Contact information

### 8.2 Data Protection (UK GDPR)

| Requirement | Implementation |
|-------------|----------------|
| Lawful basis | Legitimate interest + user consent |
| Data minimisation | Collect only necessary PCN details |
| Purpose limitation | Only for appeal generation |
| Storage limitation | 2-year retention, then deletion |
| Accuracy | User can edit all data |
| Integrity | Encrypted storage, secure transmission |
| Accountability | Privacy policy, data processing records |

### 8.3 Terms of Service (Key Points)

1. Service is provided "as is" without warranties
2. User responsible for accuracy of information provided
3. User responsible for timely submission
4. Generated letters may be stored for quality improvement
5. No liability for appeal outcomes
6. User grants license to use submitted data for service improvement
7. Account termination rights for abuse

---

## 9. Roadmap

### Phase 1: MVP (8 weeks)

**Weeks 1-2: Foundation**
- [ ] Project setup (Next.js, Tailwind, shadcn/ui)
- [ ] Database schema and migrations
- [ ] Council data seeding (all UK councils)
- [ ] Basic UI structure and routing

**Weeks 3-4: Core Interview**
- [ ] PCN input form
- [ ] Interview wizard component
- [ ] Question flow logic
- [ ] Progress saving (localStorage)

**Weeks 5-6: Letter Generation**
- [ ] AI integration (Claude API)
- [ ] Template system
- [ ] Legal reference database
- [ ] Letter preview component

**Weeks 7-8: Output & Polish**
- [ ] PDF generation
- [ ] DOCX export
- [ ] Submission instructions
- [ ] Mobile responsive design
- [ ] Error handling and validation
- [ ] Basic testing
- [ ] Deployment

### Phase 2: User Accounts (4 weeks)

- [ ] User registration/login
- [ ] Appeal history dashboard
- [ ] Appeal status tracking
- [ ] Email notifications
- [ ] Password reset flow

### Phase 3: Enhanced Features (6 weeks)

- [ ] Evidence photo upload
- [ ] Council-specific submission portals
- [ ] OCR for PCN photo scanning
- [ ] Appeal success probability estimator
- [ ] Tribunal appeal support

### Phase 4: Scale & Optimize (ongoing)

- [ ] Analytics dashboard
- [ ] A/B testing for conversion
- [ ] Success rate tracking
- [ ] Template optimization based on outcomes
- [ ] Multi-language support (Welsh, etc.)
- [ ] API for partners

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI generates incorrect legal references | Medium | High | Template-based approach with pre-verified references; human review of templates |
| User provides incorrect information | High | Medium | Clear instructions; validation; disclaimer |
| Council rejects technically correct appeals | Medium | Medium | Cannot control council decisions; focus on quality letters |
| Service used frivolously | Medium | Low | No filtering; valid appeals are valid regardless of frequency |
| Legal regulation changes | Low | High | Monitor legislation; update templates quickly |
| AI service outage | Low | Medium | Fallback templates; queue and retry; user notification |
| Data breach | Low | High | Strong security practices; minimal data collection; encryption |
| User expectation misalignment | Medium | Medium | Clear disclaimers; expectation setting in UI |
| Council blocks automated submissions | Low | Medium | Letters designed for manual submission; portal submission post-MVP |

---

## 11. Success Criteria

### MVP Launch Criteria

- [ ] All core user stories (US-001 to US-007) implemented
- [ ] All functional requirements (FR-001 to FR-031) met
- [ ] All NFRs met
- [ ] Mobile-responsive design verified
- [ ] Security review passed
- [ ] GDPR compliance verified
- [ ] Beta testing with 20+ users completed
- [ ] Documentation complete

### Success Metrics (6 months post-launch)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Appeal success rate | >60% | User-reported outcomes |
| User completion rate | >80% | Analytics funnel |
| Average time to complete | <15 min | Session duration tracking |
| User satisfaction (NPS) | >50 | Post-appeal survey |
| Monthly active users | 1,000+ | Analytics |
| Return users | >20% | User account tracking |
| Organic traffic | >50% of users | Referrer analysis |

---

## 12. Open Questions

| Question | Owner | Decision Needed By | Status |
|----------|-------|-------------------|--------|
| Should we offer a free tier with limited letters? | Product | Week 4 | Open |
| Do we need a legal professional to review templates? | Legal | Week 6 | Open |
| Should we store generated letters indefinitely? | Product/Legal | Week 8 | Open |
| Can we auto-submit to council portals? | Technical | Phase 3 | Open |
| Should we charge for the service? If so, pricing model? | Product/Business | Phase 2 | Open |
| Do we need Welsh language support? | Product | Phase 4 | Open |
| Should we support Scotland (different regulations)? | Product | Phase 3 | Open |

---

## 13. Appendix

### A. Contravention Code Reference

Common contravention codes and their meanings (see separate document for full list):

| Code | Description | Common Grounds for Appeal |
|------|-------------|---------------------------|
| 01 | Parked in restricted street | Loading exemption, signage issues |
| 02 | Parked in loading restricted street | Active loading, signage issues |
| 11 | Parked without payment | Faulty machine, permit held |
| 12 | Parked without permit in residents' bay | Permit held, signage issues |
| 16 | Parked in permit space without permit | Permit valid, signage issues |
| 21 | Parked in suspended bay | Suspension signage unclear |
| 25 | Parked in loading place | Active loading |
| 30 | Parked for longer than permitted | Loading, medical emergency |
| 31 | Stopped in box junction | Exit clear, traffic conditions |
| 34 | In bus lane | Outside operating hours, signage |
| 47 | Stopped on bus stop | Alighting passenger, breakdown |
| 62 | Parked with one or more wheels on footway | No dropped kerb, signage issues |

### B. Council Data Sources

- [ ] Gov.uk council directory
- [ ] London Councils list
- [ ] PATAS/TPT council codes
- [ ] Individual council websites for submission methods

### C. Legal Reference Library

Key legislation to be maintained in the system:

1. **Road Traffic Act 1991** - Schedule 6 (parking contraventions)
2. **Traffic Management Act 2004** - Part 6 (civil enforcement)
3. **Civil Enforcement of Parking Contraventions Regulations 2007**
4. **Bus Lane Contraventions Regulations 2005**
5. **Civil Enforcement of Road Traffic Contraventions Regulations 2022**
6. **Local Authorities' Traffic Orders Regulations 1996**
7. **Road Traffic Regulation Act 1984**
8. **Disabled Persons (Badges for Motor Vehicles) Regulations 2000**

### D. Competitor Analysis

| Competitor | Strengths | Weaknesses |
|------------|-----------|------------|
| ParkingOnPrivateLandAppeals.co.uk | Established, forum-based | Manual process, outdated UI |
| AppealNow | Simple interface | Limited customization, paid |
| FightMyPCN | AI-assisted | Limited coverage, paid |
| ParkingEye appeals | Free templates | Generic, not personalized |

### E. Sample Appeal Letter

```
[Your Name]
[Your Address]
[Postcode]

[Council Name]
[Council Address]
[Postcode]

[Date]

Dear Sir/Madam,

RE: FORMAL REPRESENTATIONS AGAINST PENALTY CHARGE NOTICE [PCN REFERENCE]

I am writing to make formal representations against the above Penalty Charge 
Notice, issued on [DATE] at [TIME] at [LOCATION].

The PCN was issued for alleged contravention code [CODE]: [DESCRIPTION].

I submit that this PCN should be cancelled on the following grounds:

1. THE CONTRAVENTION DID NOT OCCUR

[Detailed explanation of why the alleged contravention did not take place,
with reference to specific facts and any supporting evidence]

2. PROCEDURAL IMPROPRIETY

[If applicable: description of any procedural errors by the council,
such as incorrect signage, missing information on the PCN, etc.]

3. MITIGATING CIRCUMSTANCES

[If applicable: description of any mitigating circumstances that should
be taken into consideration]

In support of my representations, I enclose the following evidence:
- [Evidence item 1]
- [Evidence item 2]

I request that the PCN be cancelled. Should the council decide to reject 
these representations, I request a Notice of Rejection setting out the 
reasons for the decision, together with details of my right to appeal 
to the Traffic Penalty Tribunal.

I reserve the right to make further representations should additional 
information become available.

Yours faithfully,

[Your Name]

Enclosures: [List]
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-17 | Filip | Initial draft |
| 1.0 | 2026-03-17 | Filip | Complete PRD |

---

*End of Document*