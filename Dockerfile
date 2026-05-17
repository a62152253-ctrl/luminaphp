# Multi-stage build for production security
FROM php:8.2-fpm-alpine AS base

# Install security updates and required extensions
RUN apk add --no-cache \
    bash \
    curl \
    git \
    openssl \
    ca-certificates \
    && docker-php-ext-install \
    mysqli \
    pdo \
    pdo_mysql \
    && rm -rf /var/cache/apk/*

# Stage 2: Builder
FROM base AS builder

WORKDIR /app

# Copy composer files if present
COPY composer.json composer.lock* ./

# Install PHP dependencies
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
    composer install --no-dev --optimize-autoloader --no-interaction 2>/dev/null || true

# Stage 3: Runtime (hardened)
FROM base AS runtime

# Create non-root user for security
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

WORKDIR /app

# Copy application from builder
COPY --from=builder /app/vendor ./vendor 2>/dev/null || true

# Copy application code
COPY --chown=appuser:appuser . .

# Set secure directory permissions
RUN chmod -R 755 /app && \
    chmod -R 700 /app/.env* 2>/dev/null || true && \
    chmod -R 700 /app/config 2>/dev/null || true && \
    find /app -type f -name "*.php" -exec chmod 644 {} \; && \
    find /app -type f -name "*.js" -exec chmod 644 {} \; && \
    find /app -type f -name "*.css" -exec chmod 644 {} \;

# Configure PHP for security
RUN { \
    echo 'expose_php = Off'; \
    echo 'display_errors = Off'; \
    echo 'display_startup_errors = Off'; \
    echo 'log_errors = On'; \
    echo 'error_log = /var/log/php/error.log'; \
    echo 'error_reporting = E_ALL'; \
    echo 'memory_limit = 256M'; \
    echo 'upload_max_filesize = 50M'; \
    echo 'post_max_size = 50M'; \
    echo 'max_execution_time = 300'; \
    echo 'disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source'; \
    echo 'allow_url_fopen = Off'; \
    echo 'allow_url_include = Off'; \
    echo 'file_uploads = On'; \
    echo 'upload_tmp_dir = /tmp'; \
    } > /usr/local/etc/php/conf.d/security.ini

# Create log directory with proper permissions
RUN mkdir -p /var/log/php && \
    chown appuser:appuser /var/log/php && \
    chmod 750 /var/log/php

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9000/ping || exit 1

# Switch to non-root user
USER appuser

# Expose PHP-FPM port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
