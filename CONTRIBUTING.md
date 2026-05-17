# Contributing to Lumina

Thank you for your interest in contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/luminaphp.git`
3. Set up the project: `make install && make up`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Branch naming
- `feature/` — new features
- `fix/` — bug fixes
- `refactor/` — refactoring
- `docs/` — documentation only

### Commit messages
Use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add episode download for premium users
fix: correct Redis TTL for user session
refactor: extract rate limiter to middleware
docs: update API endpoint list
```

### Before submitting a PR

```bash
make lint        # PHPCS — must pass
make analyse     # PHPStan level 6 — must pass
make test        # PHPUnit — all tests must pass
```

## Code Style

- PSR-12 (enforced by `phpcs.xml`)
- `declare(strict_types=1)` at the top of every PHP file
- No inline comments unless the *why* is non-obvious
- No magic numbers — use named constants

## Security

- Never commit `.env` files or secrets
- Validate all input at system boundaries
- Use prepared statements for all DB queries
- Report security vulnerabilities to security@lumina.app (not public issues)

## Pull Requests

- Keep PRs focused — one concern per PR
- Update `CHANGELOG.md` under `[Unreleased]`
- Link the related issue if one exists

## Questions

Open a GitHub Discussion or contact the maintainers.
