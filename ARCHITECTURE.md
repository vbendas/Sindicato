# Technical Architecture

## Overview

Sindicato is a Next.js 14 application using the App Router pattern. It aggregates self-reported wage theft cases into collective evidence per company.

## Core Features

### Case Management

- Structured case submission with timeline events
- Evidence upload with validation
- Anonymous alias system via Cloudflare Email Routing
- Multi-language support with AI translation (12 languages)

### Company Dashboards

- Aggregated metrics per company
- Case statistics and trends
- Automated summary generation via AI
- Public transparency reporting

### AI Integration

- Automated case tagging (15+ categories)
- Case strength assessment
- Translation pipeline
- Company pattern analysis
- Writing assistance for workers

### Notification System

- Company alerts on new cases
- Worker follow-up emails
- Weekly statistics reports
- Resolution status updates

### Security

- Cloudflare Turnstile verification on sensitive routes
- Rate limiting on all endpoints (Upstash Redis)
- Email verification for case submission
- Anonymous alias protection

## Data Model

### Key Entities

| Entity | Description |
|--------|-------------|
| `cases` | Worker submissions with stories, amounts, timelines |
| `companies` | Platform/company records with aggregated stats |
| `caseTags` | AI-generated categorization tags |
| `caseAnalyses` | Per-case AI analysis results |
| `companySummaries` | Aggregated company reports |
| `workers` | Worker accounts (email, display name) |
| `platformAccounts` | Lawyer/company/media accounts with roles |
| `verificationTokens` | Email verification codes (hashed) |
| `donations` | Payment records (Stripe/CoinGate) |
| `manualReviewQueue` | Company email scrape review items |

### Relationships

```
cases ──┬── caseTags (1:N)
        ├── caseAnalyses (1:N)
        ├── caseTimelineEvents (1:N)
        └── companies (N:1)

companies ──┬── companySummaries (1:N)
            └── manualReviewQueue (1:N)

platformAccounts ── companies (N:1)
```

## API Endpoints

### Public Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cases` | List cases (wall) |
| GET | `/api/cases/[id]` | Case detail |
| GET | `/api/companies` | List companies |
| GET | `/api/stats` | Platform statistics |
| GET | `/api/sitemap` | XML sitemap |

### Authenticated Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/cases` | Submit new case |
| POST | `/api/auth/send-code` | Send verification code |
| POST | `/api/auth/verify-code` | Verify code |
| POST | `/api/register` | Register platform account |
| POST | `/api/donations/checkout` | Create Stripe checkout |

### AI Routes (CRON_SECRET protected)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/analyze-tags` | Generate case tags |
| POST | `/api/ai/company-summary` | Generate company report |
| POST | `/api/case-analyses/batch` | Batch case analysis |
| POST | `/api/case-tags/batch` | Batch tag generation |

### Admin Routes (CRON_SECRET protected)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/scrape-review` | View review queue |
| POST | `/api/admin/scrape-review` | Resolve/dismiss reviews |
| POST | `/api/admin/reset-metrics` | Reset all metrics |

### Cron Routes (CRON_SECRET protected)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cron/umami-sync` | Daily analytics sync |
| GET | `/api/cron/resolution-followup` | Weekly follow-up emails |
| GET | `/api/cron/weekly-per-case-email` | Per-case email reports |
| GET | `/api/cron/weekly-company-stats` | Company statistics emails |

## Infrastructure

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **State:** React Server Components + client hooks
- **i18n:** Custom translation system with 12 languages

### Backend

- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Auth:** NextAuth.js v5 with email verification codes
- **AI:** OpenRouter API (multiple model providers)
- **Email:** Resend + Cloudflare Email Routing
- **Payments:** Stripe Embedded Checkout + CoinGate
- **Analytics:** Umami Cloud (privacy-focused)

### Security

- **Verification:** Cloudflare Turnstile (invisible)
- **Rate Limiting:** Upstash Redis (IP-based)
- **Secrets:** Environment variables only
- **Headers:** Content Security Policy configured

### Deployment

- **Platform:** Vercel (Edge Functions)
- **Database:** Neon PostgreSQL (serverless)
- **Cron:** Vercel Cron Jobs (4 scheduled tasks)
- **Domain:** sindicato.report

## Directory Structure

```
mainpage/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── ai/           # AI endpoints
│   │   │   ├── auth/         # Authentication
│   │   │   ├── cases/        # Case CRUD
│   │   │   ├── clerk/        # AI chatbot
│   │   │   ├── cron/         # Scheduled jobs
│   │   │   └── donations/    # Payment processing
│   │   └── [lang]/           # i18n routes
│   │       ├── (cases)/      # Case pages
│   │       ├── [company]/    # Company pages
│   │       └── file/         # Case filing wizard
│   ├── components/           # React components
│   ├── lib/
│   │   ├── ai/               # OpenRouter integration
│   │   ├── auth/             # NextAuth config
│   │   ├── db/               # Database schema
│   │   ├── email/            # Resend templates
│   │   └── i18n/             # Translation system
│   └── hooks/                # React hooks
├── public/                   # Static assets
├── drizzle/                  # Database migrations
├── scripts/                  # Utility scripts
└── e2e/                      # End-to-end tests
```
