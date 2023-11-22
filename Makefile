kill:
	lsof -t -i tcp:8080 | xargs kill -9
	lsof -t -i tcp:13306 | xargs kill -9
	lsof -t -i tcp:1234 | xargs kill -9

start:
	make kill
	rm -rf app/.parcel-cache
	(cd api && air) & (cd api && ./tailwindcss -i ./css/tailwind.css -o ./static/tailwind.css --watch) & (cd app && bun start)

test:
	cd api && make test

fly:
	cd app && bun install && bun run build
	sh lifting.sh
	cd api && fly deploy

# https://github.com/golang-migrate/migrate
up:
	migrate -source  file://api/migrations  -database "mysql://${DB_USER}:${DB_PASS}@tcp(${DB_HOST})/${DB_NAME}?tls=${DB_TLS}&interpolateParams=true" up

down:
	migrate -source  file://api/migrations  -database "mysql://${DB_USER}:${DB_PASS}@tcp(${DB_HOST})/${DB_NAME}?tls=${DB_TLS}&interpolateParams=true" down

reset:
	make down
	make up

dump:
	rm -rf dump;
	pscale database dump dumplink main --output dump
	mysql -u "$$DB_USER" -p"$$DB_PASS" -h "$$DB_HOST" -e "DROP DATABASE IF EXISTS $$DB_NAME; CREATE DATABASE $$DB_NAME;"
	for file in ./dump/*.sql; do mysql -u "$$DB_USER" -p"$$DB_PASS" -h "$$DB_HOST" "$$DB_NAME" < "$$file"; done
