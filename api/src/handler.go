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

func (app *application) PrivateGet(w http.ResponseWriter, r *http.Request) {
	data := map[string]string{
		"status": "private access",
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

// AppGet handles the request and serves the HTML with dynamic script and stylesheet links.
func (app *application) ProjectGet(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())
	projectId := params.ByName("projectId")

	if projectId == "dashboard" {
		app.genericPageResponse(w, r, "dump.link - Dashboard")
		return
	}
	if projectId == "callback" {
		app.genericPageResponse(w, r, "dump.link - Callback")
		return
	}

	project, err := app.projects.Get(projectId)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	title := fmt.Sprintf("dump.link - %s", project.Name)
	app.genericPageResponse(w, r, title)
}

func (app *application) genericPageResponse(w http.ResponseWriter, r *http.Request, title string) {
	jsFile, cssFile, err := findFiles("static/app/")
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	template := `
		<!DOCTYPE html>
		<html>
		<head>
			<link rel="icon" type="image/svg+xml" href="/static/icons/favicon.svg" />
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link href="/{CSS_FILE}" rel="stylesheet">

			<title>dump.link - {TITLE}</title>
			<meta name="description" content="Streamlining communication and task management for business and technical teams.">
			<meta property="og:title" content="{TITLE}">
			<meta property="og:image" content="https://dump.link/static/icons/favicon@2x.png">
			<meta property="og:description" content="Streamlining communication and task management for business and technical teams.">
			<meta name="twitter:title" content="{TITLE}">
			<meta name="twitter:description" content="Streamlining communication and task management for business and technical teams.">
			<meta name="twitter:image" content="https://dump.link/static/icons/favicon@2x.png">
		</head>
		<body>
			<div class="z-50 ">
		<p class=" bg-rose-600 px-6 py-2.5 sm:px-3.5 text-sm leading-6 text-center text-white">

			<strong class="font-semibold">dumplink is shutting down!</strong>

			Your started dumplinks will be available until 2024-05-31. Thank you for your support!
			<a href="/#shutdown" class="underline hover:no-underline" target="_blank">Read more</a>
		</p>
	</div>

			<div id="app"></div>
			<script src="/{JS_FILE}" type="module"></script>
		</body>
		</html>
	`
	template = strings.Replace(template, "{TITLE}", title, -1)
	template = strings.Replace(template, "{CSS_FILE}", cssFile, -1)
	template = strings.Replace(template, "{JS_FILE}", jsFile, -1)
	template = strings.Trim(template, " \n\t")

	w.Header().Set("Content-Security-Policy", "frame-ancestors *")
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(template))
}
