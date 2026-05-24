# Sindicato — Product Requirements Document
**Version 2.0 | May 2026**
**Domain:** sindicato.report
**Status:** Active build — launch sprint in progress

---

## 1. What Is Sindicato

Sindicato is a digital labor rights platform where gig workers and freelancers report individual cases of wage theft, unpaid work, and contractor exploitation — primarily targeting tech companies and gig platforms operating under the "uberization" model.

The platform aggregates individual self-reported cases into collective dashboards per company, quantifying the total number of affected workers, unpaid hours, and monetary debt owed. It operates as a modern worker syndicate: applying automated pressure through direct company notifications and social media visibility, while clustering cases to enable collective legal action and class-action intake by labor solicitors.

All data is self-reported by individual contributors. Sindicato is the infrastructure that makes isolated grievances visible, collective, and actionable. The platform never asserts, verifies, or endorses individual claims — it aggregates and displays what individuals submit under their own attestation.

---

## 2. Why Sindicato Was Born

### The Founding Case

Sindicato was born from a real, active, documented wage theft case. The founder — a senior ML engineer and contractor — worked across three AI training projects (CC Review, CHP Claude Code, and NEXT) through Alignerr, a platform operated by Labelbox Inc. Work was completed, logged via Hubstaff time tracking, verified through AutoQA results, and fully compliant with pinned Discord platform policies.

Payment was withheld without valid justification. When the contractor formally escalated the dispute, Alignerr engaged in documented retaliation. A formal evidence package was assembled — Hubstaff logs, AutoQA scores, Discord policy screenshots, documented retaliation sequence — and escalated to Labelbox's C-suite and CLO with a formal resolution deadline.

This is Case #001. It is documented, timestamped, and active.

### The Structural Problem

The uberization model — pioneered by Uber and replicated across food delivery, AI training, freelance marketplaces, therapy platforms, cleaning apps, and data annotation services — shares an identical predatory structure:

- No direct employment, pure contractor model
- Global workforce deliberately sourced from lower-currency countries
- Payment processed through platforms the company controls unilaterally
- Dispute resolution controlled entirely by the company
- Terms of service written exclusively to protect the platform
- Zero collective bargaining infrastructure for workers

This model is not accidental. It is a deliberate architecture for extracting labor while avoiding the legal obligations of employment.

### The Market Gap

No existing platform combines:
- Individual self-reported cases with a public testimony wall
- Per-company aggregated financial dashboards
- Automated company notification and social pressure
- Anonymous alias-based contact release to verified lawyers and companies
- Class action solicitor intake pipeline
- A donations-only model with no company, advertiser, or investor money

---

## 3. Target Audience

### Primary — The Uberization Cluster

Companies that operate primarily through contractor relationships, use a platform as the primary work intermediary, source workers globally, control payment and dispute resolution unilaterally, and have no collective worker representation mechanism.

**Verticals covered:**

- **Remote workers** — AI training and data annotation platforms (Alignerr/Labelbox, Scale AI, Appen, Remotasks, Clickworker, Toloka, Amazon MTurk, DataAnnotation.tech, Outlier AI, Surge AI), freelance and contractor marketplaces (Upwork, Fiverr, Freelancer.com, Workana, PeoplePerHour, Toptal), remote professional contractor platforms (Deel, Remote.com, Andela, Braintrust)
- **Gig workers** — Food delivery and ride-hailing (Uber, Deliveroo, Glovo, DoorDash, Bolt, Just Eat, Amazon Flex), app-based service platforms (BetterHelp, Fever, cleaning and home service apps)
- **Tenants** — Landlord exploitation (future vertical)

### Secondary — Stakeholders

- Labor law firms seeking pre-qualified class action clusters
- Labor journalists and investigative reporters
- EU and US labor regulators and policy researchers
- ESG investors and institutional researchers
- Worker advocacy organizations

---

## 4. Platform Architecture

### Domain Structure

Sindicato operates on a consolidated single-domain architecture. All content lives on sindicato.report as the canonical domain. All other domains redirect here.

```
sindicato.report          — canonical domain, everything lives here
sindicato.exposed         — redirects to sindicato.report
alignerr.exposed          — redirects to sindicato.report/workers/alignerr
remoteworkers.report      — redirects to sindicato.report/workers
gigworkers.report         — redirects to sindicato.report/gig
tenantsrights.report      — redirects to sindicato.report/tenants (future)
```

