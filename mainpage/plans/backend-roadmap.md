# Sindicato Backend Roadmap — Comprehensive Build Plan

**Version 1.0 | May 2026**
**Status: Planning**

---

## Current State Assessment

**What exists now:**
- Next.js 16.2 frontend with Tailwind CSS, Framer Motion
- Landing page with Hero, Numbers, Manifesto, HowItWorks, CTAs, FeaturedCase, TrustBar, Footer
- `CaseForm.tsx` — client-side form with all PRD fields (display name, country, projects, dates, amount, story, email, claim types, consents, attestation)
- `/api/cases` POST route — validates claim types, logs to console, TODO: save to Neon DB
- `/api/stats` GET route — returns hardcoded mock stats (1 Alignerr case, €5000)
- No database, no auth, no email, no AI, no cron jobs, no company pages

**What needs to be built (the entire backend):**

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | **Neon (PostgreSQL)** | PRD mentions Neon DB, serverless, branch-per-PR |
| ORM | **Drizzle ORM** | TypeScript-native, lightweight, Neon-compatible |
| Auth | **NextAuth.js v5** | Email magic link + verification code flow |
| Email provider | **Resend** | Modern API, React email templates, free tier |
| AI gateway | **OpenRouter** | Explicit in AI plan — single key, model routing |
| Job scheduler | **node-cron + Vercel Cron** | For weekly emails, nightly pattern detection |
| PDF generation | **React Email → PDF** | For cluster reports and non-retaliation agreements |
| File storage | **Vercel Blob** or **Cloudflare R2** | For generated PDFs |
| Validation | **Zod** | TypeScript schema validation on API routes |
| Payments | **Stripe** | Company resolution fees, lawyer referral fees |

---

## PHASE 0 — Foundation (SEQUENTIAL — Must Be Done First, Alone)

**Why sequential:** Every other feature depends on the database schema, auth system, and core API utilities. Cannot be parallelized.

### Task 0.1 — Project Infrastructure Setup
- Initialize `src/lib/` directory structure (`db/`, `auth/`, `email/`, `ai/`, `utils/`)
- Install dependencies: `drizzle-orm`, `@neondatabase/serverless`, `zod`, `next-auth`, `resend`, `openrouter-sdk` (or fetch wrapper), `stripe`, `nanoid`
- Create `.env.example` with all required keys (from AI plan: `OPENROUTER_API_KEY`, `DATABASE_URL`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `NEXTAUTH_SECRET`)
- Configure `next.config.ts` with any needed server-side settings

### Task 0.2 — Database Schema Design & Migration
- **`workers`** table: id, email, display_name, phone (optional), email_verified, phone_verified, created_at, updated_at
- **`companies`** table: id, slug (unique), name, public_email, website_url, logo_url, created_at
- **`cases`** table: id, worker_id (FK), company_id (FK), display_name, country, projects, date_range, amount_owed, currency, contact_attempts, story, story_translated, translation_language, email, claim_types (jsonb), other_description, status (active/resolved/deleted), attestation, consent_legal, consent_collective, resolution_feedback, last_follow_up_sent_at, created_at, updated_at
- **`company_verifications`** table: id, company_id, employee_name, employee_role, official_email, email_verified, non_retaliation_signed, signed_agreement_url, stripe_payment_id, created_at
- **`data_access_logs`** table: id, case_id, accessor_id (FK to company_verifications), accessed_at, worker_notified
- **`reports`** table: id, company_id, report_type (lawyer/company), content, pdf_url, generated_at
- Create Drizzle schema files, run initial migration against Neon

### Task 0.3 — Core Utility Functions
- **Redaction utilities** (`src/lib/utils/redaction.ts`): `redactName()`, `redactEmail()` — as specified in PRD
- **API response helpers** (`src/lib/utils/api.ts`): standardized success/error responses
- **Zod schemas** (`src/lib/utils/schemas.ts`): case submission schema, company slug validation, etc.

### Task 0.4 — Auth System (Worker)
- NextAuth.js v5 config with email provider (magic link)
- Verification code flow: send 6-digit code to email, verify in DB
- `src/app/api/auth/[...nextauth]/route.ts`
- Worker session management
- Rate limiting on auth endpoints (per IP)

---

## PHASE 1 — Core Case Pipeline (PARALLEL after Phase 0)

