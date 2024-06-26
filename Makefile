kill:
	-killall air
	lsof -t -i tcp:8080 | xargs kill -9

start:
	make kill
	rm -rf app/.parcel-cache
	(cd api && air) & (cd api && ./tailwindcss -i ./css/tailwind.css -o ./static/tailwind.css --watch) & (cd app && bun start)

test:
	cd api && make test
	cd app && bun test

frontend:
	cd app && bun install && bun run build
	sh lifting.sh

fly:
	make frontend
	cd api && fly deploy

# https://github.com/golang-migrate/migrate
up:
	migrate -source  file://api/migrations  -database "mysql://${DB_USER}:${DB_PASS}@tcp(${DB_HOST})/${DB_NAME}?tls=${DB_TLS}&interpolateParams=true" up

down:
	migrate -source  file://api/migrations  -database "mysql://${DB_USER}:${DB_PASS}@tcp(${DB_HOST})/${DB_NAME}?tls=${DB_TLS}&interpolateParams=true" down

reset:
	mysql -u "$$DB_USER" -p"$$DB_PASS" -h "$$DB_HOST" -e "DROP DATABASE IF EXISTS $$DB_NAME; CREATE DATABASE $$DB_NAME;"

load:
	sh loading.sh


prod:
	rm -rf pscale-dump;
	pscale database dump dumplink main --output pscale-dump
	for file in ./pscale-dump/*.sql; do \
		sed -i.bak -e 's/DEFINER[ ]*=[ ]*[^ ]*@[ ]*[^ ]*//g' "$$file"; \
		sed -i.bak '1s/^/SET NAMES '\''utf8mb4'\'';\n/' "$$file"; \
	done

kitchen:
	rm -rf pscale-dump;
	pscale database dump dumplink kitchen --output pscale-dump

db:
	make reset
	-make load
	make up

fresh:
	make reset
	make up
