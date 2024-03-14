package src

import (
	"fmt"
	"net/http"
	"time"
)

func (app *application) ApiPatchBucket(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	bucketId, valid := app.getAndValidateID(w, r, "bucketId")
	if !valid {
		return
	}

	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	userID, orgId, err := app.getAndValidateUserAndOrg(r, projectId)
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	project, err := app.projects.Get(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.assumePermission(orgId, *project)
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	if project.Archived {
		app.goneResponse(w, r)
		return
	}

	var input struct {
		Name    *string `json:"name,omitempty"`
		Done    *bool   `json:"done,omitempty"`
		Layer   *int    `json:"layer,omitempty"`
		Flagged *bool   `json:"flagged,omitempty"`
	}

	err = app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	data := make(envelope)
	if input.Name != nil {
		data["name"] = *input.Name
	}
	if input.Done != nil {
		data["done"] = *input.Done
	}
	if input.Layer != nil {
		data["layer"] = *input.Layer
	}
	if input.Flagged != nil {
		data["flagged"] = *input.Flagged
	}

	if len(data) == 0 {
		app.badRequestResponse(w, r, fmt.Errorf("no updates provided"))
		return
	}

	data["updated_by"] = userID

	err = app.buckets.Update(bucketId, data)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	//always send the id, ws needs it.
	data["id"] = bucketId

	senderToken := app.getTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionUpdateBucket, data)
	app.writeJSON(w, http.StatusOK, data, nil)

	err = app.actions.Insert(projectId, &bucketId, nil, startTime, string(ActionUpdateBucket), userID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiResetBucketLayers(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	bucketId, valid := app.getAndValidateID(w, r, "bucketId")
	if !valid {
		return
	}

	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	userID, orgId, err := app.getAndValidateUserAndOrg(r, projectId)
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	project, err := app.projects.Get(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.assumePermission(orgId, *project)
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	if project.Archived {
		app.goneResponse(w, r)
		return
	}

	err = app.buckets.ResetLayer(bucketId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := make(envelope)
	data["id"] = bucketId
	data["layer"] = nil

	senderToken := app.getTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionResetBucketLayers, data)
	app.writeJSON(w, http.StatusOK, data, nil)

	err = app.actions.Insert(projectId, &bucketId, nil, startTime, string(ActionResetBucketLayers), userID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
