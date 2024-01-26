package src

import (
	"net/http"

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
	username := r.Header.Get("Username")

	return username, nil
}

func (app *application) getTokenFromRequest(r *http.Request) string {
	token := r.URL.Query().Get("token")
	return token
}

func (app *application) getUsernameFromRequest(r *http.Request) string {
	token := r.URL.Query().Get("username")
	return token
}
