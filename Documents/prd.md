# Sindicato — Product Requirements Document
**Version 1.0 | May 2026**
**Domain:** sindicato.report
**Status:** Pre-launch | Case #001 Active

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

This model is not accidental. It is a deliberate architecture for extracting labor while avoiding the legal obligations of employment. Workers in lower-currency countries are specifically targeted because they are less likely to know their legal options, less likely to afford individual legal action, and more economically desperate — making resistance costly and silence rational.

Individual complaints get ignored. Isolated workers have no leverage. Lawyers won't touch individual small claims. Social media pressure is fleeting. Sindicato plugs all three gaps simultaneously.

### The Market Gap

No existing platform combines:
- Individual self-reported cases with a public testimony wall
- Per-company aggregated financial dashboards
- Automated company notification and social pressure
- Direct contact release to verified lawyers and companies (no intermediation)
- Class action solicitor intake pipeline
- A self-funding model where companies finance the infrastructure that holds them accountable

The closest existing tools — Coworker.org (petition campaigns), Fairwork (academic platform scoring), Reclamo (NY immigrant wage complaints), Turkopticon (MTurk-specific) — address fragments of the problem. None address the full pipeline from individual report to collective legal action with social pressure in between.

---

## 3. Target Audience

### Primary — The Uberization Cluster

Companies that meet all of the following criteria:

- Operate primarily through contractor, not employment, relationships
- Use a platform or app as the primary work intermediary
- Source workers globally or across economic gradients
- Control payment, dispute resolution, and account access unilaterally
- Have no collective worker representation mechanism

**Verticals covered:**

- AI training and data annotation platforms (Alignerr/Labelbox, Scale AI, Appen, Remotasks, Clickworker, Toloka, Amazon MTurk, DataAnnotation.tech, Outlier AI, Surge AI)
- Food delivery and ride-hailing (Uber, Deliveroo, Glovo, DoorDash, Bolt, Just Eat, Amazon Flex)
- Freelance and contractor marketplaces (Upwork, Fiverr, Freelancer.com, Workana, PeoplePerHour, Toptal)
- Remote professional contractor platforms (Deel, Remote.com, Andela, Braintrust)
- App-based service platforms (BetterHelp, Fever, cleaning and home service apps)

### Secondary — Stakeholders

- Labor law firms seeking pre-qualified class action clusters
- Labor journalists and investigative reporters
- EU and US labor regulators and policy researchers
- ESG investors and institutional researchers
- Workers advocacy organizations

---

## 4. Platform Architecture

### Single Domain Model

**sindicato.report** serves all audiences through page-level design. A single domain, a single brand, a single marketing effort — with visual registers that shift depending on context.

**Company campaign pages** — `sindicato.report/[company]`
- Bold, confrontational, worker-solidarity energy
- Designed for social media sharing, press, and public pressure
- Numbers displayed assertively: "Labelbox owes workers €500,000 in reported unpaid wages"
- Hero sections with campaign energy, transitioning into data sections below

**Company report pages** — `sindicato.report/[company]/report`
- Clean, neutral, data-forward
- Designed for solicitors, journalists, regulators, and companies seeking resolution
- Language precise: "150 individual reports totalling €500,000 in reported unpaid wages"
- Resolution pathway clearly visible
- The door to settlement remains open

Both views pull from the same database. They speak to completely different audiences through design, not domain separation.

### Company Campaign Pages

Individual company campaign pages follow the pattern **sindicato.report/[company]**. sindicato.report/alignerr is the first, live with Case #001.

---

## 5. Core Features

### 5.1 Case Submission

Workers self-publish their cases through the platform. The process has two stages: authentication and publication.

**Authentication (anti-spam and anti-bot only):**
- Worker signs up with email address
- Verification code sent to that email — must be confirmed
- Optional: phone number verification for additional trust signal
- Purpose: confirm the person is real. Sindicato verifies *people*, not *claims*.
- No password reuse requirements, no social login, no identity documents — minimal friction

**Publication form — required fields:**

- Display name (first name or chosen pseudonym)
- Country
- Project(s) worked on
- Work date range
- Amount owed (self-reported, in chosen currency)
- Number of contact attempts made with no response
- Their story in their own words (100–500 words, free text)
- Email address (partially shown publicly as v*****@g***.com; full email released only to verified paying parties who sign the non-retaliation agreement)
- Attestation checkbox: *"I confirm this account is truthful and based on my personal experience"*

