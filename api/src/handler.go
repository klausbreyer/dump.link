package src

import (
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/julienschmidt/httprouter"
)

func (app *application) ProjectRoot(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

// AppGet handles the request and serves the HTML with dynamic script and stylesheet links.
func (app *application) ProjectGet(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())
	projectId := params.ByName("projectId")

	project, err := app.projects.Get(projectId)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	jsFile, cssFile, err := findFiles("static/app/")
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	template := fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<title>dump.link - %s</title>
		<link rel="icon" type="image/svg+xml" href="/static/icons/favicon.svg" />
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link href="/%s" rel="stylesheet">
	</head>
	<body>
		<div class="flex items-center justify-center w-screen h-screen text-center lg:hidden">
			This site is not optimized for mobile. Please use a desktop browser.
		</div>
		<div id="app" class="invisible lg:visible"></div>
		<script src="/%s" type="module"></script>
	</body>
	</html>
	`, project.Name, cssFile, jsFile)

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(template))
}

func (app *application) HealthGet(w http.ResponseWriter, r *http.Request) {
	data := map[string]string{
		"status": "available",
	}

	err := app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.logger.Error(err.Error())
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
	}
}
func (app *application) RootGet(w http.ResponseWriter, r *http.Request) {
	htmlTemplatePath := "templates/index.html"

	htmlContent, err := app.templatesFS.ReadFile(htmlTemplatePath)
	if err != nil {
		log.Printf("Error reading HTML template: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html")

	w.Write(htmlContent)
}

// findFiles scans the given directory for JS and CSS files and returns their paths.
func findFiles(dir string) (jsFile, cssFile string, err error) {
	err = filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		if strings.HasSuffix(path, ".js") {
			jsFile = path
		} else if strings.HasSuffix(path, ".css") {
			cssFile = path
		}

		return nil
	})

	return jsFile, cssFile, err
}

func (app *application) getAndValidateID(w http.ResponseWriter, r *http.Request, idParamName string) (string, bool) {
	params := httprouter.ParamsFromContext(r.Context())
	id := params.ByName(idParamName)

	if !app.idExists(idParamName, id) {
		app.notFoundResponse(w, r)
		return "", false
	}

	return id, true
}

func (app *application) idExists(idType string, id string) bool {
	switch idType {
	case "projectId":
		return app.projects.IDExists(id)
	case "taskId":
		return app.tasks.IDExists(id)
	case "dependencyId":
		return app.buckets.IDExists(id)
	case "bucketId":
		return app.buckets.IDExists(id)
	default:
		return false
	}
}
