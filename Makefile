.PHONY: dev build start test clean install migrate seed

# Development
dev:
	npm run start:dev

install:
	npm install

# Database
migrate:
	npm run db:migrate

seed:
	npm run db:seed

db-reset:
	npm run db:migrate reset --force
	npm run db:migrate
	npm run db:seed

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

# Build & Deploy
build:
	npm run build

start:
	npm run start:prod

# Testing
test:
	npm run test

test-e2e:
	npm run test:e2e

test-cov:
	npm run test:cov

# Linting
lint:
	npm run lint

format:
	npm run format

# Utilities
clean:
	rm -rf dist node_modules

setup: install docker-up migrate seed
	@echo "🎉 Setup complete! Start development with 'make dev'"

health:
	curl -s http://localhost:3000/health | jq

logs:
	docker-compose logs -f