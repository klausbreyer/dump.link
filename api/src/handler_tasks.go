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

	// Check the length of Id and BucketID
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

	data := envelope{
		"taskId": newTaskID,
	}

	app.writeJSON(w, http.StatusCreated, data, nil)
}

func (app *application) ApiDeleteTask(w http.ResponseWriter, r *http.Request) {
}

func (app *application) ApiMoveTask(w http.ResponseWriter, r *http.Request) {
}

func (app *application) ApiChangeTaskState(w http.ResponseWriter, r *http.Request) {
}

func (app *application) ApiUpdateTask(w http.ResponseWriter, r *http.Request) {
}

func (app *application) ApiReorderTask(w http.ResponseWriter, r *http.Request) {
}
