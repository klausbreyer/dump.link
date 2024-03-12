package src

import (
	"fmt"
	"net/http"
)

func (app *application) ApiGetUsers(w http.ResponseWriter, r *http.Request) {

	projectId := app.projects.GetNewID()
	userID, orgId, err := app.getAndValidateUserAndOrg(r, projectId)
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	if isAnonymous(userID) {
		app.unauthorizedResponse(w, r, fmt.Errorf("anonymous user"))
		return
	}

	app.logger.Debug("GetUsers", "orgId", orgId)
	users, err := app.auth0m2mClient.GetOrganizationMembers(orgId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := map[string]interface{}{
		"users": users,
	}

	app.writeJSON(w, http.StatusOK, data, nil)
}
