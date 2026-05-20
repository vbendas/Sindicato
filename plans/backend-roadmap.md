# Sindicato — Feature Documentation & Roadmap
**Version 2.0 | May 2026**
**For:** opencode + Qwen 3.6 Plus development reference
**Status:** Active build — 5-day launch sprint

---

## Current State Assessment

**Already built (Phase 0 + most of Phase 1 from v1.0 plan):**

| Layer | Files | Status |
|-------|-------|--------|
| DB client + schema | `src/lib/db/` | Built — needs schema migration to V2 |
| Auth (NextAuth + codes) | `src/lib/auth/` | Built |
| AI (OpenRouter + prompts) | `src/lib/ai/` | Built |
| Email infra (Resend + templates) | `src/lib/email/` | Built |
| Utils (redaction, schemas, api) | `src/lib/utils/` | Built |
| Cases API (POST + GET) | `src/app/api/cases/` | Built |
| AI endpoints | `src/app/api/ai/` | Built |
| Cron (resolution followup) | `src/app/api/cron/` | Built |
| Stats API | `src/app/api/stats/` | Built — returns mock data |
| Cases wall + detail | `src/app/(cases)/` | Built |
| Company pages | `src/app/[company]/` | Built — route will change |
| Frontend landing | `src/app/sections/` | Built |
| CaseForm | `src/app/components/CaseForm.tsx` | Built — needs alias field |

**What needs to be built or replaced:**

- Full V2 DB schema migration (aliases, vertical, new fields)
- Cloudflare Email Routing alias system
- Route restructure: `/workers/[company]` + `/gig/[company]`
- Network hub homepage + vertical hubs
- Turnstile human verification
- Clerk AI chat interface
- Vulnerable worker landing page (`/protected`, `/seguro`)
- Company verification flow + non-retaliation agreement PDF
- CoinGate payment (replaces Stripe)
- Company notification via stateless email scrape

---

## Architecture Decisions — V2

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | **Neon (PostgreSQL) + Drizzle ORM** | Unchanged |
| Auth | **NextAuth.js v5** | Unchanged |
| Email delivery | **Resend** | Unchanged |
| Anonymous aliases | **Cloudflare Email Routing** | Free tier, API-driven, zero infra |
| Human verification | **Cloudflare Turnstile** | No CAPTCHA friction, invisible |
| AI gateway | **OpenRouter** | Unchanged |
| AI models | Kimi K2 Instant (writing/translation/clerk), DeepSeek R1 (patterns), DeepSeek V3 (reports/triage) | Updated |
| Payments | **CoinGate** (primary) + NexaPay (backup) | Replaces Stripe |
| PDF generation | **@react-pdf/renderer** | For non-retaliation agreements |
| Validation | **Zod** | Unchanged |
| CAPTCHA | **Cloudflare Turnstile** | Invisible, no image challenges |

---

## Domain & URL Architecture

```
sindicato.report          — canonical domain, everything lives here
sindicato.exposed         — redirects to sindicato.report
alignerr.exposed          — redirects to sindicato.report/workers/alignerr
remoteworkers.report      — redirects to sindicato.report/workers
gigworkers.report         — redirects to sindicato.report/gig
tenantsrights.report      — redirects to sindicato.report/tenants (future)
```

**URL structure:**

```
sindicato.report/                    — homepage, network overview, manifesto
sindicato.report/workers             — remote workers + data annotation hub
sindicato.report/workers/[company]   — company dashboard (workers vertical)
sindicato.report/gig                 — gig + delivery workers hub
sindicato.report/gig/[company]       — company dashboard (gig vertical)
sindicato.report/tenants             — tenant rights hub (future)
sindicato.report/cases               — all cases across network
sindicato.report/file                — universal case submission entry point
sindicato.report/clerk               — Clerk AI chat interface
sindicato.report/about               — manifesto + founding story
sindicato.report/transparency        — public financial transparency
sindicato.report/protected           — vulnerable worker landing page
sindicato.report/seguro              — same, Portuguese/Spanish
```

**Next.js routing structure:**