**Optional fields:**

- Consent to be contacted by labor law professionals if a collective case is opened
- Consent to join collective legal action if one is organised
- Phone number (only shared with verified paying parties, never displayed publicly)

**Consent for data release:**
Worker agrees at submission time that their unredacted contact information may be released to verified lawyers or companies who pay the access fee and sign the non-retaliation agreement. This consent covers all future releases — no per-release approval needed. Workers are notified immediately each time their data is accessed.

The attestation checkbox shifts legal responsibility for the claim to the contributor. Sindicato is the bulletin board. Workers publish, Sindicato displays.

### 5.2 The Cases Wall

Public display of self-published worker testimony. Each card shows:

- Partially redacted display name (e.g., Vic*****) and country
- Project(s) and date range
- Amount owed (self-reported)
- Number of unanswered contact attempts
- Their story in their own words
- Partially redacted email (e.g., v*****@g***.com)
- Case status (active / resolved)

Identity is protected by partial redaction. Display names show first 3 characters + asterisks (e.g., Vic*****). Emails show first character + asterisks + first domain character + asterisks + TLD (e.g., v*****@g***.com). Partial display proves to visitors that real people stand behind each report, while preventing identification within large contractor pools. Contributors self-identify further only by their own choice. Full name and email are released only to verified paying parties who have signed the non-retaliation agreement.

### 5.2.1 Public Display Redaction

All personally identifying information is redacted on public pages using the following rules:

| Field | Public Display | Unredacted (paid access after non-retaliation agreement signed) |
|-------|---------------|--------------------------------------------------------|
| Name | `Vic*****` (first 3 chars + asterisks) | Full name |
| Email | `v*****@g***.com` (first char + asterisks + domain char + asterisks + TLD) | Full email |
| Country | Full (e.g., Portugal) | Full |
| Project, dates, amount, story | Full | Full |

### 5.3 Company Dashboard

Per-company aggregate display. All figures tagged as self-reported:

- Total individual cases reported
- Total reported unpaid wages (sum of self-reported figures)
- Date range of cases (earliest to most recent)
- Projects named in reports
- Number of unanswered contact attempts reported across all cases
- Number of contributors open to collective legal action
- Legal interest indicator: "This case cluster has been flagged for solicitor review"

Every number carries the disclaimer: *"Figures represent individual reports submitted by registered users. Sindicato does not independently verify claims."*

### 5.4 Resolution Workflow

Sindicato does not intermediate, host, or monitor any communication between parties. Companies and lawyers who pay the access fee receive unredacted contact information and reach workers directly through their own channels (email, phone, etc.). Sindicato is never in the loop.

**Worker controls their own case at all times:**

- Worker can mark their case as **resolved** at any point — case is removed from active unpaid totals
- Worker can leave **resolution feedback** — a short account of how the company handled the situation
- Worker can **delete** their case entirely — removed from all displays and dashboards
- Worker can **edit** their case — update amounts, add information, correct details
- Worker **cannot opt out** of the feedback appearing on the company report once they mark resolved — the feedback is part of the public record

**Company dashboard reflects changes in real time:**

- Resolved cases removed from "active unpaid wages" totals
- Resolved cases and worker feedback appear in a dedicated "Resolved Cases" section on the company report
- Dashboard shows both active and resolved counts separately
- Worker feedback on resolved cases becomes a **collaboration signal** — public evidence that the company engaged with and resolved worker complaints

**How resolution happens:**
1. Company pays access fee + signs non-retaliation agreement
2. Company receives worker's full name, email, phone (if provided)
3. Company contacts worker directly — through their own channels
4. If resolved, worker logs in and marks their case resolved
5. Worker leaves feedback describing how the resolution went
6. Dashboard numbers update: case subtracted from active totals, feedback added to company report
7. The complaint becomes a marketing asset for the company — public proof they resolved it

**The incentive structure:**
- Workers benefit: case resolved, story heard, feedback published
- Companies benefit: active case numbers drop, resolved cases with positive feedback signal collaboration to regulators, journalists, and future workers
- Sindicato benefits: accurate numbers, no intermediation, resolution documented without involvement

Sindicato never intermediates disputes, hosts conversations, or takes a position on whether a resolution is fair. The worker decides.

