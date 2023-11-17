package src

import (
	"net/http"
	"time"
)

func (app *application) ProjectsPost(w http.ResponseWriter, r *http.Request) {

	var input struct {
		Name      *string    `json:"name"`
		StartedAt *time.Time `json:"startedAt"`
		Appetite  *int       `json:"appetite"`
	}
	err := app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	projectId, err := app.projects.Insert(*input.Name, *input.StartedAt, time.Now(), *input.Appetite)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	project, err := app.projects.Get(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	//insert 10 buckets + 1 dump
	for i := 0; i < 11; i++ {
		dump := i == 0
		_, err := app.buckets.Insert("", false, dump, nil, false, projectId)
		if err != nil {
			app.serverErrorResponse(w, r, err)
			return
		}
	}

	buckets, err := app.buckets.GetForProjectId(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := envelope{
		"project": project,
		"buckets": buckets,
	}

	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
