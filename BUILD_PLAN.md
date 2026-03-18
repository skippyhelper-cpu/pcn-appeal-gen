# PCN Appeal Generator - Build Plan & Technical Specification
## Software Requirements Specification (SRS)

**Version:** 1.1  
**Date:** 2026-03-17  
**Status:** Ready for Development  

---

## 1. Executive Summary

This document provides the technical build plan, architecture, and implementation roadmap for the PCN Appeal Generator. It complements the PRD with specific technical decisions, payment integration, and phased development approach.

---

## 2. Technical Architecture

### 2.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Web App   │  │   Mobile    │  │   PWA       │             │
│  │  (Next.js)  │  │  (Responsive)│  │  (Offline)  │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Vercel    │
                    │   Edge      │
                    └──────┬──────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      API LAYER                                   │
│                    (Next.js API Routes)                          │
├──────────────────────────────────────────────────────────────────┤
│  Auth │ Appeal │ Payment │ Templates │ Admin │ Webhook          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
    │  Supabase │   │  Lemon    │   │  Claude   │
    │PostgreSQL │   │  Squeezy  │   │    API    │
    │   + Auth  │   │           │   │           │
    └───────────┘   └───────────┘   └───────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 14+ (App Router) | React framework with SSR |
| **UI Library** | shadcn/ui | Latest | Accessible components |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **Backend** | Next.js API Routes | 14+ | Serverless API endpoints |
| **Database** | PostgreSQL | 15+ | Relational data |
| **Database Platform** | Supabase | Latest | PostgreSQL + Auth |
| **ORM** | Prisma | 5+ | Type-safe database access |
| **Auth** | Supabase Auth | Latest | JWT-based authentication |
| **Payment** | LemonSqueezy | Latest | Payment processing |
| **AI** | Claude API | Latest | Template selection logic |
| **PDF** | React-PDF | Latest | PDF generation |
| **Email** | Resend | Latest | Transactional emails |
| **Hosting** | Vercel | Latest | Edge deployment |
| **Monitoring** | Sentry | Latest | Error tracking |
| **Analytics** | PostHog | Latest | Product analytics |

---

## 3. Payment System

### 3.1 Pricing Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | £0 | 1 appeal letter per month, basic templates, PDF export |
| **Pro** | £4.99/month | Unlimited appeals, all templates, DOCX export, priority support |
| **Pro Annual** | £39.99/year | Same as Pro, 33% discount |

### 3.2 LemonSqueezy Integration

**Why LemonSqueezy:**
- Merchant of Record (handles VAT/tax)
- UK/EU compliant
- Simple webhook-based integration
- Supports subscriptions + one-time

**Implementation:**
1. User selects plan
2. Redirect to LemonSqueezy checkout
3. Webhook confirms payment
4. Update user subscription in database
5. Grant access to paid features

**Webhooks to handle:**
- `order_created` - New subscription
- `subscription_updated` - Plan change
- `subscription_cancelled` - Cancellation
- `subscription_expired` - Non-renewal

---

## 4. Frontend Architecture

### 4.1 Page Structure

```
/
├── /                    # Landing page
├── /login               # Auth (Supabase)
├── /register            # Sign up
├── /dashboard           # User dashboard
├── /appeal/
│   ├── /new             # Start new appeal
│   ├── /[id]            # View/edit appeal
│   └── /[id]/letter     # Generated letter
├── /templates           # Browse templates
├── /pricing             # Pricing page
└── /api/                # API routes
```

### 4.2 Key Components

| Component | Purpose |
|-----------|---------|
| `AppealWizard` | Multi-step form for appeal creation |
| `TemplateSelector` | Choose from 10 appeal templates |
| `LetterPreview` | Live preview of generated letter |
| `PaymentModal` | Upgrade/payment prompt |
| `ProgressBar` | Wizard progress indicator |

---

## 5. Backend Architecture

### 5.1 API Routes

```
/api/
├── /auth/               # Authentication
├── /appeals/            # CRUD for appeals
├── /templates/          # Template data
├── /payment/            # Payment handling
├── /councils/           # Council data
└── /health              # Health check
```

---

## 6. Build Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (Next.js, Tailwind, shadcn/ui)
- [ ] Database setup (Supabase, Prisma)
- [ ] Authentication (Supabase Auth)
- [ ] Basic UI structure

### Phase 2: Core Features (Week 3-4)
- [ ] Appeal wizard
- [ ] Template system
- [ ] Letter generation
- [ ] PDF export

### Phase 3: Payment (Week 5)
- [ ] LemonSqueezy integration
- [ ] Subscription management
- [ ] Payment webhooks

### Phase 4: Polish (Week 6-8)
- [ ] Testing
- [ ] Mobile optimization
- [ ] Error handling
- [ ] Deployment

---

## 7. Success Criteria

- [ ] All 10 templates implemented
- [ ] Payment flow working
- [ ] PDF generation working
- [ ] Mobile responsive
- [ ] Deployed to Vercel

---

*Ready for development*