### URL Structure

```
sindicato.report/                    — homepage, network overview, manifesto
sindicato.report/workers             — remote workers and data annotation hub
sindicato.report/workers/[company]   — individual company dashboard (workers vertical)
sindicato.report/gig                 — gig and delivery workers hub
sindicato.report/gig/[company]       — individual company dashboard (gig vertical)
sindicato.report/tenants             — tenant rights hub (future)
sindicato.report/cases               — all cases across network
sindicato.report/file                — universal case submission entry point
sindicato.report/clerk               — Clerk AI chat interface
sindicato.report/about               — manifesto and founding story
sindicato.report/transparency        — public financial transparency
sindicato.report/protected           — dedicated landing page for vulnerable workers
sindicato.report/seguro              — same, Portuguese/Spanish
```

### Network Hub Model

sindicato.report is the root hub of a federated network. Each vertical (workers, gig, tenants) lives as a subpath. The homepage displays network-wide aggregate statistics — total cases across all verticals, total reported unpaid wages, total companies, total open to collective action — alongside links to each active vertical hub.

Community forks can operate independent platforms under AGPL-3.0 and are listed on sindicato.report if they sign the Sindicato Network Principles:

- Workers and claimants always pay nothing
- AGPL-3.0 license — always open source
- Data minimalism — collect only what's necessary
- No advertising
- No VC funding
- Financial transparency — publish income and expenditure publicly
- Anonymity and consent-based data sharing in all communication flows

### Design Direction

**sindicato.report** uses two design registers within a single domain:

**Campaign sections** (company dashboard pages, hero sections, social sharing):
- Labor movement heritage meets modern product
- Bold, typographic, confrontational — not friendly SaaS pastels
- Deep red, black, dark ink tones — union poster energy
- Numbers displayed large and assertively

**Institutional sections** (transparency page, report views, legal-facing):
- Clean, data-forward, neutral
- Designed to be taken seriously by lawyers, journalists, regulators

Both registers coexist within sindicato.report. Campaign energy draws people in; institutional credibility gets them to act.

---

## 5. Core Features

### 5.1 Case Submission

Workers self-publish their cases through the platform. The process has two stages: authentication and publication.

**Authentication:**
- Worker signs up with email address
- Verification code sent to that email — must be confirmed
- Cloudflare Turnstile (invisible human verification) on submission — no CAPTCHA friction
- No password, no social login, no identity documents — minimal friction
- Purpose: confirm the person is real. Sindicato verifies *people*, not *claims*.

**Publication form — required fields:**

- Display name (first name or chosen pseudonym)
- Country (optional)
- Age range (optional: 18–24, 25–34, 35–44, 45+)
- Sex (optional)
- Company
- Vertical (remote workers / gig / tenants)
- Project(s) worked on (optional)
- Work date range
- Amount owed (self-reported, in chosen currency)
- Number of contact attempts made with no response
- Their testimony in their own words (100–500 words, free text)
- Email address — **never displayed publicly**; used to generate anonymous alias
- Attestation checkbox: *"I confirm this account is truthful and based on my personal experience"*

**Optional fields:**

- Consent to be contacted by labor law professionals if a collective case is opened
- Consent to join collective legal action if one is organised
- Consent to company notification (default: on)

**AI writing assistant:** Workers who struggle to express themselves can use the "Help me express this clearly" AI button. Powered by Kimi K2 Instant via OpenRouter. The result is editable — the worker's words, clarified. Disclaimer displayed below button.

**Clerk AI intake:** Alternative submission path via `/clerk` — conversational AI chat that guides workers through intake in their own language, then populates the submission form.

**Consent for data release:** Worker agrees at submission time that their alias (not real email) may be shared with verified lawyers or companies who pay the access fee. Workers are notified immediately each time their case is accessed. Real identity and contact details are only shared with explicit worker consent.

### 5.2 Anonymous Email Alias System

Every case submission automatically generates a private anonymous email alias. This alias is the only contact point ever shared externally. The contributor's real email never leaves Sindicato's encrypted database.

**Alias format:** `case-{caseId}@sindicato.report`

**How it works:**

1. Worker submits case with their real email
2. System creates Cloudflare Email Routing rule: `case-{id}@sindicato.report` forwards to worker's real inbox
3. Alias stored in case record (public field)
4. Worker's real email stored encrypted (private field, never exposed)
5. Worker receives alias confirmation email