### 5.5 Automated Notifications

**To workers when their data is accessed:**
> *"[Company name] has accessed your case information and contact details on Sindicato. Attached is the signed non-retaliation agreement they committed to before receiving your information. You are under no obligation to respond to any contact from them."*

Non-retaliation terms PDF automatically attached. Sent immediately upon data release — no delay window. Consent for data release was given by the worker at submission time.

**To companies when new cases are filed:**
Automated notification to company's public contact email that a new case has been filed on their Sindicato dashboard, with a link to their report page.

**Resolution follow-up to workers (periodic):**
Workers with active cases older than 30 days receive a periodic email:
> *"Your case against [Company] is still active. If your situation has been resolved, log in to update your status. If not, your case remains visible and counts toward the company's reported totals."*

Simple template, cron-triggered. No AI. Workers control their own case status at all times.

---

## 6. Legal Architecture

### Platform Position

Sindicato is a notice board and aggregation platform, not a publisher making claims. This mirrors the legal model of Glassdoor, Trustpilot, and court filing registries.

Key legal protections:

- Attestation checkbox makes contributors legally responsible for their own words
- Platform never verifies, endorses, or asserts claims
- All figures labeled as "self-reported" throughout
- Workers self-publish their own testimony — Sindicato displays, it does not editorialize
- Sindicato verifies *people* (anti-spam email/phone verification), not *claims*
- No communication between parties is hosted, monitored, or intermediated by the platform
- Companies and lawyers contact workers directly — Sindicato is never in the loop
- Clear platform disclaimer on every page: *"All cases are self-published by individual workers. Sindicato is a notice board and aggregation platform, not a legal entity making these claims."*

### Non-Retaliation Agreement

Every company accessing contributor contact information signs a digital agreement before receiving data. The agreement includes:

> *"By accessing contributor contact information through Sindicato, [Company Name], represented by [Employee Name, Role], irrevocably agrees that no contributor whose information is accessed through this transaction shall face account termination, payment withholding, reduced work allocation, negative performance assessment, blacklisting, or any other adverse action as a consequence of their participation in Sindicato reporting. Breach of this clause constitutes a separate actionable violation independent of the underlying reported claims, and the contributor holds this signed agreement as standing evidence of that commitment."*

The signed agreement is automatically forwarded to every worker whose data is accessed. The company's commercial transaction generates the worker's legal protection document as a direct byproduct.

### Company Verification Flow

Before any company can access contributor data:

1. Official company domain email required (no Gmail or personal addresses)
2. Confirmation code sent to that official email
3. Employee name and role captured — named individual attached to the agreement
4. Digital terms presented and signed with timestamp
5. Payment processed
6. Contact list released automatically
7. Worker notification emails sent simultaneously

---

## 7. Monetization

Sindicato operates as a non-profit. All revenue covers operational costs first, with surplus directed entirely to the Worker Support Fund. No revenue goes to founders or staff as profit.

### Revenue Streams

**Stream 1 — Lawyer Referral Fee**
Labor law firms pay a fixed fee per worker contact to access opted-in contributor clusters for class action intake.

| Cluster Size | Fee |
|---|---|
| 20 workers | €500 |
| 50 workers | €1,500 |
| 100 workers | €2,500 |
| 200+ workers | €5,000 |

What firms receive: full name, email, phone (if worker provided), and all public case information already visible on the report. Nothing more. Firms contact workers directly. Sindicato is the matchmaker, not the evidence custodian.

**Stream 2 — Company Resolution Fee**
Companies pay a fixed fee per worker contact to access contributor information. Fixed rate, no volume discount — the pricing creates natural incentive to engage early before case numbers grow.

Fee: **€200 per worker contact**

What companies receive: full name, email, phone (if worker provided), public case information. Companies contact workers directly. Signed non-retaliation agreement is a mandatory precondition, not optional.

**Stream 3 — Donations**
Always visible, never pressured. Covers gap between operational costs and revenue streams during early growth.

### Revenue Allocation

Priority order:

1. Platform operational costs (hosting, domains, maintenance)
2. Reserve fund (minimum 3 months operational runway)
3. Everything above reserve → Worker Support Fund

---

## 8. Worker Support Fund

All surplus revenue beyond operational costs and reserve is directed to the Worker Support Fund. This fund pays for two programmes, both delivered entirely by third-party partners — requiring no ongoing time from Sindicato operations.

