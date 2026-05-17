# Changelog

All notable changes to Lumina are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- Initial project structure with Docker support
- Firebase authentication integration
- Redis session and cache management
- Anime browsing, search, and streaming
- User profiles, favorites, watchlist, ratings
- Reviews and comments system
- Premium subscription support
- Admin panel
- Rate limiting and security headers
- CSP, permissions, and monitoring configuration

---

## [1.0.0] - 2026-05-16

### Added
- First stable release of Lumina platform
- Core anime catalog and episode streaming
- User registration and login (Firebase Auth)
- JWT-based API authentication
- Docker + Nginx + PHP-FPM production stack
- Redis caching for sessions and API responses
- MySQL database with full schema
- Admin panel with user and content management
- Premium tier with HD/4K streaming and downloads
- Notification system (in-app + email)
- PWA manifest and offline support

### Security
- Content Security Policy headers
- CSRF protection
- Rate limiting per role
- Strict session cookie configuration (Secure, HttpOnly, SameSite)
- HSTS enforcement

---

[Unreleased]: https://github.com/lumina/luminaphp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/lumina/luminaphp/releases/tag/v1.0.0
