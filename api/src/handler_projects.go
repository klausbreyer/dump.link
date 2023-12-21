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

	username, err := app.getUsernameFromHeader(r)
	if err != nil {
		app.unauthorizedResponse(w, r)
		return
	}

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

	activities, err := app.activities.GetForProjectId(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	if activities == nil {
		activities = []*models.Activity{}
	}

	data := envelope{
		"project":      project,
		"buckets":      buckets,
		"tasks":        tasks,
		"dependencies": dependencies,
		"activities":   activities,
	}

	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.actions.Insert(projectId, nil, nil, startTime, string(ActionSetInitialState), username)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiProjectPatch(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	username, err := app.getUsernameFromHeader(r)
	if err != nil {
		app.unauthorizedResponse(w, r)
		return
	}

	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	var input struct {
		Name      *string `json:"name,omitempty"`
		StartedAt *string `json:"startedAt,omitempty"`
		EndingAt  *string `json:"endingAt,omitempty"`
		Appetite  *int    `json:"appetite,omitempty"`
		Archived  *bool   `json:"archived,omitempty"`
	}

	err = app.readJSON(w, r, &input)
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
	if input.EndingAt != nil {
		endingAt, err := time.Parse("2006-01-02", *input.EndingAt)
		if err != nil {
			app.badRequestResponse(w, r, fmt.Errorf("invalid date format for endingAt"))
			return
		}
		data["ending_at"] = endingAt
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

	data["updated_by"] = username

	err = app.projects.Update(projectId, data)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if data["started_at"] != nil {
		data["startedAt"] = data["started_at"]
		delete(data, "started_at")
	}

	if data["updated_by"] != nil {
		data["updatedBy"] = data["updated_by"]
		delete(data, "updated_by")
	}

	data["id"] = projectId
	senderToken := app.getTokenFromRequest(r)

	app.sendActionDataToProjectClients(projectId, senderToken, ActionUpdateProject, data)
	app.writeJSON(w, http.StatusOK, data, nil)

	err = app.actions.Insert(projectId, nil, nil, startTime, string(ActionUpdateProject), username)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiProjectsPost(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	username, err := app.getUsernameFromHeader(r)
	if err != nil {
		app.unauthorizedResponse(w, r)
		return
	}

	var input struct {
		Name           string `json:"name"`
		Appetite       int    `json:"appetite"`
		OwnerEmail     string `json:"ownerEmail"`
		OwnerFirstName string `json:"ownerFirstName"`
		OwnerLastName  string `json:"ownerLastName"`
	}

	err = app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if input.Name == "" || input.OwnerEmail == "" || input.OwnerFirstName == "" || input.OwnerLastName == "" {
		app.badRequestResponse(w, r, errors.New("missing required fields"))
		return
	}

	projectId, err := app.projects.Insert(input.Name, input.Appetite, input.OwnerEmail, input.OwnerFirstName, input.OwnerLastName, username)
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

	err = app.actions.Insert(projectId, nil, nil, startTime, string(ActionCreateProject), username)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiResetProjectLayers(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	username, err := app.getUsernameFromHeader(r)
	if err != nil {
		app.unauthorizedResponse(w, r)
		return
	}

	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	project, err := app.projects.Get(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if project.Archived {
		app.goneResponse(w, r)
		return
	}

	err = app.buckets.ResetProjectLayers(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := make(envelope)
	data["message"] = "All layers in the project have been reset successfully"

	senderToken := app.getTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionResetProjectLayers, data)
	app.writeJSON(w, http.StatusOK, data, nil)

	err = app.actions.Insert(projectId, nil, nil, startTime, string(ActionResetProjectLayers), username)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
