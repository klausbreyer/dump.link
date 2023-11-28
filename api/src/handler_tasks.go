package src

import (
	"fmt"
	"net/http"
	"time"
)

func (app *application) ApiAddTask(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}
	fmt.Printf("Validierung der Projekt-ID abgeschlossen in %v\n", time.Since(startTime))

	var input struct {
		Id       string `json:"id"`
		BucketID string `json:"bucketId"`
		Title    string `json:"title"`
		Priority int    `json:"priority"`
	}

	err := app.readJSON(w, r, &input)
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

	insertTime := time.Now()
	newTaskID, err := app.tasks.Insert(input.Id, input.Title, false, input.BucketID, input.Priority, projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	app.logger.Info(fmt.Sprintf("Task insertion completed in %v", time.Since(insertTime)))

	getTime := time.Now()
	task, err := app.tasks.Get(newTaskID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	app.logger.Info(fmt.Sprintf("Task retrieval completed in %v", time.Since(getTime)))

	data := task

	senderToken := app.extractTokenFromRequest(r)

	sendTime := time.Now()
	app.sendActionDataToProjectClients(projectId, senderToken, ActionAddTask, data)
	app.logger.Info(fmt.Sprintf("Sending action data to project clients completed in %v", time.Since(sendTime)))

	writeTime := time.Now()
	app.writeJSON(w, http.StatusCreated, data, nil)
	app.logger.Info(fmt.Sprintf("Writing JSON response completed in %v", time.Since(writeTime)))

	app.logger.Info(fmt.Sprintf("Total duration of ApiAddTask request: %v", time.Since(startTime)))
}

func (app *application) ApiDeleteTask(w http.ResponseWriter, r *http.Request) {
	taskId, valid := app.getAndValidateID(w, r, "taskId")
	if !valid {
		return
	}
	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	if !app.tasks.IDExists(taskId) {
		app.notFoundResponse(w, r)
		return
	}

	err := app.tasks.Delete(taskId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := envelope{
		"taskId": taskId,
	}
	senderToken := app.extractTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionDeleteTask, data)
	app.writeJSON(w, http.StatusOK, data, nil)
}

func (app *application) ApiPatchTask(w http.ResponseWriter, r *http.Request) {
	taskId, valid := app.getAndValidateID(w, r, "taskId")
	if !valid {
		return
	}

	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	if !app.tasks.IDExists(taskId) {
		app.notFoundResponse(w, r)
		return
	}

	var input struct {
		BucketID *string `json:"bucketId,omitempty"`
		Closed   *bool   `json:"closed,omitempty"`
		Title    *string `json:"title,omitempty"`
		Priority *int    `json:"priority,omitempty"`
	}

	err := app.readJSON(w, r, &input)
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

	//always send the id, ws needs it.
	data["id"] = taskId

	senderToken := app.extractTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionUpdateTask, data)
	app.writeJSON(w, http.StatusOK, data, nil)
}
