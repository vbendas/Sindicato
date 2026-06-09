# Security Policy

## Reporting a Vulnerability

**DO NOT open public issues for security vulnerabilities.**

If you discover a security vulnerability in Sindicato, please report it privately.

**Email:** security@sindicato.report

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 1 week
- **Fix timeline:** Depends on severity, typically 1-4 weeks

## Scope

This security policy applies to:
- The Sindicato platform source code
- API endpoints and authentication
- Database security and data protection
- Deployment configuration

## Out of Scope

- Third-party services (Resend, Stripe, OpenRouter, etc.)
- Social engineering attacks
- Issues requiring physical access to servers

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest main | Yes |
| Older versions | No |

We recommend always running the latest version from the `main` branch.

## Security Best Practices

If you self-host Sindicato:

1. Use strong, unique secrets (generate with `openssl rand -base64 32`)
2. Keep environment variables secure and never commit them
3. Use HTTPS in production
4. Regularly update dependencies (`npm audit`)
5. Monitor logs for suspicious activity

## Disclosure Policy

We follow responsible disclosure:

1. Report privately
2. We acknowledge and assess
3. We develop and test a fix
4. We release the fix
5. We publish a security advisory

Thank you for helping keep Sindicato and its users safe.
