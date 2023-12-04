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
	releaseStage := "development"

	env := os.Getenv("ENV")
	if env == "production" {
		releaseStage = "production"
	}

	bugsnag.Configure(bugsnag.Configuration{
		APIKey:       "3d11e08cb78e5bfb37ab3df68a96bffe",
		ReleaseStage: releaseStage,
		// The import paths for the Go packages containing your source files
		ProjectPackages: []string{"main", "github.com/org/myapp"},
		// more configuration options
	})

	fmt.Println("Hello, world!")
	if err := src.Run(templatesFS); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