```
/app
  /page.tsx                    — homepage
  /workers
    /page.tsx                  — workers hub
    /[company]
      /page.tsx                — company dashboard
  /gig
    /page.tsx                  — gig workers hub
    /[company]
      /page.tsx                — company dashboard
  /tenants
    /page.tsx                  — tenants hub (future stub)
  /cases
    /page.tsx                  — all cases wall
    /[id]
      /page.tsx                — case detail
  /file
    /page.tsx                  — universal submission form
  /clerk
    /page.tsx                  — AI chat interface
  /about
    /page.tsx                  — manifesto
  /transparency
    /page.tsx                  — financial transparency
  /protected
    /page.tsx                  — vulnerable worker landing
  /seguro
    /page.tsx                  — same, PT/ES
```

---

## Database Schema — V2 Full Reference

```sql
-- Cases table
CREATE TABLE cases (
  id                        SERIAL PRIMARY KEY,
  display_name              VARCHAR(100),        -- public: first name or pseudonym
  country                   VARCHAR(100),        -- public: optional
  age_range                 VARCHAR(20),         -- public: optional (18-24, 25-34, etc)
  sex                       VARCHAR(20),         -- public: optional
  company                   VARCHAR(255),        -- public
  vertical                  VARCHAR(50),         -- public: workers/gig/tenants
  project                   VARCHAR(255),        -- public: optional
  work_date_range           VARCHAR(100),        -- public
  amount_owed               DECIMAL(10,2),       -- public: self-reported
  currency                  VARCHAR(10),         -- public
  contact_attempts          INTEGER,             -- public
  testimony                 TEXT,                -- public
  testimony_translated      TEXT,                -- public: cached translation
  testimony_language        VARCHAR(10),         -- detected source language
  case_status               VARCHAR(50) DEFAULT 'active',  -- active/resolved/pending

  -- Private fields — never exposed publicly
  worker_email              VARCHAR(255),        -- private: encrypted
  contact_alias             VARCHAR(255),        -- public: case-{id}@sindicato.report
  alias_rule_id             VARCHAR(255),        -- private: Cloudflare rule ID
  alias_active              BOOLEAN DEFAULT true,

  -- Opt-ins — private
  opt_in_solicitor          BOOLEAN DEFAULT false,
  opt_in_collective         BOOLEAN DEFAULT false,
  opt_in_company_notify     BOOLEAN DEFAULT true,

  -- Metadata
  attested                  BOOLEAN DEFAULT false,
  turnstile_verified        BOOLEAN DEFAULT false,
  created_at                TIMESTAMP DEFAULT NOW(),
  updated_at                TIMESTAMP DEFAULT NOW(),

  -- Resolution
  resolution_status         VARCHAR(50),        -- none/in-progress/resolved
  resolution_date           TIMESTAMP,
  resolution_feedback       TEXT                -- worker's public feedback on resolution
);

-- Companies table
CREATE TABLE companies (
  id                        SERIAL PRIMARY KEY,
  slug                      VARCHAR(100) UNIQUE,
  name                      VARCHAR(255),
  website                   VARCHAR(255),
  vertical                  VARCHAR(50),        -- workers/gig/tenants
  contact_emails            JSONB,              -- scraped, refreshed per notification
  resolution_engaged        BOOLEAN DEFAULT false,
  created_at                TIMESTAMP DEFAULT NOW()
);

-- Company access log — non-retaliation audit trail
CREATE TABLE company_access_log (
  id                        SERIAL PRIMARY KEY,
  company_id                INTEGER REFERENCES companies(id),
  company_representative    VARCHAR(255),
  representative_role       VARCHAR(255),
  company_email             VARCHAR(255),
  access_type               VARCHAR(50),        -- resolution/solicitor
  cases_accessed            INTEGER[],
  agreement_signed_at       TIMESTAMP,
  agreement_pdf_url         VARCHAR(255),
  payment_transaction_id    VARCHAR(255),
  amount_paid               DECIMAL(10,2),
  ip_address                VARCHAR(45),
  created_at                TIMESTAMP DEFAULT NOW()
);

-- Solicitor referrals
CREATE TABLE solicitor_referrals (
  id                        SERIAL PRIMARY KEY,
  company_id                INTEGER REFERENCES companies(id),
  solicitor_firm            VARCHAR(255),
  solicitor_email           VARCHAR(255),
  cluster_size              INTEGER,
  fee_paid                  DECIMAL(10,2),
  cases_referred            INTEGER[],
  created_at                TIMESTAMP DEFAULT NOW()
);
```