### Programme 1 — Small Claims Legal Support

For workers who want to pursue their individual case in court:

- Partner lawyers per jurisdiction evaluate cases (no cost to worker)
- Approved cases: Sindicato fund covers small claims filing fee (~$75 in California, similar elsewhere)
- Plus: one-hour professional legal consultation at negotiated bulk rate (~$100)
- Total cost per worker: approximately $175
- Worker pays nothing. Ever.
- If case wins: worker keeps everything. Sindicato takes no percentage.
- Partner lawyers report outcomes back to Sindicato for platform track record.

**Initial jurisdiction partnerships needed:**
- 1 California labor attorney (covers majority of US-incorporated gig platforms)
- 1 UK solicitor (British platforms and UK-based workers)
- 1 Portuguese labor lawyer (EU workers, EU Platform Work Directive cases)
- 1 Brazilian labor lawyer (largest global gig workforce, strong labor courts)
- 1 Indian labor lawyer (massive AI annotation workforce)

### Programme 2 — Psychological Support

Wage theft is genuinely traumatic, particularly for workers in lower-currency countries for whom unpaid amounts represent months of living expenses. Sindicato recognizes workers as whole humans, not case numbers.

- Partner psychologists/therapists per language region
- One-hour session at negotiated bulk rate (~€50–80)
- Worker applies through simple form, gets matched automatically
- Worker pays nothing

Partners: independent practitioners working with worker advocacy organisations, burnout specialists, multilingual online therapy practitioners.

---

## 9. Non-Profit Structure

Sindicato registers as an Associação (non-profit association) in Portugal — simple structure, low registration cost, minimal ongoing compliance burden.

**Published publicly on the platform at all times:**
- Every euro received (by category: referral fees, resolution fees, donations)
- Every euro spent (operations, reserve, Worker Support Fund disbursements)
- Worker Support Fund: total cases funded, total sessions funded, outcomes where public

Full financial transparency is a foundational commitment, not an optional feature.

---

## 10. Launch Roadmap

### Phase 1 — Week 1 (Immediate)

- Register sindicato.report domain
- Build core platform: submission form, cases wall, company dashboard
- File Case #001 (Alignerr/Labelbox) as founding case
- Launch sindicato.report/alignerr as first campaign page
- Automated company notification to Alignerr/Labelbox

### Phase 2 — Month 1

- Outreach to other Alignerr/Labelbox workers to file cases
- First solicitor outreach — California labor attorney
- Platform announcement on LinkedIn with founding story
- Press outreach to labor and tech journalists

### Phase 3 — Month 2–3

- Second company dashboard (second data annotation platform)
- Resolution workflow and worker case management live
- Company resolution fee system operational
- First Worker Support Fund disbursement
- Portuguese and Brazilian Portuguese language support

### Phase 4 — Month 4–6

- Third and fourth company dashboards (freelance marketplace + delivery platform)
- Psychological support programme launch
- Partner lawyer network expanded to 3–5 jurisdictions
- sindicato.report institutional face fully operational
- Press story: platform statistics, cases funded, outcomes

---

## 11. Design Direction

**sindicato.report** uses two design registers within a single domain:

**Campaign sections** (company pages, hero sections, social sharing):
- Labor movement heritage meets modern product
- Bold, typographic, confrontational — not friendly SaaS pastels
- Deep red, black, dark ink tones — union poster energy
- Wordmark-forward
- Numbers displayed large and assertively

**Institutional sections** (report pages, data tables, legal-facing views):
- Clean, data-forward, neutral
- Designed to be taken seriously by lawyers, journalists, regulators
- Same data, different register

Both registers coexist within sindicato.report. Campaign energy draws people in; institutional credibility gets them to act.

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

These are non-negotiable. They are the platform's integrity and its legal protection simultaneously.

---

## 13. The Core Principle

Companies pay to access the resolution pathway. That payment generates the worker's legal protection document. The surplus funds worker legal aid and psychological support. The worse a company behaves, the more cases accumulate, the more they eventually pay to engage, the more workers get supported.

The system runs on the ethical logic of making exploitation expensive and resolution affordable. Companies fund the infrastructure that holds them accountable.

Workers pay nothing. Ever.

---

*Sindicato — sindicato.report*
*Built from Case #001. Built for everyone after.*
