#!/bin/bash

# Lumina Docker Startup Script
# Handles environment setup, certificate generation, and container orchestration

set -e

PROJECT_NAME="lumina"
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Starting $PROJECT_NAME..."
echo "================================"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${BLUE}✓ Docker is running${NC}"

# Check for .env file
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}⚠️  IMPORTANT: Please edit .env file with your configuration!${NC}"
        echo "   - Set FIREBASE_* environment variables"
        echo "   - Set REDIS_PASSWORD to a secure value"
        echo "   - Update other sensitive values"
        exit 1
    else
        echo -e "${RED}❌ .env and .env.example not found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ .env file configured${NC}"

# Generate SSL certificates if they don't exist
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    echo -e "${BLUE}🔐 Generating SSL certificates...${NC}"
    chmod +x generate-ssl.sh
    ./generate-ssl.sh
fi

echo -e "${GREEN}✓ SSL certificates ready${NC}"

# Create log directories
mkdir -p logs/nginx logs/php
chmod 755 logs/nginx logs/php

echo -e "${GREEN}✓ Log directories created${NC}"

# Build Docker image if needed
echo -e "${BLUE}📦 Building Docker image...${NC}"
docker compose build --no-cache

echo -e "${GREEN}✓ Docker image built${NC}"

# Pull latest base images
echo -e "${BLUE}📥 Pulling latest images...${NC}"
docker compose pull

echo -e "${GREEN}✓ Images pulled${NC}"

# Start containers
echo -e "${BLUE}🔄 Starting containers...${NC}"
docker compose up -d

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ $PROJECT_NAME started successfully!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Display service URLs
echo -e "${BLUE}📍 Service URLs:${NC}"
echo "   - HTTPS: https://localhost"
echo "   - HTTP (redirects to HTTPS): http://localhost"
echo ""

# Display useful commands
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "   - View logs:        docker compose logs -f php"
echo "   - Stop containers:  docker compose stop"
echo "   - Remove containers: docker compose down"
echo "   - Shell access:     docker compose exec php sh"
echo "   - View status:      docker compose ps"
echo ""

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Check container status
docker compose ps

echo ""
echo -e "${GREEN}✅ Setup complete! Open https://localhost in your browser${NC}"
echo -e "${YELLOW}⚠️  Trust the self-signed certificate in your browser${NC}"