After Phase 0 is complete, these three tracks can run in parallel across different opencode sessions without conflict.

---

### Track A: Case Submission + Public Display (PARALLEL)
**Files touched:** `src/app/api/cases/`, `src/lib/db/queries/cases.ts`, `src/app/components/CaseForm.tsx`, new `src/app/(cases)/` routes

| Subtask | Description |
|---------|-------------|
| A.1 | Wire `/api/cases` POST to Drizzle — insert into `cases` table with validation |
| A.2 | Create `/api/cases` GET endpoint — public cases with redaction applied server-side |
| A.3 | Create `/api/cases/[id]` GET — single case detail (redacted) |
| A.4 | Build Cases Wall page `src/app/(cases)/cases/page.tsx` — cards with redacted data |
| A.5 | Build company campaign page `src/app/[company]/page.tsx` — dashboard with aggregated stats |
| A.6 | Build company report page `src/app/[company]/report/page.tsx` — institutional/data-forward view |
| A.7 | Update `/api/stats` to query real DB instead of mock data |
| A.8 | Add word count validation (100-500 words) on story field server-side |
| A.9 | Add language detection (franc or langdetect) on story at submission |

**Conflict risk:** NONE — only touches case-related files

---

### Track B: AI Writing Assistant (PARALLEL)
**Files touched:** `src/lib/ai/`, `src/app/api/ai/`, `src/app/components/CaseForm.tsx` (minor addition)

| Subtask | Description |
|---------|-------------|
| B.1 | Create `src/lib/ai/openrouter.ts` — OpenRouter client wrapper with model routing from env vars |
| B.2 | Create `src/lib/ai/prompts.ts` — system prompts for writing assistant, translation, scoring |
| B.3 | Create `/api/ai/writing-assistant` POST endpoint — takes structured fields + raw story, returns structured version |
| B.4 | Add rate limiting per IP on AI endpoints |
| B.5 | Add "Help me express this clearly" button + side-by-side UI to CaseForm.tsx |
| B.6 | Add disclaimer beneath button per AI plan spec |
| B.7 | Create `/api/ai/case-strength` POST endpoint — scoring system (8-element checklist) |
| B.8 | Add strength indicator display after case submission |

**Conflict risk:** LOW — Track A may also touch CaseForm.tsx. Coordinate: Track A owns the form validation/submission logic, Track B owns the AI button/assistant UI section. Minor merge needed on CaseForm.tsx only.

---

### Track C: Email Infrastructure + Auto-Notification (PARALLEL)
**Files touched:** `src/lib/email/`, `src/app/api/email/`, `src/app/api/cron/`

| Subtask | Description |
|---------|-------------|
| C.1 | Set up Resend account + domain verification |
| C.2 | Create `src/lib/email/templates/` — React Email templates for: new-case-notification, resolution-follow-up, worker-data-accessed, weekly-company-report |
| C.3 | Create `src/lib/email/send.ts` — wrapper around Resend |
| C.4 | Create `/api/cron/resolution-followup` — daily cron for 30-day active case follow-ups |
| C.5 | Wire auto-email to company on new case submission (triggered in cases POST) |
| C.6 | Create worker notification email on data access (triggered in data access flow) |

**Conflict risk:** LOW — Track A's case POST route will need to call C.5's email function. Coordination point: agree on the import interface (`notifyCompanyNewCase(companyEmail, caseSummary)`). Track C exports the function, Track A imports it.

---

## PHASE 2 — AI Scraping + Translation + Weekly Reports (PARALLEL after Phase 1)

### Track D: AI Company Public Email Scraper (PARALLEL)
**Files touched:** `src/lib/scraper/`, `src/app/api/cron/`, `src/lib/db/queries/companies.ts`

| Subtask | Description |
|---------|-------------|
| D.1 | Build company email discovery module (`src/lib/scraper/company-emails.ts`) — scrape public contact emails from company websites using fetch + Cheerio or Playwright |
| D.2 | AI-enhanced email extraction: use OpenRouter (Kimi K2) to identify the best public contact email from scraped page content |
| D.3 | Store discovered emails in `companies.public_email` field |
| D.4 | Create `/api/cron/scrape-company-emails` cron endpoint — runs weekly, re-scrapes all companies without known emails |
| D.5 | Manual trigger endpoint `/api/admin/scrape-company-email/[companyId]` |
| D.6 | Fallback: allow manual email entry in company admin |

