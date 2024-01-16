# dump.link

## requirements

brew install golang-migrate
go install github.com/cosmtrek/air@latest

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run
```

This project was created using `bun init` in bun v1.0.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

Just in case: https://github.com/oven-sh/bun/issues/3030#issuecomment-1712671248

## architecture

### Data Context

Components -> Context Function -> Dispatch to update local state & remote update at the same time -> Show Error when one comes back from the server.
