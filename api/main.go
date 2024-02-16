package main

import (
	"embed"
	"fmt"
	"os"

	"dump.link/src"
	"github.com/bugsnag/bugsnag-go/v2"
	"github.com/workos/workos-go/v3/pkg/organizations"
	"github.com/workos/workos-go/v3/pkg/sso"
	"github.com/workos/workos-go/v3/pkg/usermanagement"
)

//go:embed templates/*.html
var templatesFS embed.FS

func main() {

	env := src.GetHost()
	fmt.Println("releaseStage:", env)
	bugsnag.Configure(bugsnag.Configuration{
		APIKey:              "3d11e08cb78e5bfb37ab3df68a96bffe",
		ReleaseStage:        env,
		NotifyReleaseStages: []string{"dump.link", "kitchen.dump.link"},
		ProjectPackages:     []string{"main"},
	})

	workosApiKey := os.Getenv("WORKOS_API_KEY")
	workosClientID := os.Getenv("WORKOS_CLIENT_ID")
	sso.Configure(workosApiKey, workosClientID)

	organizations.SetAPIKey(workosApiKey)
	usermanagement.SetAPIKey(workosApiKey)

	fmt.Println("Hello, world!")
	if err := src.Run(templatesFS); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
