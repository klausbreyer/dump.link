package src

import (
	"fmt"
	"net/http"
	"time"
)

func (app *application) ApiPostTask(w http.ResponseWriter, r *http.Request) {
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

	var input struct {
		Id       string `json:"id"`
		BucketID string `json:"bucketId"`
		Title    string `json:"title"`
		Priority int    `json:"priority"`
	}

	err = app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if len(input.Id) != 22 {
		app.serverErrorResponse(w, r, fmt.Errorf("id must be exactly 22 characters long"))
		return
	}

	if len(input.BucketID) != 22 {
		app.serverErrorResponse(w, r, fmt.Errorf("bucketId must be exactly 22 characters long"))
		return
	}

	newTaskID, err := app.tasks.Insert(input.Id, input.Title, false, input.BucketID, input.Priority, projectId, username)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	task, err := app.tasks.Get(newTaskID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := task

	senderToken := app.getTokenFromRequest(r)

	app.sendActionDataToProjectClients(projectId, senderToken, ActionAddTask, data)

	app.writeJSON(w, http.StatusCreated, data, nil)
	app.actions.Insert(projectId, nil, &task.ID, startTime, string(ActionAddTask), username)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiDeleteTask(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	username, err := app.getUsernameFromHeader(r)
	if err != nil {
		app.unauthorizedResponse(w, r)
		return
	}

	taskId, valid := app.getAndValidateID(w, r, "taskId")
	if !valid {
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

	err = app.tasks.Delete(taskId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := envelope{
		"taskId": taskId,
	}
	senderToken := app.getTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionDeleteTask, data)
	app.writeJSON(w, http.StatusOK, data, nil)

	app.actions.Insert(projectId, nil, &taskId, startTime, string(ActionDeleteTask), username)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiPatchTask(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	username, err := app.getUsernameFromHeader(r)
	if err != nil {
		app.unauthorizedResponse(w, r)
		return
	}
	taskId, valid := app.getAndValidateID(w, r, "taskId")
	if !valid {
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

	var input struct {
		BucketID *string `json:"bucketId,omitempty"`
		Closed   *bool   `json:"closed,omitempty"`
		Title    *string `json:"title,omitempty"`
		Priority *int    `json:"priority,omitempty"`
	}

	err = app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	data := make(envelope)
	if input.BucketID != nil {
		if !app.buckets.IDExists(*input.BucketID) {
			app.notFoundResponse(w, r)
			return
		}
		data["bucket_id"] = *input.BucketID
	}
	if input.Closed != nil {
		data["closed"] = *input.Closed
	}
	if input.Title != nil {
		data["title"] = *input.Title
	}
	if input.Priority != nil {
		data["priority"] = *input.Priority
	}

	if len(data) == 0 {
		app.badRequestResponse(w, r, fmt.Errorf("no updates provided"))
		return
	}

	data["updated_by"] = username

	err = app.tasks.Update(taskId, data)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	// fix missmatch between database column and frontend fields.
	if data["bucket_id"] != nil {
		data["bucketId"] = data["bucket_id"]
		delete(data, "bucket_id")
	}
	if data["updated_by"] != nil {
		data["updatedBy"] = data["updated_by"]
		delete(data, "updated_by")
	}

	//always send the id, ws needs it.
	data["id"] = taskId

	senderToken := app.getTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionUpdateTask, data)
	app.writeJSON(w, http.StatusOK, data, nil)

	err = app.actions.Insert(projectId, nil, &taskId, startTime, string(ActionUpdateTask), username)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
