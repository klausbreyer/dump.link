start:
	lsof -t -i tcp:8080 | xargs kill -9
	lsof -t -i tcp:13306 | xargs kill -9
	lsof -t -i tcp:1234 | xargs kill -9
	(cd api && make start) & (cd app && bun start)

magic:
	cd app && bun run build
	sh lifting.sh
	cd api && fly deploy

# https://github.com/golang-migrate/migrate
up:
	migrate -source  file://api/migrations  -database "mysql://${DB_USER}:${DB_PASS}@tcp(${DB_HOST})/${DB_NAME}?tls=${DB_TLS}&interpolateParams=true" up

down:
	migrate -source  file://api/migrations  -database "mysql://${DB_USER}:${DB_PASS}@tcp(${DB_HOST})/${DB_NAME}?tls=${DB_TLS}&interpolateParams=true" down

reset:
	make up
	make down
