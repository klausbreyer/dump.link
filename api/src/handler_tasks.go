package src

import (
	"fmt"
	"net/http"
)

func (app *application) ApiAddTask(w http.ResponseWriter, r *http.Request) {
	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	var input struct {
		Id       string `json:"id"`
		BucketID string `json:"bucketId"`
		Title    string `json:"title"`
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

	newTaskID, err := app.tasks.Insert(input.Id, input.Title, false, input.BucketID, DEFAULT_TASK_PRIORITY, projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	task, err := app.tasks.Get(newTaskID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := envelope{
		"task": task,
	}

	app.writeJSON(w, http.StatusCreated, data, nil)
}

func (app *application) ApiDeleteTask(w http.ResponseWriter, r *http.Request) {
	taskId, valid := app.getAndValidateID(w, r, "taskId")
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

	app.writeJSON(w, http.StatusOK, data, nil)
}

func (app *application) ApiPatchTask(w http.ResponseWriter, r *http.Request) {
	taskId, valid := app.getAndValidateID(w, r, "taskId")
	if !valid {
		return
	}

	if !app.tasks.IDExists(taskId) {
		app.notFoundResponse(w, r)
		return
	}

	var input struct {
		BucketID *string  `json:"bucketId,omitempty"`
		Closed   *bool    `json:"closed,omitempty"`
		Title    *string  `json:"title,omitempty"`
		Priority *float64 `json:"priority,omitempty"`
	}

	err := app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	updates := make(envelope)
	if input.BucketID != nil {
		if !app.buckets.IDExists(*input.BucketID) {
			app.notFoundResponse(w, r)
			return
		}
		updates["bucket_id"] = *input.BucketID
	}
	if input.Closed != nil {
		updates["closed"] = *input.Closed
	}
	if input.Title != nil {
		updates["title"] = *input.Title
	}
	if input.Priority != nil {
		updates["priority"] = *input.Priority
	}

	if len(updates) == 0 {
		app.badRequestResponse(w, r, fmt.Errorf("no updates provided"))
		return
	}

	err = app.tasks.Update(taskId, updates)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusOK, updates, nil)
}