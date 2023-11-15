package main

import (
	"embed"
	"fmt"
	"os"

	"dump.link/src"
)

//go:embed content/index.md
var contentFS embed.FS

func main() {
	fmt.Println("Hello, world!")
	if err := src.Run(contentFS); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
