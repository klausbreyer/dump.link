package src

import (
	"fmt"
	"net/http"
	"time"
)

func (app *application) ApiAddDependency(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	userID, orgID, err := app.getAndValidateUserAndOrg(r, "")
	if err != nil {
		app.unauthorizedResponse(w, r, err)
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

	err = app.assumePermission(orgID, *project)
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	if project.Archived {
		app.goneResponse(w, r)
		return
	}
	var input struct {
		BucketID     *string `json:"bucketId"`
		DependencyId *string `json:"dependencyId"`
	}

	err = app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if !app.buckets.IDExists(*input.BucketID) || !app.buckets.IDExists(*input.DependencyId) {
		app.notFoundResponse(w, r)
		return
	}

	if len(*input.BucketID) != 22 || len(*input.DependencyId) != 22 {
		app.serverErrorResponse(w, r, fmt.Errorf("BucketID and DependsOnBucketID must be exactly 22 characters long"))
		return
	}

	exists, err := app.dependencies.Exists(*input.BucketID, *input.DependencyId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	if exists {
		app.badRequestResponse(w, r, fmt.Errorf("this dependency already exists"))
		return
	}

	err = app.dependencies.Insert(*input.BucketID, *input.DependencyId, userID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := envelope{
		"bucketId":     *input.BucketID,
		"dependencyId": *input.DependencyId,
		"createdBy":    userID,
	}

	senderToken := app.getClientTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionAddBucketDependency, data)
	app.writeJSON(w, http.StatusCreated, data, nil)

	err = app.actions.Insert(projectId, input.BucketID, nil, startTime, string(ActionAddBucketDependency), userID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}

func (app *application) ApiRemoveDependency(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	userID, orgID, err := app.getAndValidateUserAndOrg(r, "")
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	projectId, valid := app.getAndValidateID(w, r, "projectId")
	if !valid {
		return
	}

	bucketId, valid := app.getAndValidateID(w, r, "bucketId")
	if !valid {
		return
	}

	dependencyId, valid := app.getAndValidateID(w, r, "dependencyId")
	if !valid {
		return
	}

	project, err := app.projects.Get(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.assumePermission(orgID, *project)
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	if project.Archived {
		app.goneResponse(w, r)
		return
	}

	rowsAffected, err := app.dependencies.Delete(bucketId, dependencyId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if rowsAffected == 0 {
		app.badRequestResponse(w, r, fmt.Errorf("no dependencies were deleted"))
		return
	}

	data := envelope{
		"bucketId":     bucketId,
		"dependencyId": dependencyId,
	}

	senderToken := app.getClientTokenFromRequest(r)
	app.sendActionDataToProjectClients(projectId, senderToken, ActionRemoveBucketDependency, data)
	app.writeJSON(w, http.StatusOK, data, nil)

	err = app.actions.Insert(projectId, &bucketId, nil, startTime, string(ActionRemoveBucketDependency), userID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
