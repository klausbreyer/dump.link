package main

import (
	"embed"
	"fmt"
	"os"

	"dump.link/src"
)

//go:embed templates/*.html
var templatesFS embed.FS

func main() {
	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}
	fmt.Println("releaseStage:", env)

	fmt.Println("Hello, world!")
	if err := src.Run(templatesFS); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
