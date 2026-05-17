#!/bin/bash

# SSL Certificate Generation Script
# For development: generates self-signed certificates
# For production: use Let's Encrypt or a commercial CA

set -e

SSL_DIR="./ssl"
CERT_FILE="$SSL_DIR/cert.pem"
KEY_FILE="$SSL_DIR/key.pem"
DAYS=365

echo "🔐 SSL Certificate Setup"
echo "========================"

# Create SSL directory if it doesn't exist
if [ ! -d "$SSL_DIR" ]; then
    mkdir -p "$SSL_DIR"
    chmod 700 "$SSL_DIR"
    echo "✓ Created SSL directory: $SSL_DIR"
fi

# Check if certificates already exist
if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
    echo "⚠️  Certificates already exist at:"
    echo "   - $CERT_FILE"
    echo "   - $KEY_FILE"
    echo ""
    read -p "Do you want to regenerate them? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping certificate generation."
        exit 0
    fi
    rm -f "$CERT_FILE" "$KEY_FILE"
fi

# Generate self-signed certificate for development
echo "🔧 Generating self-signed certificate for development..."
openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days $DAYS \
    -subj "/C=PL/ST=Mazovia/L=Warsaw/O=Lumina/CN=localhost"

# Set proper permissions
chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

echo ""
echo "✅ SSL Certificates Generated Successfully!"
echo "   - Private Key: $KEY_FILE (chmod 600)"
echo "   - Certificate: $CERT_FILE (chmod 644)"
echo ""
echo "📌 IMPORTANT FOR PRODUCTION:"
echo "   1. Replace these certificates with real ones from Let's Encrypt or a CA"
echo "   2. Update nginx.conf with your domain name"
echo "   3. Enable automatic renewal (Let's Encrypt + Certbot)"
echo ""
echo "🔒 Development Certificate Info:"
openssl x509 -in "$CERT_FILE" -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"
