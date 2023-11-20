package src

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/justinas/alice"
)

func (app *application) routes() http.Handler {
	router := httprouter.New()

	router.NotFound = http.HandlerFunc(app.notFoundResponse)
	router.MethodNotAllowed = http.HandlerFunc(app.methodNotAllowedResponse)

	fileServer := http.FileServer(http.Dir("./static/"))
	router.Handler(http.MethodGet, "/static/*filepath", http.StripPrefix("/static", fileServer))

	router.HandlerFunc(http.MethodGet, "/", app.RootGet)
	router.HandlerFunc(http.MethodGet, "/a", app.ProjectRoot)

	router.HandlerFunc(http.MethodGet, "/a/:projectId", app.ProjectGet)

	router.HandlerFunc(http.MethodGet, "/api/v1/health", app.HealthGet)
	router.HandlerFunc(http.MethodPost, "/api/v1/projects", app.ApiProjectsPost)
	router.HandlerFunc(http.MethodGet, "/api/v1/projects/:projectId", app.ApiProjectGet)

	router.HandlerFunc(http.MethodPost, "/api/v1/projects/:projectId/tasks", app.ApiAddTask)
	router.HandlerFunc(http.MethodDelete, "/api/v1/projects/:projectId/tasks/:taskId", app.ApiDeleteTask)
	router.HandlerFunc(http.MethodPatch, "/api/v1/projects/:projectId/tasks/:taskId", app.ApiPatchTask)
	router.HandlerFunc(http.MethodPatch, "/api/v1/projects/:projectId/buckets/:bucketId", app.ApiPatchBucket)
	router.HandlerFunc(http.MethodPost, "/api/v1/projects/:projectId/dependencies", app.ApiAddDependency)
	router.HandlerFunc(http.MethodDelete, "/api/v1/projects/:projectId/dependencies/:bucketId/:dependencyId", app.ApiRemoveDependency)

	standard := alice.New(app.recoverPanic, app.enableCORS, app.logRequest, secureHeaders)

	return standard.Then(router)
}