**Conflict risk:** NONE — isolated module

---

### Track E: Multilingual Translation Pipeline (PARALLEL)
**Files touched:** `src/lib/ai/translation.ts`, `src/app/api/cases/` (minor)

| Subtask | Description |
|---------|-------------|
| E.1 | Create `src/lib/ai/translation.ts` — OpenRouter translation call with Kimi K2 Instant |
| E.2 | Hook translation into case submission pipeline — translate after insert, store `story_translated` |
| E.3 | Add original/English toggle on Cases Wall cards |
| E.4 | Cache strategy: translate once at submission, serve cached translation |
| E.5 | Support languages: PT-BR, PT, ES, HI, FIL, RO, PL, FR, DE |

**Conflict risk:** MEDIUM — needs to modify the same case submission flow that Track A built. Must wait for Track A to complete.

---

### Track F: Weekly Company Email Reports (PARALLEL)
**Files touched:** `src/lib/email/templates/`, `src/app/api/cron/`, `src/lib/reports/`

| Subtask | Description |
|---------|-------------|
| F.1 | Create `src/lib/reports/weekly-stats.ts` — aggregate stats per company from DB |
| F.2 | Create weekly report email template (React Email) — total cases, new this week, total unpaid, projects named, unresolved count |
| F.3 | Create `/api/cron/weekly-company-report` — weekly cron (Monday 9am UTC) |
| F.4 | Email sends to company's `public_email` with link to their report page |
| F.5 | If no public email yet, log warning for admin follow-up |

**Conflict risk:** NONE — uses email infrastructure from Track C and data from Track A, but operates on its own files.

---

## PHASE 3 — Monetization + Company Portal (SEQUENTIAL — depends on Phase 1)

**Why sequential:** Payment flow touches auth (company verification), database (access logs), email (worker notification), and has legal implications. Should be built carefully in one session.

### Task 3.1 — Company Verification Flow
- Company signup with official domain email only
- Email verification code to official email
- Capture employee name + role
- Digital non-retaliation agreement with timestamp

### Task 3.2 — Stripe Integration
- Create Stripe products: €200/worker contact (company), tiered lawyer fees
- Checkout session creation endpoint
- Webhook handler for payment confirmation
- Payment triggers data access log + worker notification

### Task 3.3 — Data Access & Release
- After payment + signed agreement: release unredacted contact list
- Log every access in `data_access_logs`
- Auto-send notification to every affected worker with attached signed non-retaliation PDF
- Rate limit access endpoints

### Task 3.4 — AI Cluster Report Generation
- On payment, auto-generate PDF report (lawyer or company variant)
- DeepSeek V3 via OpenRouter for report content
- Convert to PDF, store, deliver to purchaser
- Different framing: lawyer = case-focused, company = resolution-focused

### Task 3.5 — Company Dashboard Portal
- Company login (official email)
- View case counts, totals, trends
- Resolution pathway CTA
- Payment portal for access

---

## PHASE 4 — Worker Case Management (PARALLEL after Phase 3)

### Task 4.1 — Worker Authenticated Area
- Worker dashboard: list their cases, status, timeline
- Edit case endpoint (with validation)
- Mark resolved endpoint + resolution feedback form
- Delete case endpoint (soft delete, removes from all displays)

### Task 4.2 — Resolution Workflow
- Resolved cases removed from active unpaid totals
- Worker feedback published on company report page
- Dashboard shows active vs resolved counts separately

---

## PHASE 5 — Advanced AI Features (PARALLEL after Phase 4)

### Task 5.1 — Nightly Pattern Detection
- Cron job at 2am UTC using DeepSeek R1
- Analyze aggregate case data (no PII, no testimony text)
- Detect: same company/project/timeframe clusters, cross-company tactics, seasonal patterns, geographic clustering
- Update dashboard patterns table
- Threshold alerts (20/50/100 case milestones)

### Task 5.2 — Legal Triage Pre-Screening
- When worker opts into legal support: AI pre-screen
- Generate structured pre-screen summary for partner lawyers
- Jurisdiction notes, completeness score, key elements

