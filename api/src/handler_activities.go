package src

import (
	"errors"
	"net/http"
	"time"

	"dump.link/src/models"
)

func (app *application) ApiActivityPost(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	username, err := app.getUsernameFromHeader(r)
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	var input struct {
		BucketID  *string `json:"bucketId"`
		TaskID    *string `json:"taskId"`
		CreatedBy *string `json:"createdBy"`
	}

	err = app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if input.BucketID != nil && input.TaskID != nil {
		app.badRequestResponse(w, r, errors.New("too much fields"))
		return
	}

	if input.TaskID != nil && !app.tasks.IDExists(*input.TaskID) {
		app.notFoundResponse(w, r)
		return
	}

	if input.BucketID != nil && !app.buckets.IDExists(*input.BucketID) {
		app.notFoundResponse(w, r)
		return
	}

	if input.TaskID != nil {
		err = app.activities.ReplaceTaskId(projectId, *input.TaskID, username)
	} else {
		if input.BucketID != nil {
			err = app.activities.ReplaceBucketId(projectId, *input.BucketID, username)
		} else {
			err = app.activities.Reset(projectId, username)
		}
	}

	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data, err := app.activities.GetForProjectId(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if data == nil {
		data = []*models.Activity{}
	}

	senderToken := app.getTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionUpdateActivities, data)
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.actions.Insert(projectId, nil, nil, startTime, string(ActionUpdateActivities), username)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