---

## Environment Variables — Full Reference

```bash
# Database
DATABASE_URL=postgresql://...

# Cloudflare Email Routing
CF_ZONE_ID=your_zone_id
CF_API_TOKEN=your_api_token_with_email_routing_permissions

# Cloudflare Turnstile (human verification — invisible)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
CF_TURNSTILE_SECRET=your_secret

# AI — OpenRouter
OPENROUTER_API_KEY=your_key

# Model routing
WRITING_MODEL=moonshot/kimi-k2-instant
TRANSLATION_MODEL=moonshot/kimi-k2-instant
CLERK_MODEL=moonshot/kimi-k2-instant
PATTERN_MODEL=deepseek/deepseek-r1
REPORT_MODEL=deepseek/deepseek-v3
TRIAGE_MODEL=deepseek/deepseek-v3

# Email delivery
RESEND_API_KEY=your_key
EMAIL_FROM=notifications@sindicato.report

# Payments
COINGATE_API_KEY=your_key
NEXAPAY_API_KEY=your_key       # backup

# Auth
NEXTAUTH_SECRET=random_string

# App
NEXT_PUBLIC_BASE_URL=https://sindicato.report
```

---

## Feature Specifications

### Feature 1 — Cloudflare Email Routing Aliases

Every case submission auto-generates an anonymous alias. The worker's real email never leaves the encrypted DB.

**Alias format:** `case-{caseId}@sindicato.report`

**Alias creation — called on every case submission:**

```typescript
// src/lib/email/aliases.ts
async function createCaseAlias(caseId: number, workerEmail: string): Promise<string> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/email/routing/rules`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        actions: [{ type: 'forward', value: [workerEmail] }],
        matchers: [{ type: 'literal', field: 'to', value: `case-${caseId}@sindicato.report` }],
        enabled: true,
        name: `Case ${caseId}`
      })
    }
  );
  const data = await response.json();
  // store aliasRuleId for future disable
  return `case-${caseId}@sindicato.report`;
}

