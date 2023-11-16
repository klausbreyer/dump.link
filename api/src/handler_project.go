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

	id, err := app.projects.Insert(*input.Name, *input.StartedAt, time.Now(), *input.Appetite)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data, err := app.projects.Get(id)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"project": data}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
}
