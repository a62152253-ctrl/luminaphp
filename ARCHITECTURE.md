# Architecture — Lumina

## Overview

Lumina is a PHP-based anime streaming platform backed by Firebase (auth + storage), MySQL (relational data), and Redis (cache + sessions).

```
Browser / Mobile
      │
      ▼
  Nginx (TLS, reverse proxy, rate limit)
      │
      ▼
  PHP-FPM (application logic)
      │
      ├──► Firebase Auth   (token verification)
      ├──► Firebase Storage (media / images)
      ├──► MySQL           (users, anime, episodes, reviews)
      └──► Redis           (sessions, cache, rate limits)
```

## Directory Structure

```
luminaphp/
├── config/             # PHP config arrays (app, db, firebase, cache, mail)
├── src/                # Application source (PSR-4: Lumina\)
│   ├── Auth/           # Auth middleware and JWT helpers
│   ├── Cache/          # Redis cache abstraction
│   ├── Database/       # PDO wrapper and query builder
│   ├── Http/           # Request, Response, Router
│   ├── Mail/           # Mailer
│   ├── Models/         # Data models (Anime, Episode, User, …)
│   └── Services/       # Business logic (StreamService, SearchService, …)
├── tests/              # PHPUnit tests
├── storage/            # Writable runtime files (logs, cache, uploads)
├── public/             # Webroot (index.php, assets)
├── .well-known/        # Security.txt, app-links
├── docker-compose.yml  # Production orchestration
├── docker-compose.override.yml  # Dev overrides (Mailhog, Adminer)
└── nginx.conf          # Nginx configuration
```

## Key Design Decisions

### Authentication
Firebase Auth handles identity (JWT issuance). PHP verifies the Firebase ID token on every protected request using the Firebase Admin SDK. A local `users` table mirrors Firebase UIDs and stores application-specific data (role, premium status, preferences).

### Data Layer
- **MySQL** — structured relational data: anime catalog, episodes, user metadata, reviews, favorites
- **Redis** — sessions (TTL-based), API response caches, rate-limit counters
- **Firebase Storage** — media assets (covers, episode files)

### Routing
`router.php` maps URL patterns to controller classes. All requests are funnelled through `index.php` via `.htaccess` rewrite rules.

### Caching Strategy
| Data | Store | TTL |
|------|-------|-----|
| Anime list | Redis | 30 min |
| Anime detail | Redis | 30 min |
| User profile | Redis | 15 min |
| Recommendations | Redis | 60 min |
| Sessions | Redis | env `SESSION_LIFETIME` |

### Security
See [SECURITY.md](SECURITY.md) for the full security posture.

## Environments

| Env | Purpose |
|-----|---------|
| development | Local dev with Docker Compose override (Mailhog, Adminer) |
| testing | PHPUnit with isolated DB (`lumina_test`) and rate limits off |
| production | Hardened Docker stack with secrets manager |

See [ENVIRONMENT.md](ENVIRONMENT.md) for variable details.