async function disableCaseAlias(caseId: number): Promise<void> {
  // PUT to Cloudflare with enabled: false using stored aliasRuleId
}
```

**Critical pre-launch test:** Verify bidirectional alias (reply from worker inbox shows FROM alias, not real email). If this fails, migrate to self-hosted AnonAddy — same API structure.

**Cloudflare free tier limit:** 200 rules. At 200 cases, migrate to paid Cloudflare or self-hosted AnonAddy.

---

### Feature 2 — Non-Retaliation Agreement Auto-Generation

Auto-generated PDF signed by company representative, immediately delivered to every accessed worker.

**Agreement text fields:** Company legal name, representative name + role, verified company email, list of case aliases accessed, ISO timestamp, payment transaction ID, IP at signing.

**Delivery flow:**

```typescript
// src/lib/agreements/non-retaliation.ts
async function deliverNonRetaliationToWorkers(
  companyName: string,
  agreementPDF: Buffer,
  accessedCaseIds: number[]
): Promise<void> {
  const workers = await db.getCaseWorkerEmails(accessedCaseIds);
  for (const worker of workers) {
    await sendEmail({
      to: worker.email,           // real email — this is the worker's private inbox
      subject: `${companyName} has accessed your Sindicato case`,
      body: `...`,
      attachments: [agreementPDF]
    });
  }
}
```

---

### Feature 3 — Network Hub Architecture

`sindicato.report` is the root hub. Verticals are subpaths. External redirect domains are Cloudflare-level redirects.

**Network stats function:**

```typescript
// src/lib/stats/network.ts
async function getNetworkStats() {
  return {
    totalCases: await db.countAllCases(),
    totalReportedUnpaid: await db.sumAllReportedAmounts(),
    totalCompanies: await db.countActiveCompanyDashboards(),
    totalOpenToCollectiveAction: await db.countCollectiveActionOptIns(),
    totalResolved: await db.countResolvedCases(),
    lastUpdated: new Date().toISOString()
  };
}
```

**Community fork model:** AGPL-3.0. External forks listed on homepage if they sign Sindicato Network Principles (workers pay nothing, open source, no ads, no VC, financial transparency).

---

### Feature 4 — Vulnerable Worker Landing Page

`/protected` and `/seguro` — dedicated landing page for undocumented workers, students on restricted visas, account sharers. Addresses five fears directly. No separate data tier — every submission still uses same form, just with added trust context.

**Five fears addressed:**
1. Will anyone know it was me?
2. Can the company find out who I am?
3. Can immigration authorities access my information?
4. What if I used someone else's account?
5. What if my English isn't good?

**Multilingual QR flyers** for distribution: PT-BR, ES, RO, AR, HI, FIL — pointing to `/seguro`.

---

### Feature 5 — Clerk AI Chat Interface

`/clerk` — AI chat overlay for workers who need guided case-filing support. Powered by Kimi K2 Instant via OpenRouter. Conversational intake that populates the case form fields.

---

### Feature 6 — Company Notification via Email Scrape

On case submission, if `opt_in_company_notify: true`, system scrapes company's public contact email and sends notification. Stateless — no stored company email dependency. Runs at submission time.

```typescript
// src/lib/scraper/company-contact.ts
async function scrapeAndNotifyCompany(companySlug: string, caseId: number): Promise<void>
```

---

## Build Plan — 5-Day Launch Sprint

### Day 1 — Wednesday: Foundation Reset

**Objective:** DB schema V2, Cloudflare setup, routing skeleton, test alias bidirectional before anything else.

> SEQUENTIAL — all tasks must complete before Day 2 begins.

#### Task 1.1 — DB Schema Migration to V2
- Drop old schema, implement full V2 schema above (cases, companies, company_access_log, solicitor_referrals)
- Add new fields: `vertical`, `age_range`, `sex`, `contact_alias`, `alias_rule_id`, `alias_active`, `turnstile_verified`, `testimony_translated`, `testimony_language`
- Run Drizzle migration against Neon
- Update `src/lib/db/schema.ts` with new Drizzle schema definitions
- Update `src/lib/utils/schemas.ts` Zod validation to match

#### Task 1.2 — Environment Variables Update
- Update `.env.example` with all V2 vars (CF_ZONE_ID, CF_API_TOKEN, Turnstile keys, CoinGate keys)
- Remove Stripe vars
- Add model routing vars (WRITING_MODEL, TRANSLATION_MODEL, CLERK_MODEL, etc.)

#### Task 1.3 — Cloudflare Setup (manual, outside codebase)
- Enable Email Routing on sindicato.report in Cloudflare dashboard
- Configure MX records
- Generate API token with Email Routing write permissions
- Set up catch-all forward destination

#### Task 1.4 — Alias System Implementation
- Create `src/lib/email/aliases.ts` — `createCaseAlias()`, `disableCaseAlias()`
- **CRITICAL:** Test bidirectional forwarding manually before proceeding
  - Send test email to test alias
  - Verify arrival in worker inbox
  - Reply from inbox
  - Confirm reply shows FROM alias, NOT real email
  - If bidirectional fails → document AnonAddy migration path before continuing

#### Task 1.5 — Cloudflare Turnstile Integration
- Install `@marsidev/react-turnstile` or use Cloudflare's script directly
- Create `src/lib/utils/turnstile.ts` — server-side token verification
- Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `CF_TURNSTILE_SECRET` to env

#### Task 1.6 — Next.js Route Skeleton
- Create stub pages for all routes: `/workers`, `/workers/[company]`, `/gig`, `/gig/[company]`, `/file`, `/clerk`, `/about`, `/transparency`, `/protected`, `/seguro`
- Move existing `src/app/[company]/page.tsx` logic → adapt for `/workers/[company]` + `/gig/[company]`
- Move existing `src/app/(cases)/cases/` → `/cases/`
- Add `vertical` param to company page queries

---

### Day 2 — Thursday: Case Submission + Public Display

**Objective:** Full submission flow working end-to-end with alias creation.

> PARALLEL — Tasks 2.1–2.3 can run as separate subagent sessions simultaneously.

#### [PARALLEL SUBAGENT A] Task 2.1 — Case Submission Form + API
**Files:** `src/app/file/page.tsx`, `src/app/api/cases/route.ts`, `src/lib/db/queries/cases.ts`

- Subtask 2.1.1 — Update `CaseForm.tsx` for V2 fields (`vertical`, `age_range`, `sex`, removed `projects`, renamed fields)
- Subtask 2.1.2 — Add Turnstile widget to CaseForm (invisible, server-verified)
- Subtask 2.1.3 — Wire `/api/cases` POST to V2 schema insert with Drizzle
- Subtask 2.1.4 — Call `createCaseAlias()` immediately after DB insert
- Subtask 2.1.5 — Store alias in case record, email alias confirmation to worker
- Subtask 2.1.6 — Server-side story word count validation (100–500 words)
- Subtask 2.1.7 — Language detection via `franc` on story field → store `testimony_language`
- Subtask 2.1.8 — If `opt_in_company_notify: true` → trigger `scrapeAndNotifyCompany()`

**Coordination:** Subagent A owns the POST route. Subagent C (below) exports `scrapeAndNotifyCompany()` — agree on interface before work begins: `scrapeAndNotifyCompany(companySlug: string, caseId: number): Promise<void>`

---

#### [PARALLEL SUBAGENT B] Task 2.2 — Cases Wall + Company Dashboards
**Files:** `src/app/cases/`, `src/app/workers/[company]/`, `src/app/gig/[company]/`

- Subtask 2.2.1 — Update Cases Wall to query V2 schema, apply redaction (`redactName()`, `redactEmail()` → display alias instead of redacted email)
- Subtask 2.2.2 — Add vertical filter tabs (All / Remote Workers / Gig) to cases wall
- Subtask 2.2.3 — Add original/translated testimony toggle per card
- Subtask 2.2.4 — Build `/workers/[company]/page.tsx` — aggregate stats, company campaign energy design
- Subtask 2.2.5 — Build `/gig/[company]/page.tsx` — same layout, gig vertical
- Subtask 2.2.6 — Update `/api/stats` to query real V2 DB for both network-wide and per-company stats
- Subtask 2.2.7 — Add `"Figures represent individual reports submitted by registered users. Sindicato does not independently verify claims."` disclaimer on every number display

**Coordination:** Subagent B is read-only on the DB. No conflict with A.

---

#### [PARALLEL SUBAGENT C] Task 2.3 — Company Notification Scraper
**Files:** `src/lib/scraper/company-contact.ts`

- Subtask 2.3.1 — Build `scrapeCompanyContactEmail(companySlug: string): Promise<string | null>` — fetch company website, parse contact/about page, extract public contact email via Cheerio
- Subtask 2.3.2 — AI-enhanced extraction: if Cheerio fails, pass page content to Kimi K2 via OpenRouter to identify best public contact email
- Subtask 2.3.3 — Cache result in `companies.contact_emails` JSONB field
- Subtask 2.3.4 — Build `scrapeAndNotifyCompany(companySlug, caseId)` — scrape + send notification email (uses Resend)
- Subtask 2.3.5 — Export interface for Task 2.1 to import

**Coordination:** Subagent C writes to `companies` table only. No conflict with A or B.

---

### Day 3 — Friday: AI Features + Clerk

**Objective:** Writing assistant, translation pipeline, and Clerk chat interface.

> PARALLEL — Tasks 3.1 and 3.2 can run as separate subagent sessions. Task 3.3 is sequential (depends on 3.1 translation).

#### [PARALLEL SUBAGENT D] Task 3.1 — Writing Assistant + Translation
**Files:** `src/lib/ai/`, `src/app/api/ai/`

- Subtask 3.1.1 — Update `src/lib/ai/openrouter.ts` to use model routing from env vars (`process.env.WRITING_MODEL`, `process.env.TRANSLATION_MODEL`)
- Subtask 3.1.2 — Update prompts in `src/lib/ai/prompts.ts` for new testimony field naming
- Subtask 3.1.3 — Update `/api/ai/writing-assistant` POST — verify still working with V2 schema fields
- Subtask 3.1.4 — Update `/api/ai/case-strength` POST — verify scoring against V2 fields
- Subtask 3.1.5 — Create `src/lib/ai/translation.ts` — `translateTestimony(text: string, sourceLang: string): Promise<string>` using Kimi K2 Instant
- Subtask 3.1.6 — Hook translation into case submission pipeline — after insert, async translate, store in `testimony_translated`
- Subtask 3.1.7 — Languages: PT-BR, PT, ES, HI, FIL, RO, PL, FR, DE
- Subtask 3.1.8 — Cache strategy: translate once at submission, never re-translate unless worker edits

---

#### [PARALLEL SUBAGENT E] Task 3.2 — Clerk AI Chat Interface
**Files:** `src/app/clerk/`, `src/app/api/clerk/`, `src/lib/ai/clerk.ts`

- Subtask 3.2.1 — Create `src/lib/ai/clerk.ts` — streaming chat handler using Kimi K2 Instant via OpenRouter
- Subtask 3.2.2 — System prompt: guided case-filing intake, multilingual, conversational, extracts structured fields from freeform conversation
- Subtask 3.2.3 — Create `/api/clerk/chat` POST endpoint — takes message history, returns streamed response
- Subtask 3.2.4 — Build `src/app/clerk/page.tsx` — full-screen chat overlay UI
  - Chat bubble interface, worker-facing language
  - Conversational intake populates case fields
  - CTA at end: "File your case now" → redirect to `/file` with pre-filled params
- Subtask 3.2.5 — Rate limiting: 20 messages/IP/day on clerk endpoint
- Subtask 3.2.6 — Add rate limiting per IP on all AI endpoints (update existing)

---

#### Task 3.3 — Network Hub + Vertical Hub Pages [SEQUENTIAL — after 3.1 + 3.2]
**Files:** `src/app/page.tsx`, `src/app/workers/page.tsx`, `src/app/gig/page.tsx`

- Subtask 3.3.1 — Update homepage (`/`) — network overview, aggregate stats, all active verticals with per-vertical counts, manifesto excerpt, link to GitHub for forks
- Subtask 3.3.2 — Build `/workers/page.tsx` — Remote Workers hub: all remote/data annotation companies, worker-solidarity design
- Subtask 3.3.3 — Build `/gig/page.tsx` — Gig Workers hub: delivery + ride-hailing companies
- Subtask 3.3.4 — Add footer across all pages: *"Built by an unpaid worker and his three cats in a campervan, on the road, somewhere in Europe."*
- Subtask 3.3.5 — Build `/about/page.tsx` — manifesto + founding story
- Subtask 3.3.6 — Build `/transparency/page.tsx` — public financial transparency (stub with structure)

---

### Day 4 — Saturday: Payments + Company Verification + Non-Retaliation

**Objective:** Full monetization pipeline. Payment → verification → agreement → data release → worker notification.

> SEQUENTIAL — payment, legal, and data release are tightly coupled. Run as one session.

#### Task 4.1 — CoinGate Payment Integration
- Subtask 4.1.1 — Install CoinGate SDK or implement fetch wrapper in `src/lib/payments/coingate.ts`
- Subtask 4.1.2 — Create payment session: `createPaymentSession(amount, caseIds, companyEmail): Promise<string>` (returns checkout URL)
- Subtask 4.1.3 — Create `/api/payments/coingate/create` POST — builds payment with metadata (company info, case IDs)
- Subtask 4.1.4 — Create `/api/payments/coingate/webhook` POST — verify signature, trigger post-payment flow
- Subtask 4.1.5 — NexaPay fallback in `src/lib/payments/nexapay.ts` — identical interface, swappable

#### Task 4.2 — Company Verification Flow
- Subtask 4.2.1 — Create `/api/company-access/request` POST — company submits official email
- Subtask 4.2.2 — Send verification code to submitted email (Resend), verify domain is not Gmail/personal
- Subtask 4.2.3 — Create `/api/company-access/verify` POST — validate code, capture employee name + role
- Subtask 4.2.4 — Present non-retaliation agreement terms in UI
- Subtask 4.2.5 — Digital signature: capture IP, timestamp, company rep name on agreement acceptance
- Subtask 4.2.6 — Proceed to CoinGate payment (€200/worker contact or tiered lawyer fees)

#### Task 4.3 — Non-Retaliation Agreement PDF Generation
- Subtask 4.3.1 — Install `@react-pdf/renderer`
- Subtask 4.3.2 — Create `src/lib/agreements/non-retaliation.tsx` — React PDF template with all required fields
- Subtask 4.3.3 — `generateAgreementPDF(companyData, accessData): Promise<Buffer>` — renders PDF
- Subtask 4.3.4 — Store PDF in Vercel Blob or Cloudflare R2, save URL in `company_access_log.agreement_pdf_url`

#### Task 4.4 — Data Release + Worker Notification
- Subtask 4.4.1 — Create `src/lib/agreements/delivery.ts` — `deliverNonRetaliationToWorkers()`
- Subtask 4.4.2 — On payment confirmation webhook: generate agreement PDF, store it, then release alias contact list to company
- Subtask 4.4.3 — Send immediate notification email to every accessed worker (real email) with PDF attached
- Subtask 4.4.4 — Log every access in `company_access_log`
- Subtask 4.4.5 — Update `companies.resolution_engaged = true`

#### Task 4.5 — Email Templates for Access Flow
- Subtask 4.5.1 — Update `src/lib/email/templates/worker-data-accessed.tsx` for V2: includes alias, agreement attached, "you are under no obligation to respond"
- Subtask 4.5.2 — Create company confirmation email template: payment confirmed, contact list (aliases only) delivered

---

### Day 5 — Sunday: Vulnerable Worker Page + End-to-End Testing

**Objective:** Vulnerable worker trust content, full flow QA, legal/compliance language audit.

> PARALLEL — Tasks 5.1 and 5.2 can run as separate subagent sessions. Task 5.3 is sequential (requires full platform working).

#### [PARALLEL SUBAGENT F] Task 5.1 — Vulnerable Worker Landing Pages
**Files:** `src/app/protected/page.tsx`, `src/app/seguro/page.tsx`

- Subtask 5.1.1 — Build `/protected/page.tsx` — five fears addressed directly, plain language, no jargon
- Subtask 5.1.2 — Trust signals section: non-profit status, GDPR explanation, alias system explained in one paragraph
- Subtask 5.1.3 — Build `/seguro/page.tsx` — Portuguese/Spanish version of same content
- Subtask 5.1.4 — CTA at bottom: links to `/file` with no additional friction
- Subtask 5.1.5 — QR code generator component for multilingual flyers (links to `/seguro`)

---

#### [PARALLEL SUBAGENT G] Task 5.2 — Workers Hub Content + Case #001
**Files:** `src/app/workers/alignerr/`, DB seed

- Subtask 5.2.1 — Ensure `sindicato.report/workers/alignerr` is live and rendering correctly
- Subtask 5.2.2 — Seed DB with Alignerr company record (slug: `alignerr`, vertical: `workers`, website: `alignerr.com`)
- Subtask 5.2.3 — File Case #001 through the submission form (Victor vs Alignerr/Labelbox)
- Subtask 5.2.4 — Verify alias created, company notification sent, case visible on cases wall
- Subtask 5.2.5 — Configure Cloudflare redirect: `alignerr.exposed` → `sindicato.report/workers/alignerr`

---

#### Task 5.3 — End-to-End Test + Compliance Audit [SEQUENTIAL — after 5.1 + 5.2]

- Subtask 5.3.1 — Full submission flow test: form → alias creation → company notification → cases wall
- Subtask 5.3.2 — Alias bidirectional test: company email → alias → worker inbox; worker reply → shows FROM alias
- Subtask 5.3.3 — Payment flow test (sandbox): company verification → agreement → payment → data release → worker notification with PDF
- Subtask 5.3.4 — Disclaimer language audit: every stat on every page tagged "self-reported"
- Subtask 5.3.5 — GDPR consent language audit: all opt-in checkboxes, submission attestation
- Subtask 5.3.6 — Rate limiting audit: all AI + auth endpoints tested
- Subtask 5.3.7 — Turnstile verification working on case submission
- Subtask 5.3.8 — Mobile responsiveness check

---

### Monday — Launch

- Final domain verification — all redirects working
- `sindicato.report/workers/alignerr` live with Case #001
- LinkedIn founding story post
- Reddit posts — r/WorkOnline, r/freelance, r/ArtificialIntelligence
- Direct outreach to Alignerr worker communities

---

## Parallelization Map

```
Day 1 — Foundation (SEQUENTIAL — one session)
  DB schema V2, Cloudflare setup, alias test, route skeleton, env vars
  BLOCKER: alias bidirectional test must pass before any other work
       │
