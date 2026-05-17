# Environment Variables — Lumina

All variables are loaded from `.env` via `vlucas/phpdotenv`. Copy `.env.example` and fill in real values — never commit `.env` to version control.

---

## Application

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `production` | `development`, `testing`, or `production` |
| `APP_DEBUG` | `false` | Show detailed errors (disable in production) |
| `APP_URL` | — | Public base URL |
| `TZ` | `UTC` | Server timezone |

---

## Firebase

| Variable | Description |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Service account private key (multiline, wrap in `"..."`) |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket name |
| `FIREBASE_CREDENTIALS_FILE` | Path to JSON credentials file (alternative to inline vars) |

---

## Database

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `lumina` | Database name |
| `DB_USER` | — | Database user |
| `DB_PASS` | — | Database password |

---

## Redis

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | `redis` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | — | Redis password (required in production) |
| `REDIS_DB` | `0` | Redis database index |

---

## Session

| Variable | Default | Description |
|----------|---------|-------------|
| `SESSION_LIFETIME` | `3600` | Session TTL in seconds |
| `SESSION_SECURE` | `true` | Require HTTPS for session cookie |
| `SESSION_HTTPONLY` | `true` | Block JS access to session cookie |
| `SESSION_SAMESITE` | `Strict` | `Strict`, `Lax`, or `None` |

---

## CORS

| Variable | Description |
|----------|-------------|
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins |
| `CORS_ALLOWED_METHODS` | Comma-separated allowed methods |
| `CORS_ALLOWED_HEADERS` | Comma-separated allowed headers |

---

## Rate Limiting

| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_ENABLED` | `true` | Enable rate limiting |
| `RATE_LIMIT_REQUESTS` | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW` | `900` | Window in seconds (15 min) |

---

## Mail

| Variable | Default | Description |
|----------|---------|-------------|
| `MAIL_DRIVER` | `smtp` | `smtp` or `log` |
| `MAIL_HOST` | — | SMTP host |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USERNAME` | — | SMTP username |
| `MAIL_PASSWORD` | — | SMTP password |
| `MAIL_ENCRYPTION` | `tls` | `tls` or `ssl` |
| `MAIL_FROM_ADDRESS` | — | Sender address |
| `MAIL_FROM_NAME` | `Lumina` | Sender name |

---

## Security

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | — | JWT signing secret (min 32 chars) |
| `SECURITY_HEADERS_ENABLED` | `true` | Set security HTTP headers |
| `CONTENT_SECURITY_POLICY` | `default-src 'self'` | CSP header value |
| `X_FRAME_OPTIONS` | `DENY` | Clickjacking protection |
| `ENABLE_2FA` | `false` | Two-factor authentication |
| `ENABLE_CSRF_PROTECTION` | `true` | CSRF token validation |
| `ENABLE_RATE_LIMITING` | `true` | API rate limiting |
| `ENABLE_REQUEST_SIGNING` | `false` | Signed API requests |

---

## Logging & Monitoring

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `warning` | `debug`, `info`, `warning`, `error` |
| `LOG_CHANNEL` | `stack` | `stack`, `single`, `daily` |
| `LOG_SLACK_WEBHOOK_URL` | — | Slack webhook for error alerts |
| `SENTRY_DSN` | — | Sentry error tracking DSN |
| `NEW_RELIC_LICENSE_KEY` | — | New Relic APM key |

---

## File Upload

| Variable | Default | Description |
|----------|---------|-------------|
| `UPLOAD_MAX_SIZE` | `10485760` | Max upload size in bytes |
| `UPLOAD_ALLOWED_TYPES` | `jpg,jpeg,png` | Allowed MIME extensions |
| `UPLOAD_TEMP_DIR` | `/tmp` | Temporary upload directory |