**Communication flow:**

```
Inbound: company → case-4721@sindicato.report → Cloudflare forwards → worker@gmail.com
Outbound: worker replies from inbox → shows as sent FROM case-4721@sindicato.report
```

Company never sees the worker's real email at any point.

**Alias disable:** If worker reports harassment, Sindicato disables the Cloudflare routing rule instantly. Communication channel closed without any interaction with the company.

**Purpose:**
- Enables contact without exposing identity
- Removes the primary psychological barrier to submission — fear of identification
- Creates a controlled channel Sindicato can close immediately
- Allows universal email collection including from vulnerable workers

### 5.3 The Cases Wall

Public display of self-published worker testimony at `sindicato.report/cases`. Each card shows:

- Partially redacted display name (e.g., Vic*****)
- Country (if provided)
- Vertical (remote workers / gig)
- Company
- Project(s) and date range
- Amount owed (self-reported)
- Number of unanswered contact attempts
- Their testimony in their own words
- Anonymous alias (`case-4721@sindicato.report`) — this is the only contact shown
- Case status (active / resolved)
- Original/translated testimony toggle (for non-English submissions)

The alias proves real people stand behind each report while protecting their identity completely. Full name and real email are released only to verified paying parties and only with explicit worker consent.

**Redaction rules:**

| Field | Public Display | Unredacted (paid access, with worker consent) |
|-------|---------------|------------------------------------------|
| Name | `Vic*****` (first 3 chars + asterisks) | Full name |
| Email | Never shown — alias only | Full real email |
| Alias | `case-4721@sindicato.report` | Same |
| Country | Full | Full |
| Age range, sex | Full (if provided) | Full |
| Project, dates, amount, testimony | Full | Full |

### 5.4 Company Dashboards

Per-company aggregate display at `sindicato.report/workers/[company]` or `sindicato.report/gig/[company]`. Two views from the same data:

**Campaign view** (public URL):
- Worker-solidarity design, campaign energy
- Total cases, total reported unpaid wages, unanswered contact attempts
- Projects named in reports, date range of cases
- Number open to collective legal action
- Social sharing optimized

**Report view** (linked from campaign page):
- Clean, data-forward, designed for lawyers and journalists
- Same numbers, neutral language: "150 individual reports totalling €500,000 in reported unpaid wages"
- Resolution pathway clearly visible
- "This case cluster has been flagged for solicitor review" indicator when threshold reached

Every number carries the disclaimer: *"Figures represent individual reports submitted by registered users. Sindicato does not independently verify claims."*

### 5.5 Resolution Workflow

Sindicato does not intermediate, host, or monitor any communication between parties. Companies and lawyers who pay the access fee receive worker aliases and contact workers directly.

**Worker controls their own case at all times:**
- Mark case as **resolved** — removed from active unpaid totals
- Leave **resolution feedback** — appears publicly on company report
- **Delete** case entirely — removed from all displays
- **Edit** case — update amounts, add information

**Company dashboard reflects changes in real time:**
- Resolved cases removed from active unpaid totals
- Resolved cases + worker feedback in dedicated "Resolved Cases" section
- Both active and resolved counts shown separately

### 5.6 Automated Notifications

**To workers when their data is accessed:**
> *"[Company name] has accessed your case information on Sindicato. Your identity remains private unless you choose to share it. You are under no obligation to respond. Your public case serves as timestamped evidence."*
>
> Sent immediately upon data access.

**To companies when new cases are filed:**
Automated notification to company's scraped public contact email that a new case has been filed on their Sindicato dashboard, with link to their report page.

**Resolution follow-up to workers:**
Workers with active cases older than 30 days receive a periodic email:
> *"Your case against [Company] is still active. If your situation has been resolved, log in to update your status. If not, your case remains visible and counts toward the company's reported totals."*

### 5.7 Vulnerable Worker Landing Page

Dedicated landing page at `/protected` (and `/seguro` for Portuguese/Spanish) designed for workers in sensitive situations — undocumented immigrants, students on restricted visas, account sharers — who need additional reassurance before submitting.

Five fears addressed directly on the page:
1. Will anyone know it was me?
2. Can the company find out who I am?
3. Can immigration authorities access my information?
4. What if I used someone else's account?
5. What if my English isn't good?

