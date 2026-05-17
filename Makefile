.PHONY: help install up down restart logs shell test lint analyse build deploy

DOCKER_COMPOSE = docker compose
PHP = $(DOCKER_COMPOSE) exec php
APP_ENV ?= development

help:
	@echo "Lumina Makefile"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Setup:"
	@echo "  install     Install dependencies and set up .env"
	@echo "  build       Build Docker images"
	@echo ""
	@echo "Runtime:"
	@echo "  up          Start all services"
	@echo "  down        Stop all services"
	@echo "  restart     Restart all services"
	@echo "  logs        Follow all service logs"
	@echo "  shell       Open PHP container shell"
	@echo ""
	@echo "Quality:"
	@echo "  test        Run PHPUnit tests"
	@echo "  lint        Check code style (PHPCS)"
	@echo "  lint-fix    Auto-fix code style (PHPCBF)"
	@echo "  analyse     Run PHPStan static analysis"
	@echo ""
	@echo "Database:"
	@echo "  db-seed     Seed the database"
	@echo "  db-reset    Drop and recreate the database"
	@echo ""

install:
	@cp -n .env.example .env || true
	@composer install
	@echo "Done. Edit .env then run: make up"

build:
	$(DOCKER_COMPOSE) build --no-cache

up:
	$(DOCKER_COMPOSE) up -d
	@echo "App running at https://localhost"

down:
	$(DOCKER_COMPOSE) down

restart:
	$(DOCKER_COMPOSE) restart

logs:
	$(DOCKER_COMPOSE) logs -f

shell:
	$(PHP) sh

test:
	$(PHP) vendor/bin/phpunit --testdox

test-coverage:
	$(PHP) vendor/bin/phpunit --coverage-html storage/coverage

lint:
	$(PHP) vendor/bin/phpcs --standard=phpcs.xml

lint-fix:
	$(PHP) vendor/bin/phpcbf --standard=phpcs.xml

analyse:
	$(PHP) vendor/bin/phpstan analyse --memory-limit=512M

db-seed:
	$(PHP) php seed.php

db-reset:
	$(PHP) php artisan migrate:fresh --seed

cache-clear:
	$(PHP) php -r "require 'vendor/autoload.php'; \$$redis = new Predis\Client(); \$$redis->flushdb(); echo 'Cache cleared';"
