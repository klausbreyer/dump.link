package src

import (
	"context"
	"net/http"
	"os"

	"github.com/workos/workos-go/v3/pkg/sso"
	"github.com/workos/workos-go/v3/pkg/usermanagement"
)

func (app *application) AuthGet(w http.ResponseWriter, r *http.Request) {
	redirectUri := GetRedirectUrl().String()

	authorizationURL, err := sso.GetAuthorizationURL(sso.GetAuthorizationURLOpts{
		Provider:    "authkit",
		RedirectURI: redirectUri,
	})

	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	http.Redirect(w, r, authorizationURL.String(), http.StatusFound)
}

func (app *application) AuthCallbackGet(w http.ResponseWriter, r *http.Request) {

	code := r.URL.Query().Get("code")

	workosClientID := os.Getenv("WORKOS_CLIENT_ID")

	response, err := usermanagement.AuthenticateWithCode(
		context.Background(),
		usermanagement.AuthenticateWithCodeOpts{
			ClientID: workosClientID,
			Code:     code,
		},
	)

	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	memberships, err := usermanagement.ListOrganizationMemberships(context.Background(), usermanagement.ListOrganizationMembershipsOpts{
		UserID: response.User.ID,
	})

	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	data := map[string]interface{}{
		"user":        response,
		"again":       "http://0.0.0.0:8080/auth",
		"memberships": memberships,
	}

	app.writeJSON(w, http.StatusCreated, data, nil)
}
