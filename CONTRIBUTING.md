# Contributing to Sindicato

Thank you for your interest in contributing to Sindicato. This is a labor rights platform, and every contribution should serve workers.

## Principles

All contributions must prioritize:

1. **Worker privacy** -- Never compromise anonymity protections
2. **Accessibility** -- Workers worldwide use this; keep it simple and translatable
3. **Transparency** -- Platform operations should be inspectable
4. **Solidarity** -- Features should empower collective action, not individualism

## Code of Conduct

- No discrimination or harassment
- Respect worker confidentiality
- Prioritize safety and security
- Document decisions that affect worker data
- Be kind in discussions -- many contributors are workers themselves

## Development Setup

```bash
cd mainpage
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Testing

```bash
npm run test        # Unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright)
npm run lint        # Linting
```

## Pull Request Process

1. Fork and branch from `main`
2. Make changes with clear commit messages
3. Add tests for new features
4. Run `npm run lint` before submitting
5. Update documentation if needed
6. Reference any related issues

### Commit Messages

Use conventional commits:

- `feat: add new feature`
- `fix: resolve bug`
- `security: address vulnerability`
- `docs: update documentation`
- `i18n: add/fix translations`

## Areas Needing Help

### Translations
- Improve existing translations for 12 languages
- Add new languages (RTL support included)
- Fix machine translation quality

### Accessibility
- WCAG 2.1 AA compliance for case filing flow
- Screen reader testing
- Keyboard navigation

### Security
- Regular security audits
- Penetration testing
- Vulnerability reports

### Documentation
- Setup guides for self-hosting
- API documentation
- Architecture explanations

## Reporting Issues

- **Bugs:** Open a GitHub issue with reproduction steps
- **Security:** See [SECURITY.md](SECURITY.md) -- do NOT open public issues
- **Features:** Open an issue for discussion before implementing

## Questions?

Open an issue for discussion before major changes. We're happy to help you get started.

## License

By contributing, you agree that your contributions will be licensed under the AGPL-3.0 License.
