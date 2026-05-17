# Deployment Guide — Lumina

## Prerequisites

- Docker Engine 24+
- Docker Compose v2
- Domain with DNS pointed to the server
- SSL certificate (Let's Encrypt recommended)

---

## 1. Server Setup

```bash
# Ubuntu 22.04
apt update && apt upgrade -y
apt install -y docker.io docker-compose-v2 git certbot
systemctl enable --now docker
```

---

## 2. Clone & Configure

```bash
git clone https://github.com/lumina/luminaphp.git /opt/lumina
cd /opt/lumina

cp .env.example .env
nano .env   # fill in all secrets
```

Required `.env` values for production:
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_STORAGE_BUCKET`
- `REDIS_PASSWORD` (minimum 32 random characters)
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`
- `JWT_SECRET` (minimum 64 random characters)
- `ADMIN_EMAIL`

---

## 3. SSL Certificates

```bash
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
```

Add a cron for auto-renewal:
```bash
0 3 * * * certbot renew --quiet && docker compose -f /opt/lumina/docker-compose.yml restart nginx
```

---

## 4. Build & Start

```bash
docker compose build --no-cache
docker compose up -d
```

Check health:
```bash
docker compose ps
docker compose logs -f
```

---

## 5. Database Initialisation

```bash
docker compose exec php php setup_database.php
docker compose exec php php seed.php    # optional demo data
```

---

## 6. Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Updates

```bash
cd /opt/lumina
git pull
docker compose build --no-cache
docker compose up -d
```

---

## Rollback

```bash
git checkout v1.0.0
docker compose build --no-cache
docker compose up -d
```

---

## Monitoring

- Logs: `docker compose logs -f [php|nginx|redis]`
- Metrics: configure `monitoring.json` with your Sentry DSN / New Relic key
- Uptime: use an external ping monitor (UptimeRobot, Freshping)

---

## Backup

```bash
# Database
docker compose exec -T php mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > backup_$(date +%F).sql

# Redis
docker compose exec redis redis-cli bgsave
```
