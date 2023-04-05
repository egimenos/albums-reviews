.PHONY: up down

start-db:
	cd docker && docker-compose up -d

stop-db:
	cd docker && docker-compose down

