package src

import (
	"net/http"
	"time"

	"dump.link/src/models"
	"github.com/julienschmidt/httprouter"
)

const DEFAULT_PROJECT_APPETITE = 6
const DEFAULT_TASK_PRIORITY = 100000
const DEFAULT_TASK_NAME = "Your first task"

func (app *application) initProject(w http.ResponseWriter, r *http.Request) string {
	name := ProjectName()
	startedAt := time.Now()
	appetite := DEFAULT_PROJECT_APPETITE

	projectId, err := app.projects.Insert(name, startedAt, appetite)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return ""
	}

	//insert 10 buckets + 1 dump
	for i := 0; i < 11; i++ {
		dump := i == 0
		bucketId, err := app.buckets.Insert("", false, dump, nil, false, projectId)
		if err != nil {
			app.serverErrorResponse(w, r, err)
			return ""
		}
		if !dump {
			continue
		}

		//insert Task into Dump
		_, err = app.tasks.Insert(models.NewID(projectId), DEFAULT_TASK_NAME, false, bucketId, DEFAULT_TASK_PRIORITY, projectId)
		if err != nil {
			app.serverErrorResponse(w, r, err)
			return ""
		}
	}
	return projectId

}

func (app *application) ApiProjectGet(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())
	projectId := params.ByName("projectId")

	idExists := app.projects.IDExists(projectId)
	if !idExists {
		app.notFoundResponse(w, r)
		return
	}

	project, err := app.projects.Get(projectId)
	if err != nil {

		app.serverErrorResponse(w, r, err)
		return
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

func (app *application) ApiProjectsPost(w http.ResponseWriter, r *http.Request) {
	projectId := app.initProject(w, r)

	data := envelope{
		"projectId": projectId,
	}

	err := app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
