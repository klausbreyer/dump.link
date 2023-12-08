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
	if env := os.Getenv("ENV"); env != "" {
		fmt.Println("releaseStage:", env)
		bugsnag.Configure(bugsnag.Configuration{
			APIKey:          "3d11e08cb78e5bfb37ab3df68a96bffe",
			ReleaseStage:    env,
			ProjectPackages: []string{"main", "github.com/org/myapp"},
			// more configuration options
		})
	} else {
		fmt.Println("Bugsnag not configured as ENV is not set.")
	}

	fmt.Println("Hello, world!")
	if err := src.Run(templatesFS); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