### Task 5.3 — AI Cluster Report Auto-Refresh
- Nightly refresh of cluster reports as new cases arrive
- Cache in reports table, only regenerate on new case for that company

---

## Parallelization Map

```
PHASE 0 (Sequential — ONE session)
  └── Infrastructure, DB schema, Auth, Utilities
       │
PHASE 1 (3 parallel tracks — 3 sessions simultaneously)
  ├── Track A: Case CRUD + Public Display
  ├── Track B: AI Writing Assistant + Strength Indicator
  └── Track C: Email Infra + Auto-Notifications
       │
PHASE 2 (3 parallel tracks — 3 sessions simultaneously)
  ├── Track D: AI Company Email Scraper
  ├── Track E: Translation Pipeline (needs A done)
  └── Track F: Weekly Company Email Reports
       │
PHASE 3 (Sequential — ONE session, payment/legal sensitivity)
  └── Stripe, Company Verification, Data Access, Reports
       │
PHASE 4 (2 parallel tasks — 2 sessions)
  ├── Worker Dashboard + Auth
  └── Resolution Workflow
       │
PHASE 5 (3 parallel tasks — 3 sessions)
  ├── Pattern Detection Cron
  ├── Legal Triage
  └── Report Auto-Refresh
```

---

## Conflict Risk Matrix

| Track | Touches | Conflicts with | Mitigation |
|-------|---------|----------------|------------|
| A (Cases) | `cases/` routes, DB queries | C (email call in POST) | Agree on import interface early |
| B (AI Assistant) | `CaseForm.tsx`, AI routes | A (same form file) | B only adds UI section, doesn't modify existing fields |
| C (Email) | Email templates, cron | A (POST calls C's function) | C exports function, A imports — no file conflict |
| D (Scraper) | Scraper module, cron | None | Fully isolated |
| E (Translation) | Case submission flow | A (modifies same POST) | Wait for A to complete |
| F (Weekly Reports) | Email, cron, reports | None | Uses C's email lib, read-only DB |

---

## Key Coordination Interfaces

These need to be agreed upon before parallel work begins:

1. **`notifyCompanyNewCase(companySlug: string, caseSummary: CaseSummary): Promise<void>`** — Track C exports, Track A calls
2. **`translateCase(caseId: string, story: string, detectedLang: string): Promise<string>`** — Track E exports, post-Phase-1 integration
3. **`redactCase(case: Case): PublicCase`** — Phase 0 utility, used by all display routes
4. **`generateWeeklyReport(companyId: string): Promise<WeeklyReport>`** — Track F internal

---

## Estimated Timeline

| Phase | Duration | Sessions |
|-------|----------|----------|
| Phase 0 | 2-3 days | 1 session |
| Phase 1 | 3-4 days | 3 parallel sessions |
| Phase 2 | 2-3 days | 3 parallel sessions |
| Phase 3 | 3-4 days | 1 session (sequential) |
| Phase 4 | 2 days | 2 parallel sessions |
| Phase 5 | 2-3 days | 3 parallel sessions |
| **Total** | **~14-18 days** | |

---

## Session Assignment Guide

### Session 1 (Solo): Phase 0
Run the full foundation. No other sessions should be active. Deliver: working DB, auth, utilities.

### Session 2+3+4 (Parallel): Phase 1
- **Session 2:** Track A (Cases) — owns `src/app/api/cases/`, `src/app/(cases)/`, `src/app/[company]/`
- **Session 3:** Track B (AI) — owns `src/lib/ai/`, `src/app/api/ai/`
- **Session 4:** Track C (Email) — owns `src/lib/email/`, `src/app/api/cron/`

### Session 5+6+7 (Parallel): Phase 2
- **Session 5:** Track D (Scraper) — owns `src/lib/scraper/`
- **Session 6:** Track E (Translation) — owns `src/lib/ai/translation.ts` (wait for Track A done)
- **Session 7:** Track F (Weekly Reports) — owns `src/lib/reports/`

### Session 8 (Solo): Phase 3
Payment integration. No parallel sessions.

### Session 9+10 (Parallel): Phase 4
- **Session 9:** Worker dashboard
- **Session 10:** Resolution workflow

### Session 11+12+13 (Parallel): Phase 5
- **Session 11:** Pattern detection
- **Session 12:** Legal triage
- **Session 13:** Report auto-refresh
