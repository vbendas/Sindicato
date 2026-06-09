# Sindicato

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A digital labor rights platform where gig workers and freelancers report wage theft, unpaid work, and contractor exploitation. Cases aggregate into collective dashboards per company, quantifying affected workers and unpaid debt.

## Philosophy

The gig economy fragments workers across borders and platforms, making collective action impossible. When one worker stops getting paid, they assume it's their problem. Sindicato provides the infrastructure to discover it's not isolated -- and to make isolated grievances visible, collective, and actionable.

One unpaid worker is a statistic. A hundred with matching documentation is a case.

## Features

- **Case Submission & Management** -- Workers file cases with structured evidence and timelines
- **Company Dashboards** -- Aggregated statistics per company (affected workers, unpaid hours, debt)
- **AI-Powered Analysis** -- Automated case tagging, strength assessment, and translation
- **Anonymous Aliases** -- Cloudflare Email Routing protects worker identities
- **Multi-Language Support** -- 12 languages with AI translation
- **Automated Notifications** -- Companies notified when new cases are filed
- **Donation System** -- Crowdfunding for platform sustainability (Stripe + CoinGate)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Auth | NextAuth.js v5 with email verification codes |
| AI | OpenRouter (DeepSeek, Kimi, GPT) |
| Email | Resend + Cloudflare Email Routing |
| Payments | Stripe (donations) + CoinGate (crypto) |
| Analytics | Umami (privacy-focused) |
| Security | Cloudflare Turnstile, Upstash Redis rate limiting |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Resend API key
- OpenRouter API key
- Cloudflare Turnstile keys

### Installation

```bash
git clone https://github.com/vbendas/Sindicato.git
cd Sindicato/mainpage
npm install
cp .env.example .env.local
# Edit .env.local with your values
npx drizzle-kit push
npm run dev
```

### Environment Variables

See `.env.example` for full configuration. Key variables:

- `DATABASE_URL` -- PostgreSQL connection
- `NEXTAUTH_SECRET` -- Generate with `openssl rand -base64 32`
- `OPENROUTER_API_KEY` -- For AI features
- `RESEND_API_KEY` -- For email delivery
- `CRON_SECRET` -- For cron job authentication
- `STRIPE_*` -- For donations

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (REST + cron jobs)
│   ├── [lang]/            # i18n routes (12 languages)
│   └── sections/          # Landing page sections
├── lib/
│   ├── db/                # Database schema & client
│   ├── ai/                # OpenRouter integration
│   ├── auth/              # NextAuth config
│   ├── email/             # Resend templates
│   └── i18n/              # Translation system
└── components/            # React components
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical documentation.

## AI Features

- **Case Analysis** -- Automated tagging and strength scoring
- **Company Summaries** -- Per-company pattern analysis
- **Translation** -- Real-time story translation across 12 languages
- **Writing Assistant** -- Helps workers articulate cases clearly

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All contributions must align with labor rights principles and worker privacy protection.

## License

This project is licensed under the GNU Affero General Public License v3.0 -- see [LICENSE](LICENSE) for details.

This ensures any hosted instance of this software must share source code modifications, preventing proprietary exploitation of worker solidarity tools.

## Security

Report security vulnerabilities privately. Do not open public issues for security concerns. See [SECURITY.md](SECURITY.md) for disclosure policy.
