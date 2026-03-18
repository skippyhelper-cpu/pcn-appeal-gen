# Cipher Project Context: PCN Appeal Generator

**Last Updated:** 2026-03-17  
**Status:** PRD Complete, Ready for Build  
**Next Phase:** Development

---

## Quick Reference

| Item | Value |
|------|-------|
| **Product** | Council PCN Appeal Letter Generator |
| **Stack** | Next.js, PostgreSQL, Claude API (structure only) |
| **Scope** | 10 appeal scenarios, static templates, NO AI generation |
| **Users** | UK motorists challenging unfair PCNs |
| **PRD Location** | `/projects/pcn-appeal/PRD.md` (~30KB, 872 lines) |

---

## Key Technical Decisions

1. **Static Templates Only** — No AI-generated appeal text. Pre-written templates with variable substitution.
2. **Claude API for Structure** — Interview flow, question branching, ground selection. NOT for letter writing.
3. **10 Appeal Scenarios** — Fixed set of contravention codes and appeal grounds.
4. **Multi-format Output** — PDF, Word, plain text for different submission methods.
5. **No User Accounts (MVP)** — Session-based, optional email for save/resume.

---

## Architecture Overview

```
Frontend (Next.js)
  ├── Interview Wizard (multi-step form)
  ├── Appeal Grounds Selector
  ├── Letter Preview
  └── Download/Export

Backend (Next.js API routes)
  ├── Interview state management
  ├── Template engine
  ├── PDF/Word generation
  └── Email service (resend/sendgrid)

Database (PostgreSQL)
  ├── Templates (appeal scenarios)
  ├── Contravention codes
  └── Session storage

External
  └── Claude API (interview structure only)
```

---

## Current State

- ✅ PRD complete with all sections
- ✅ Technical architecture defined
- ✅ Data model with SQL schemas
- ✅ UI/UX specifications
- ✅ Legal compliance section
- ✅ 4-phase roadmap (MVP 8 weeks)
- ⏳ **Next:** Technical setup, database schema, template structure

---

## Critical Constraints

1. **Legal Safety** — Must include disclaimers, not legal advice
2. **Template Quality** — Letters must be professionally written, legally sound
3. **User Flow** — <15 minutes to complete, >80% completion rate
4. **Accessibility** — Must work for less tech-savvy users (Margaret persona)

---

## Open Questions (from PRD)

1. Payment model — Free vs. freemium vs. one-time fee?
2. Council-specific submission portals — Auto-detect or manual?
3. Evidence upload — Photos, documents support?
4. Appeals tracking — Follow-up on outcomes?

---

## Files in Project

```
/projects/pcn-appeal/
├── PRD.md              # Full requirements document
├── CIPHER_CONTEXT.md   # This file
└── [TBD]              # Code, schemas, templates
```

---

## How to Use This Context

When spawning Cipher for PCN work:
1. Read this file first
2. Reference PRD.md for detailed specs
3. Ask Filip for clarification on open questions
4. Track progress against 4-phase roadmap

---

*Spawned from: agent:main:discord:channel:1468348001268531413*  
*Project Owner: Filip*
