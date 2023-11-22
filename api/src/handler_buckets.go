package src

import (
	"fmt"
	"net/http"
)

func (app *application) ApiPatchBucket(w http.ResponseWriter, r *http.Request) {
	bucketId, valid := app.getAndValidateID(w, r, "bucketId")
	if !valid {
		return
	}

	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	if !app.buckets.IDExists(bucketId) {
		app.notFoundResponse(w, r)
		return
	}

	var input struct {
		Name    *string `json:"name,omitempty"`
		Done    *bool   `json:"done,omitempty"`
		Layer   *int    `json:"layer,omitempty"`
		Flagged *bool   `json:"flagged,omitempty"`
	}

	err := app.readJSON(w, r, &input)
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

	err = app.buckets.Update(bucketId, data)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	app.sendActionDataToProjectClients(projectId, ActionUpdateBucket, data)
	app.writeJSON(w, http.StatusOK, data, nil)
}
