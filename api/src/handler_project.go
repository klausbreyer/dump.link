package src

import (
	"net/http"
	"time"

	"dump.link/src/models"
)

const DEFAULT_PROJECT_APPETITE = 6
const DEFAULT_TASK_PRIORITY = 100000
const DEFAULT_TASK_NAME = "Your first task"

func (app *application) ProjectsPost(w http.ResponseWriter, r *http.Request) {

	name := ProjectName()
	startedAt := time.Now()
	appetite := DEFAULT_PROJECT_APPETITE

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
		bucketId, err := app.buckets.Insert("", false, dump, nil, false, projectId)
		if err != nil {
			app.serverErrorResponse(w, r, err)
			return
		}
		if !dump {
			continue
		}

		//insert Task into Dump
		_, err = app.tasks.Insert(models.NewID(projectId), DEFAULT_TASK_NAME, false, bucketId, DEFAULT_TASK_PRIORITY, projectId)
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

	tasks, err := app.tasks.GetForProjectId(projectId)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data := envelope{
		"project": project,
		"buckets": buckets,
		"tasks":   tasks,
	}

	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
