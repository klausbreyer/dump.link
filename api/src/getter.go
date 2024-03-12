package src

import (
	"errors"
	"net/http"
	"net/url"
	"strings"

	"dump.link/src/auth0client"
	"dump.link/src/models"
	"github.com/julienschmidt/httprouter"
)

func (app *application) getAndValidateID(w http.ResponseWriter, r *http.Request, idParamName string) (string, bool) {
	params := httprouter.ParamsFromContext(r.Context())
	id := params.ByName(idParamName)

	if !app.idExists(idParamName, id) {
		app.notFoundResponse(w, r)
		return "", false
	}

	return id, true
}

func (app *application) validateUserID(id string) bool {
	parts := strings.Split(id, "|")
	return len(parts) == 2 && len(parts[0]) > 1 && len(parts[1]) > 1
}

func generateDumplinkSubject(username string, projectID string) string {
	return "dumplink" + "|" + projectID + "_" + url.QueryEscape(username)
}

func isAnonymous(subject string) bool {
	return strings.HasPrefix(subject, "dumplink")
}

func (app *application) assumePermission(orgId string, project models.Project) error {
	if project.OrgID != "" && orgId != project.OrgID {
		return errors.New("unauthorized")
	}
	return nil
}

func (app *application) getAndValidateUserAndOrg(r *http.Request, projectId string) (string, string, error) {
	// check if Authorization Header is present then prioritize that
	if app.hasAuthorizationHeader(r) {
		claims, customClaims, err := auth0client.GetClaims(r)
		if err != nil {
			return "", "", err
		}

		sub := claims.RegisteredClaims.Subject

		if !app.validateUserID(sub) {
			return "", "", errors.New("invalid user id")
		}

		return sub, customClaims.OrgId, nil
	}

	username, err := app.getUsernameFromHeader(r)
	if err != nil {
		return "", "", err
	}

	sub := generateDumplinkSubject(username, projectId)

	if !app.validateUserID(sub) {
		return "", "", errors.New("invalid username")
	}

	return sub, "", nil
}

func (app *application) idExists(idType string, id string) bool {
	switch idType {
	case "projectId":
		return app.projects.IDExists(id)
	case "taskId":
		return app.tasks.IDExists(id)
	case "dependencyId":
		return app.buckets.IDExists(id)
	case "bucketId":
		return app.buckets.IDExists(id)
	default:
		return false
	}
}

func (app *application) getUsernameFromHeader(r *http.Request) (string, error) {
	encodedUsername := r.Header.Get("Username")

	decodedUsername, err := url.QueryUnescape(encodedUsername)
	if err != nil {
		return "", err
	}
	return decodedUsername, nil
}

func (app *application) hasAuthorizationHeader(r *http.Request) bool {
	token := r.Header.Get("Authorization")
	return token != ""
}

func (app *application) getTokenFromRequest(r *http.Request) string {
	token := r.URL.Query().Get("token")
	return token
}

func (app *application) getUsernameFromRequest(r *http.Request) string {
	token := r.URL.Query().Get("username")
	return token
}
