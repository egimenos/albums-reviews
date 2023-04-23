.PHONY: debug start stop app-logs start-services

build:
	docker-compose build -d

debug:
	docker-compose up -d postgres pgadmin
	docker-compose run -d --rm --service-ports nestjs-api npm run start:inspect

start:
	docker-compose up -d

stop:
	docker-compose down

app-logs:
	docker-compose logs -f nest-api

start-services:
	docker compose up -d postgres pgadmin

