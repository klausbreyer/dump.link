package src

import (
	"fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (app *application) ProjectRoot(w http.ResponseWriter, r *http.Request) {
	projectId := app.initProject(w, r)

	//redirect
	http.Redirect(w, r, fmt.Sprintf("/a/%s", projectId), http.StatusSeeOther)
}

// AppGet handles the request and serves the HTML with dynamic script and stylesheet links.
func (app *application) ProjectGet(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())
	projectId := params.ByName("projectId")

	if projectId == "" {
		http.Error(w, "Not Found", http.StatusNotFound)
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
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link href="/%s" rel="stylesheet">
	</head>
	<body>
		<div class="flex items-center justify-center w-screen h-screen text-center lg:hidden">
			This site is not optimized for mobile. Please use a desktop browser.
		</div>
		<div id="app" class="hidden lg:block"></div>
		<script src="/%s" type="module"></script>
	</body>
	</html>
	`, cssFile, jsFile)

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(template))
}