Day 2 — Case Submission + Display (3 PARALLEL subagent sessions)
  ├── [A] Submission form, cases API, alias integration
  ├── [B] Cases wall, company dashboards, stats API
  └── [C] Company email scraper
       │
Day 3 — AI + Clerk (2 PARALLEL + 1 SEQUENTIAL)
  ├── [D] Writing assistant, translation pipeline
  ├── [E] Clerk AI chat interface
  └── Hub pages (SEQUENTIAL — after D + E)
       │
Day 4 — Payments + Legal (SEQUENTIAL — one session)
  CoinGate, company verification, non-retaliation PDF, data release
       │
Day 5 — Vulnerable Worker + QA (2 PARALLEL + 1 SEQUENTIAL)
  ├── [F] Vulnerable worker landing pages
  ├── [G] Workers hub content + Case #001 seed
  └── End-to-end testing + compliance audit (SEQUENTIAL — after F + G)
       │
Monday — Launch
```

---

## Conflict Risk Matrix

| Subagent | Files Owned | Conflicts | Mitigation |
|----------|-------------|-----------|------------|
| A (Submission) | `api/cases/route.ts`, `CaseForm.tsx`, `lib/db/queries/cases.ts` | C (scraper import) | Agree on `scrapeAndNotifyCompany()` interface before work begins |
| B (Display) | `app/cases/`, `app/workers/[company]/`, `app/gig/[company]/` | None | Read-only DB access |
| C (Scraper) | `lib/scraper/`, `companies` table writes | A (POST calls C's function) | C exports function, A imports — no file conflict |
| D (AI) | `lib/ai/`, `api/ai/` | None | Isolated module |
| E (Clerk) | `app/clerk/`, `api/clerk/`, `lib/ai/clerk.ts` | D (both write to lib/ai/) | E creates `clerk.ts`, D touches `openrouter.ts` + `prompts.ts` — different files |
| F (Vulnerable) | `app/protected/`, `app/seguro/` | None | Isolated pages |
| G (Case #001) | DB seed, `app/workers/alignerr/` | None | Isolated |

---

## Key Coordination Interfaces

These must be established before parallel work begins on Day 2:

```typescript
// C exports, A calls
scrapeAndNotifyCompany(companySlug: string, caseId: number): Promise<void>

