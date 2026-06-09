# Sindicato

Digital labor rights platform. Workers self-publish wage theft cases. Cases aggregate into per-company dashboards. Companies pay to access worker contacts. Worker identities stay anonymized until they choose to share.

**Live at:** sindicato.report

---

## Stack

- **Next.js 16.2** (App Router)
- **Neon** (PostgreSQL) + **Drizzle ORM**
- **NextAuth.js v5** — email verification codes
- **Resend** + React Email — transactional email
- **Cloudflare Email Routing** — anonymous `case-{id}@sindicato.report` aliases per case
- **Cloudflare Turnstile** — invisible human verification on submission
- **OpenRouter** — AI routing (Kimi K2 Instant, DeepSeek R1, DeepSeek V3)
- **Stripe** — payments (company access fees, lawyer referral fees)
- **@react-pdf/renderer** — PDF generation (case reports, cluster summaries)

---

## Getting Started

Copy `.env.example` to `.env.local` and fill in all values.

```bash
cp .env.example .env.local
npm run dev
```

Requires:
- Neon database (run `npm run db:push` to apply schema)
- Cloudflare account with Email Routing enabled on sindicato.report
- OpenRouter API key
- Resend API key with sindicato.report domain verified

---

## URL Structure

```
/                        homepage — network stats, all verticals
/workers                 remote workers hub
/workers/[company]       company dashboard (workers vertical)
/gig                     gig workers hub
/gig/[company]           company dashboard (gig vertical)
/cases                   all cases across network
/file                    case submission form
/clerk                   Clerk AI chat intake
/about                   manifesto
/transparency            public financials
/protected               vulnerable worker landing (EN)
/seguro                  vulnerable worker landing (PT/ES)
```

---

## Project Structure

```
src/
  app/
    workers/[company]/   company dashboard pages
    gig/[company]/
    cases/               cases wall + detail
    file/                submission form
    clerk/               AI chat interface
    protected/           vulnerable worker pages
    seguro/
    api/
      cases/             case CRUD
      ai/                writing assistant, strength, translation
      clerk/             AI chat endpoint
      auth/              NextAuth + send-code
      cron/              resolution followup
      payments/          Stripe webhooks
      company-access/    verification + payment flow
  lib/
    db/                  Drizzle schema + client + queries
    auth/                NextAuth config + rate limiting
    ai/                  OpenRouter client + prompts + translation + clerk
    email/               Resend wrapper + React Email templates
    email/aliases.ts     Cloudflare Email Routing alias management
    agreements/          PDF generation (case reports, cluster summaries)
    payments/            Stripe client
    scraper/             Company contact email scraper
    utils/               Redaction, Zod schemas, API helpers, Turnstile verify
```

---

## Key Concepts

**Anonymous aliases** — every case gets `case-{id}@sindicato.report`. Cloudflare forwards inbound mail to worker's real inbox. Worker replies show as sent FROM the alias. Real email never exposed. Alias can be disabled instantly via API.

**Anonymized access** — companies pay to access worker contact info. Workers are notified immediately and control whether their real identity is shared. The platform provides timestamped public evidence workers can use if retaliation occurs.

**Verticals** — all company dashboards live under `/workers/[company]` or `/gig/[company]`. The `vertical` field on cases and companies determines routing.

**Redaction** — public display: name shows first 3 chars + asterisks, real email never shown (alias shown instead). Unredacted data released only to verified paying parties post-agreement.

---

## Database Commands

```bash
npm run db:generate   # generate migration from schema changes
npm run db:migrate    # run migrations against Neon
npm run db:push       # push schema directly (dev only)
npm run db:studio     # Drizzle Studio UI
```

---

## Tests

```bash
npm test              # run all tests
npm run test:watch    # watch mode
```

---

## Notes for AI Agents

Read `AGENTS.md` before writing any Next.js code — this version has breaking changes from training data. Read from `node_modules/next/dist/docs/` before implementing any Next.js feature.

Build plan and task breakdown: `../plans/backend-roadmap.md`
