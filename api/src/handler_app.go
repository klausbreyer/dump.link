package src

import (
	"fmt"
	"net/http"
	"strings"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

func (app *application) AppGet(w http.ResponseWriter, r *http.Request) {

	pathParts := strings.Split(r.URL.Path, "/")

	if len(pathParts) >= 3 && len(pathParts[2]) == 11 {
		newURL := "/a/p/" + pathParts[2]
		http.Redirect(w, r, newURL, http.StatusMovedPermanently)
		return
	}

	if len(pathParts) >= 2 && pathParts[1] == "a" && len(pathParts[2]) == 0 {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	for i, part := range pathParts {
		if part == "p" && i+1 < len(pathParts) && len(pathParts[i+1]) == 11 {
			projectId := pathParts[i+1]
			project, err := app.projects.Get(projectId)
			if err != nil {

				app.notFoundResponse(w, r)
				return
			}

			title := fmt.Sprintf("dump.link - %s", project.Name)
			app.genericPageResponse(w, r, title)
			return
		}
	}

	var title string
	if len(pathParts) > 2 && pathParts[2] != "" {
		caser := cases.Title(language.English)
		title = caser.String(pathParts[2])
	} else {
		title = "Your App"
	}

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