// Phase 0 utility, used by all display routes
redactCase(case: Case): PublicCase

// D exports, hooks into submission POST
translateTestimony(text: string, sourceLang: string): Promise<string>

// Day 1 module, A calls immediately after DB insert
createCaseAlias(caseId: number, workerEmail: string): Promise<string>

// Day 4 post-payment trigger
deliverNonRetaliationToWorkers(
  companyName: string,
  agreementPDF: Buffer,
  accessedCaseIds: number[]
): Promise<void>
```

---

## Deferred to Post-Launch (Week 2+)

| Feature | Why Deferred |
|---------|-------------|
| MCP server for Clerk | Build when data volume warrants — schema already queryable |
| Nightly pattern detection cron (DeepSeek R1) | Week 2 |
| Legal triage pre-screening | When lawyer partnerships active |
| Weekly company email reports | Week 2 |
| Group chat / community | Week 2 |
| Non-profit Associação registration (Portugal) | Parallel process, offline |
| `/tenants` vertical | Future community fork |
| Multilingual UI (PT-BR, ES) | Month 2 |
| IPCB university outreach | When platform has 2–3 weeks of live data |
| Psychological support programme | Month 2 |
| Nightly report auto-refresh | Month 2 |

---

## Session Assignment Guide

### Day 1 — Solo Session (Foundation)
Run in full. No other sessions. Deliver: V2 schema migrated, aliases tested bidirectional, all routes stubbed, `.env.example` updated.

### Day 2 — Three Parallel Sessions
- **Session A:** Case submission form + API + alias integration
- **Session B:** Cases wall + company dashboards + stats API
- **Session C:** Company email scraper

All three start simultaneously after Day 1 deliverables confirmed.

### Day 3 — Two Parallel + One Sequential
- **Session D:** AI features (writing assistant + translation)
- **Session E:** Clerk chat interface

Both start simultaneously. Hub pages after both complete.

### Day 4 — Solo Session (Payments + Legal)
Payment integration has legal sensitivity. Run alone. No parallel sessions.

### Day 5 — Two Parallel + One Sequential
- **Session F:** Vulnerable worker pages
- **Session G:** Case #001 seed + alignerr launch

End-to-end testing after both complete.
