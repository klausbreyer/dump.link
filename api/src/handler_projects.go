package src

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"dump.link/src/models"
)

func (app *application) ApiProjectGet(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
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
		buckets = []*models.Bucket{}
	}

	tasks, err := app.tasks.GetForProjectId(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	if tasks == nil {
		tasks = []*models.Task{}
	}

	dependencies, err := app.dependencies.GetForProjectId(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	if dependencies == nil {
		dependencies = []*models.Dependency{}
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

	err = app.actions.Insert(projectId, nil, nil, startTime, string(ActionSetInitialState))
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiProjectPatch(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
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
		StartedAt *string `json:"startedAt,omitempty"`
		Appetite  *int    `json:"appetite,omitempty"`
		Archived  *bool   `json:"archived,omitempty"`
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
		startedAt, err := time.Parse("2006-01-02", *input.StartedAt)
		if err != nil {
			app.badRequestResponse(w, r, fmt.Errorf("invalid date format for startedAt"))
			return
		}
		data["started_at"] = startedAt
	}

	if input.Appetite != nil {
		data["appetite"] = *input.Appetite
	}

	if input.Archived != nil {
		data["archived"] = *input.Archived
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

	if data["started_at"] != nil {
		data["startedAt"] = data["started_at"]
		delete(data, "started_at")
	}

	data["id"] = projectId
	senderToken := app.extractTokenFromRequest(r)

	app.sendActionDataToProjectClients(projectId, senderToken, ActionUpdateProject, data)
	app.writeJSON(w, http.StatusOK, data, nil)

	err = app.actions.Insert(projectId, nil, nil, startTime, string(ActionUpdateProject))
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiProjectDelete(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	if !app.projects.IDExists(projectId) {
		app.notFoundResponse(w, r)
		return
	}

	err := app.projects.Delete(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := envelope{
		"projectId": projectId,
	}
	senderToken := app.extractTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionDeleteProject, data)
	app.writeJSON(w, http.StatusOK, data, nil)

	app.actions.Insert(projectId, nil, nil, startTime, string(ActionDeleteProject))
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiProjectsPost(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	var input struct {
		Name           string `json:"name"`
		Appetite       int    `json:"appetite"`
		OwnerEmail     string `json:"ownerEmail"`
		OwnerFirstName string `json:"ownerFirstName"`
		OwnerLastName  string `json:"ownerLastName"`
	}

	err := app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if input.Name == "" || input.OwnerEmail == "" || input.OwnerFirstName == "" || input.OwnerLastName == "" {
		app.badRequestResponse(w, r, errors.New("missing required fields"))
		return
	}

	projectId, err := app.projects.Insert(input.Name, time.Now(), input.Appetite, input.OwnerEmail, input.OwnerFirstName, input.OwnerLastName)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	// insert 10 buckets + 1 dump
	for i := 0; i < 11; i++ {
		isDump := i == 0
		_, err := app.buckets.Insert("", false, isDump, nil, false, projectId, i)
		if err != nil {
			app.serverErrorResponse(w, r, err)
			return
		}
	}

	project, err := app.projects.Get(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := envelope{
		"project": project,
	}

	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.actions.Insert(projectId, nil, nil, startTime, string(ActionCreateProject))
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiResetProjectLayers(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
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

	err = app.actions.Insert(projectId, nil, nil, startTime, string(ActionResetLayersForAllBuckets))
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
