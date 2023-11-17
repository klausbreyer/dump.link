package src

import (
	"net/http"
	"time"
)

const DEFAULT_APPETITE = 6

func (app *application) ProjectsPost(w http.ResponseWriter, r *http.Request) {

	name := ProjectName()
	startedAt := time.Now()
	appetite := DEFAULT_APPETITE

	projectId, err := app.projects.Insert(name, startedAt, appetite)
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
