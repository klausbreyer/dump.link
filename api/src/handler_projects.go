package src

import (
	"net/http"
	"time"

	"dump.link/src/models"
)

const DEFAULT_PROJECT_APPETITE = 6
const DEFAULT_TASK_PRIORITY = 100000
const DEFAULT_TASK_NAME = "Your first task"

func (app *application) initProject(w http.ResponseWriter, r *http.Request) string {
	name := ProjectName()
	started_at := time.Now()
	appetite := DEFAULT_PROJECT_APPETITE

	projectId, err := app.projects.Insert(name, started_at, appetite)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return ""
	}

	//insert 10 buckets + 1 dump
	for i := 0; i < 11; i++ {
		dump := i == 0
		bucketId, err := app.buckets.Insert("", false, dump, nil, false, projectId)
		if err != nil {
			app.serverErrorResponse(w, r, err)
			return ""
		}
		if !dump {
			continue
		}

		//insert Task into Dump
		_, err = app.tasks.Insert(models.NewID(projectId), DEFAULT_TASK_NAME, false, bucketId, DEFAULT_TASK_PRIORITY, projectId)
		if err != nil {
			app.serverErrorResponse(w, r, err)
			return ""
		}
	}
	return projectId

}

func (app *application) ApiProjectGet(w http.ResponseWriter, r *http.Request) {
	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	project, err := app.projects.Get(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	buckets, err := app.buckets.GetForProjectId(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	if buckets == nil {
		buckets = []*models.Bucket{} // Ersetzen Sie Bucket mit dem tatsächlichen Typ für Buckets
	}

	tasks, err := app.tasks.GetForProjectId(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	if tasks == nil {
		tasks = []*models.Task{} // Ersetzen Sie Task mit dem tatsächlichen Typ für Tasks
	}

	dependencies, err := app.dependencies.GetForProjectId(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	if dependencies == nil {
		dependencies = []*models.Dependency{} // Ersetzen Sie Dependency mit dem tatsächlichen Typ für Dependencies
	}

	data := envelope{
		"project":      project,
		"buckets":      buckets,
		"tasks":        tasks,
		"dependencies": dependencies,
	}

	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiProjectsPost(w http.ResponseWriter, r *http.Request) {
	projectId := app.initProject(w, r)

	data := envelope{
		"projectId": projectId,
	}

	err := app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiResetProjectLayers(w http.ResponseWriter, r *http.Request) {
	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	if !app.projects.IDExists(projectId) {
		app.notFoundResponse(w, r)
		return
	}

	err := app.buckets.ResetProjectLayers(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := make(envelope)
	data["message"] = "All layers in the project have been reset successfully"

	senderToken := app.extractTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionResetLayersForAllBuckets, data)
	app.writeJSON(w, http.StatusOK, data, nil)
}
