package src

import (
	"fmt"
	"net/http"
	"time"

	"dump.link/src/models"
)

func (app *application) initProject(w http.ResponseWriter, r *http.Request) string {
	currentDate := time.Now().Format("Jan 2nd") // Formatting the date as "Nov 22nd 2023"
	name := "Untitled Project - " + currentDate
	started_at := time.Now()
	appetite := 6

	projectId, err := app.projects.Insert(name, started_at, appetite)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return ""
	}

	//insert 10 buckets + 1 dump
	for i := 0; i < 11; i++ {
		isDump := i == 0
		_, err := app.buckets.Insert("", false, isDump, nil, false, projectId, i)
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
		app.notFoundResponse(w, r)
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

func (app *application) ApiProjectPatch(w http.ResponseWriter, r *http.Request) {
	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	if !app.projects.IDExists(projectId) {
		app.notFoundResponse(w, r)
		return
	}

	var input struct {
		Name      *string `json:"name,omitempty"`
		StartedAt *string `json:"startedAt,omitempty"` // Geändert zu *string
		Appetite  *int    `json:"appetite,omitempty"`
	}

	err := app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	data := make(map[string]interface{})
	if input.Name != nil {
		data["name"] = *input.Name
	}
	if input.StartedAt != nil {
		startedAt, err := time.Parse("2006-01-02", *input.StartedAt) // Konvertierung des Datums
		if err != nil {
			app.badRequestResponse(w, r, fmt.Errorf("invalid date format for startedAt"))
			return
		}
		data["started_at"] = startedAt
	}
	if input.Appetite != nil {
		data["appetite"] = *input.Appetite
	}

	if len(data) == 0 {
		app.badRequestResponse(w, r, fmt.Errorf("no updates provided"))
		return
	}

	err = app.projects.Update(projectId, data)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	// fix missmatch between database column and frontend fields.
	if data["started_at"] != nil {
		data["startedAt"] = data["started_at"]
		delete(data, "started_at")
	}

	data["id"] = projectId
	senderToken := app.extractTokenFromRequest(r)

	app.sendActionDataToProjectClients(projectId, senderToken, ActionUpdateProject, data)
	app.writeJSON(w, http.StatusOK, data, nil)
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
