# 🔐 Lumina Docker Security Setup - Complete Guide

## Project Structure

```
.
├── Dockerfile              # Multi-stage hardened PHP image
├── docker-compose.yml      # Complete Docker orchestration with Nginx + PHP + Redis
├── nginx.conf              # Hardened Nginx configuration with security headers
├── .htaccess               # Apache fallback security configuration
├── .env.example            # Environment variables template
├── .dockerignore            # Files excluded from Docker image
├── config/
│   └── security.php        # PHP security configuration & helper functions
├── generate-ssl.sh         # SSL certificate generation script
├── start.sh                # Automated startup script
└── ssl/
    ├── cert.pem            # SSL certificate (auto-generated)
    └── key.pem             # SSL private key (auto-generated)
```

## Security Features Implemented

### 1. **Container Security**
- ✅ Non-root user execution (appuser:1000)
- ✅ Read-only root filesystem where possible
- ✅ Dropped all unnecessary Linux capabilities
- ✅ No new privileges flag enabled
- ✅ Temporary filesystems for /tmp and /var/run
- ✅ Regular security updates in Alpine base image

### 2. **PHP Security**
- ✅ Disabled dangerous functions (exec, shell_exec, system, etc.)
- ✅ Disabled URL wrappers (allow_url_fopen, allow_url_include)
- ✅ Strict error reporting (errors logged, not displayed)
- ✅ Session hardening with httponly, secure, samesite flags
- ✅ Disabled function overloading
- ✅ Memory and execution time limits
- ✅ Upload directory protections

### 3. **Web Server Security (Nginx)**
- ✅ SSL/TLS 1.2+ with modern ciphers
- ✅ HTTP/2 support with multiplexing
- ✅ Security headers (HSTS, CSP, X-Frame-Options, etc.)
- ✅ Rate limiting on API and upload endpoints
- ✅ Protection against directory listing
- ✅ Hidden PHP version information
- ✅ GZIP compression for performance
- ✅ Connection limits
- ✅ Deny access to .env, .git, config files

### 4. **HTTP Headers**
```
Strict-Transport-Security    # HSTS for HTTPS enforcement
X-Content-Type-Options       # Prevent MIME type sniffing
X-Frame-Options              # Clickjacking protection
X-XSS-Protection             # XSS filter activation
Content-Security-Policy      # XSS & injection prevention
Referrer-Policy              # Privacy control
Permissions-Policy           # Feature restrictions
```

### 5. **File Permissions**
- ✅ Source code: 644 (readable by all, writable by owner)
- ✅ Directories: 755 (executable by all)
- ✅ Config files: 700 (readable/writable by owner only)
- ✅ .env files: 700 (readable/writable by owner only)

### 6. **Network Security**
- ✅ Isolated Docker network (172.20.0.0/16)
- ✅ Services communicate internally only
- ✅ Redis with password authentication
- ✅ Ports: Only 80, 443 exposed (HTTP/HTTPS)

### 7. **Secret Management**
- ✅ .env file never committed to Git (in .gitignore)
- ✅ Secrets not included in Docker image (.dockerignore)
- ✅ Environment variables passed at runtime
- ✅ All sensitive data in .env template

## Quick Start

### 1. **Initial Setup**

```bash
# Clone or navigate to project directory
cd lumina

# Generate environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or vim, code, etc.
```

### 2. **Update .env with Your Values**

```env
FIREBASE_PROJECT_ID=your_actual_project_id
FIREBASE_PRIVATE_KEY=your_actual_private_key
FIREBASE_CLIENT_EMAIL=your_actual_client_email
FIREBASE_STORAGE_BUCKET=your_actual_bucket
REDIS_PASSWORD=your_secure_random_password
```

### 3. **Start the Application**

```bash
# Make startup script executable
chmod +x start.sh generate-ssl.sh

# Run startup script (handles everything automatically)
./start.sh
```

