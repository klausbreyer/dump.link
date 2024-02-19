tailwind-download:
ifeq ($(shell uname -s), Darwin)
	curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64
else ifeq ($(shell uname -s), Linux)
	curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64
endif
	mv tailwindcss-* tailwindcss
	chmod +x tailwindcss

watch:
	./tailwindcss -i ./css/tailwind.css -o ./static/tailwind.css --watch

tailwind-build:
	./tailwindcss -i ./css/tailwind.css -o ./static/tailwind.css --minify

kill:
	killall air
	lsof -t -i tcp:8080 | xargs kill -9

test:
	go test -v ./src/...

deploy:
	fly deploy
