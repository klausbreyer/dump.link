start:
	lsof -t -i tcp:8080 | xargs kill -9
	lsof -t -i tcp:13306 | xargs kill -9
	lsof -t -i tcp:1234 | xargs kill -9
	(cd api && make start) & (cd app && yarn start)
