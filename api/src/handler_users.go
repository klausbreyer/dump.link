package src

import (
	"fmt"
	"net/http"
)

func (app *application) ApiGetUsers(w http.ResponseWriter, r *http.Request) {

	projectId := app.projects.GetNewID()
	userID, orgID, err := app.getAndValidateUserAndOrg(r, projectId)
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	if isAnonymous(userID) {
		app.unauthorizedResponse(w, r, fmt.Errorf("anonymous user"))
		return
	}

	app.logger.Debug("GetUsers", "orgID", orgID)
	users, err := app.auth0m2mClient.GetOrganizationMembers(orgID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := users

	app.writeJSON(w, http.StatusCreated, data, nil)
}
