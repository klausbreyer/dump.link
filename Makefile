start:
	lsof -t -i tcp:8080 | xargs kill -9
	lsof -t -i tcp:13306 | xargs kill -9
	lsof -t -i tcp:1234 | xargs kill -9
	(cd api && make start) & (cd app && bun start)


# https://github.com/golang-migrate/migrate
up:
	migrate -source  file://api/migrations  -database "mysql://${DB_USER}:${DB_PASSWORD}@tcp(${DB_HOST})/${DB_NAME}" up

down:
	migrate -source  file://api/migrations  -database "mysql://${DB_USER}:${DB_PASSWORD}@tcp(${DB_HOST})/${DB_NAME}" down

reset:
	make up
	make down