Trust signals: non-profit status, GDPR compliance (EU law protects regardless of immigration status), alias system explained in plain language, data minimalism statement. No government logos, no law enforcement associations.

Physical and digital flyers in worker community languages pointing to `/seguro` for distribution through immigrant worker organizations, community centers, and WhatsApp/Telegram worker groups.

### 5.8 Clerk AI Chat Interface

Conversational AI intake at `/clerk`. Workers who struggle with form-based submission can describe their situation in natural language in their own language. Clerk AI (Kimi K2 Instant via OpenRouter) guides them through the case fields conversationally, then generates a pre-filled submission form. CTA at end of conversation: "File your case now."

Rate limited: 20 messages per IP per day.

---

## 6. Legal Architecture

### Platform Position

Sindicato is a notice board and aggregation platform, not a publisher making claims. This mirrors the legal model of Glassdoor, Trustpilot, and court filing registries.

Key legal protections:
- Attestation checkbox makes contributors legally responsible for their own words
- Platform never verifies, endorses, or asserts claims
- All figures labeled as "self-reported" throughout
- Workers self-publish their own testimony — Sindicato displays, it does not editorialize
- No communication between parties is hosted, monitored, or intermediated
- Companies contact workers via alias only — Sindicato is never in the communication loop
- Clear platform disclaimer on every page: *"All cases are self-published by individual workers. Sindicato is a notice board and aggregation platform, not a legal entity making these claims."*

### Non-Retaliation Agreement

Every company accessing contributor information signs a digital agreement before receiving any data. The agreement is auto-generated as a PDF with:
- Company legal name and representative name + role
- Verified company domain email
- ISO timestamp and IP at time of signing
- Payment transaction ID
- List of case aliases accessed

The signed PDF is automatically forwarded to every worker whose case was accessed. The company's commercial transaction generates the worker's legal protection document as a direct byproduct.

Agreement text:

> *"By completing this transaction, [Company Name], represented by [Employee Name, Role], irrevocably agrees that no contributor whose information is accessed through this transaction shall face account termination, payment withholding, reduced work allocation, negative performance assessment, blacklisting, or any other adverse action as a consequence of their participation in Sindicato reporting or any legal action arising from their reports.*
>
> *Breach of this agreement constitutes a separate actionable violation independent of the underlying reported claims. Each contributor holds this signed agreement as standing evidence of that commitment.*
>
> *This agreement is governed by Portuguese law and EU consumer protection regulations."*

### Company Verification Flow

Before any company can access contributor data:

1. Official company domain email required (no Gmail or personal addresses)
2. Confirmation code sent to that official email — verifies actual company domain
3. Employee full name and role captured
4. Terms of service presented (no retaliation clause, data use restrictions)
5. Digital acceptance with timestamp and IP recorded
6. Payment processed via CoinGate
7. Alias contact list released automatically (real identities only with worker consent)
8. Worker notification emails sent immediately upon access

---

## 7. Monetization

Sindicato operates as a non-profit. All revenue covers operational costs first, with surplus directed entirely to the Worker Support Fund.

### Revenue Streams

**Donations only.**

Sindicato takes no money from investors, advertisers, companies listed on the platform, or attorneys. It runs on the voluntary support of workers, attorneys, journalists, and anyone who believes wage theft should have consequences. No pressure. No commercialisation.

Workers pay nothing. The platform costs nothing to use. Everything runs on what people choose to give.

### Revenue Allocation

1. Platform operational costs
2. Reserve fund (minimum 3 months runway)
3. Everything above reserve → Worker Support Fund

---

## 8. Worker Support Fund

All surplus revenue beyond operational costs and reserve is directed to the Worker Support Fund.

### Programme 1 — Small Claims Legal Support
- Partner lawyers per jurisdiction evaluate cases (no cost to worker)
- Approved cases: fund covers filing fee (~$75 in California) + one-hour legal consultation (~$100)
- Worker pays nothing. If case wins, worker keeps everything.

**Initial jurisdiction partnerships:** California, UK, Portugal, Brazil, India.

### Programme 2 — Psychological Support
- Partner therapists per language region
- One session at negotiated bulk rate (~€50–80)
- Worker pays nothing

---

## 9. Non-Profit Structure

Sindicato registers as an Associação in Portugal — simple structure, low registration cost.

