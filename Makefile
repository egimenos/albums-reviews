.PHONY: start stop app-logs build start-services

build:
	docker-compose up -d --build

start:
	docker-compose up -d

stop:
	docker-compose down

app-logs:
	docker-compose logs -f nest-api

start-services:
	docker compose up -d postgres pgadmin