This will:
- Check Docker is running
- Generate SSL certificates
- Create log directories
- Build Docker image
- Start all containers
- Display service status

### 4. **Access the Application**

```
🌐 https://localhost
```

**Note:** Accept self-signed certificate warning in browser (development only)

## Manual Docker Commands

### Start Services
```bash
docker compose up -d
```

### Stop Services
```bash
docker compose stop
```

### Remove Containers
```bash
docker compose down
```

### View Logs
```bash
# All services
docker compose logs

# Follow in real-time
docker compose logs -f

# Specific service
docker compose logs -f php
docker compose logs -f nginx
```

### Access PHP Container
```bash
docker compose exec php sh
```

### View Running Containers
```bash
docker compose ps
```

### View Network
```bash
docker network inspect lumina-net
```

## Configuring for Production

### 1. **Get Real SSL Certificate**

Replace self-signed certificates with Let's Encrypt:

```bash
# Using Certbot
certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem
```

### 2. **Update Nginx Configuration**

In `nginx.conf`:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 3. **Environment Variables**

In `.env`:
```env
APP_ENV=production
NODE_ENV=production
REDIS_PASSWORD=your_super_secure_random_password_here
```

### 4. **Backup and Monitoring**

```bash
# Backup database/data
docker compose exec redis redis-cli bgsave

# Monitor container health
docker compose stats
```

### 5. **Firewall Rules**

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Security Best Practices

### ✅ DO

1. **Never commit .env to Git**
   ```bash
   # Already in .gitignore
   echo ".env" >> .gitignore
   echo ".env.local" >> .gitignore
   ```

2. **Rotate secrets regularly**
   - Change REDIS_PASSWORD
   - Rotate JWT tokens
   - Update API keys

3. **Keep base images updated**
   ```bash
   docker compose pull
   docker compose build --no-cache
   ```

4. **Monitor logs for suspicious activity**
   ```bash
   docker compose logs php | grep -i "error\|warning"
   ```

5. **Use strong passwords**
   - REDIS_PASSWORD: minimum 32 characters, random
   - FIREBASE_PRIVATE_KEY: from service account

6. **Backup configuration**
   - Store .env securely (not in repo)
   - Use password manager
   - Document recovery procedure

7. **Enable HTTPS only in production**
   - Redirect HTTP → HTTPS (already configured)
   - Use HSTS headers (already configured)

### ❌ DON'T

1. ❌ Don't commit .env files
2. ❌ Don't expose sensitive ports (3306, 6379, 9000)
3. ❌ Don't disable security headers
4. ❌ Don't use weak passwords
5. ❌ Don't run as root in containers
6. ❌ Don't log sensitive data
7. ❌ Don't trust self-signed certs in production

## Troubleshooting

### Container won't start
```bash
docker compose logs php
docker compose logs nginx
```

### SSL certificate errors
```bash
# Regenerate certificates
./generate-ssl.sh
```

### Port already in use
```bash
# Free port 80/443
sudo lsof -i :80
sudo lsof -i :443

# Or use different ports in docker-compose.yml
ports:
  - "8080:80"
  - "8443:443"
```

### Redis connection refused
```bash
docker compose exec redis redis-cli ping
```

### PHP errors not showing
- Check logs: `docker compose logs -f php`
- Logs location: `./logs/php/error.log`

## Security Audit Checklist

- [ ] .env file never committed
- [ ] All secrets use strong random values
- [ ] SSL certificates valid and renewed
- [ ] Security headers present in responses
- [ ] Non-root user running services
- [ ] All updates installed
- [ ] Logs monitored regularly
- [ ] Rate limiting active
- [ ] Backups tested and working
- [ ] Firewall properly configured

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PHP Security](https://www.php.net/manual/en/security.php)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Nginx Security Headers](https://www.nginx.com/blog/7-tips-for-faster-http-2-performance/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Last Updated:** 2024
**Security Level:** ⭐⭐⭐⭐⭐ (Enterprise Grade)