**Published publicly at all times:**
- Every euro received (by category)
- Every euro spent (operations, reserve, Worker Support Fund)
- Worker Support Fund: total cases funded, total sessions funded, outcomes where public

---

## 10. Technical Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router) |
| Database | Neon (PostgreSQL) + Drizzle ORM |
| Auth | NextAuth.js v5 (email verification codes) |
| Email delivery | Resend + React Email templates |
| Anonymous aliases | Cloudflare Email Routing (API-driven) |
| Human verification | Cloudflare Turnstile (invisible) |
| AI | OpenRouter (Kimi K2, DeepSeek R1, DeepSeek V3) |
| Payments | CoinGate (primary), NexaPay (backup) |
| PDF generation | @react-pdf/renderer (case reports, cluster summaries) |
| Validation | Zod |
| Hosting | Vercel |

### AI Model Routing

| Use Case | Model |
|----------|-------|
| Writing assistant | moonshot/kimi-k2-instant |
| Translation | moonshot/kimi-k2-instant |
| Clerk AI chat | moonshot/kimi-k2-instant |
| Pattern detection | deepseek/deepseek-r1 |
| Report generation | deepseek/deepseek-v3 |
| Legal triage | deepseek/deepseek-v3 |

### Anonymous Alias Infrastructure

Built on Cloudflare Email Routing. Each case creates one API rule:

```
case-{caseId}@sindicato.report  →  worker's real email (private, encrypted in DB)
```

Alias can be disabled instantly via API if worker reports harassment. Free tier supports 200 routing rules. At 200 cases, migrate to Cloudflare paid or self-hosted AnonAddy (same API interface, designed as a configuration swap not a rebuild).

**Critical pre-launch verification:** Bidirectional alias test — worker reply must show as sent FROM alias, not real email. If this fails, migrate to AnonAddy before launch.

---

## 11. Launch Roadmap

### 5-Day Sprint (Current)

**Day 1 — Wednesday:** DB schema V2 migration, Cloudflare email routing setup, Turnstile integration, Next.js route skeleton, bidirectional alias test

**Day 2 — Thursday:** Case submission form + API + alias creation, cases wall + company dashboards (workers/gig), company email scraper (stateless notification)

**Day 3 — Friday:** Writing assistant + translation pipeline update, Clerk AI chat interface, network hub homepage + vertical hub pages

**Day 4 — Saturday:** CoinGate payment integration, company verification flow, PDF generation (case reports, cluster summaries) + automated delivery

**Day 5 — Sunday:** Vulnerable worker landing pages, Case #001 seed (Victor vs Alignerr/Labelbox), end-to-end flow test, compliance audit

**Monday — Launch:**
- `sindicato.report/workers/alignerr` live with Case #001
- LinkedIn founding story post
- Reddit posts — r/WorkOnline, r/freelance, r/ArtificialIntelligence
- Direct outreach to Alignerr worker communities

### Post-Launch (Week 2+)

- MCP server for Clerk (when data volume warrants)
- Nightly pattern detection cron job (DeepSeek R1)
- Legal triage pre-screening (when lawyer partnerships active)
- Weekly company email reports
- Non-profit Associação registration (parallel process)
- `/tenants` vertical
- Multilingual UI (PT-BR, ES) — month 2
- Psychological support programme — month 2

---

## 12. What Sindicato Will Never Do

- Profit from worker cases
- Charge workers anything, ever
- Hold evidence documents
- Verify or assert individual claims
- Remove cases in exchange for payment
- Alter numbers or testimony for any commercial reason
- Accept advertising
- Take VC funding
- Take a percentage of worker settlements
- Accept money from any company listed on the platform
- Accept money from law firms or attorneys

These are non-negotiable. They are the platform's integrity and its legal protection simultaneously.

---

## 13. The Core Principle

Sindicato takes no money from the companies it holds accountable, the attorneys who benefit from its data, or investors who would expect a return. Its independence is its credibility. You cannot take money from the same parties whose behaviour you are documenting.

The system runs on the support of people who believe wage theft should have consequences — workers, journalists, attorneys, and anyone who thinks this matters. That support is voluntary. There is no pressure and no commercialisation.

Workers pay nothing. Ever. The platform costs nothing to use and always will.

---

*Sindicato — sindicato.report*
*Built from Case #001. Built for everyone after.*
*Built by an unpaid worker and his three cats in a campervan, on the road, somewhere in Europe.*
