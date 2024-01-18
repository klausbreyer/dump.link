package main

import (
	"embed"
	"fmt"
	"os"

	"dump.link/src"
	"github.com/bugsnag/bugsnag-go/v2"
)

//go:embed templates/*.html
var templatesFS embed.FS

func main() {
	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}
	fmt.Println("releaseStage:", env)
	bugsnag.Configure(bugsnag.Configuration{
		APIKey:              "3d11e08cb78e5bfb37ab3df68a96bffe",
		ReleaseStage:        env,
		NotifyReleaseStages: []string{"dump.link", "kitchen.dump.link"},
		ProjectPackages:     []string{"main"},
		// more configuration options
	})

	fmt.Println("Hello, world!")
	if err := src.Run(templatesFS); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
