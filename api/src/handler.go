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

	mdContent, err := fs.ReadFile(app.contentFS, "content/index.md")
	if err != nil {
		log.Printf("Error reading markdown: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	htmlContent := markdownToHTML([]byte(mdContent))
	styledHTML := addTailwindClasses(htmlContent)

	template := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>dump-link.com</title>
<link rel="stylesheet" href="/static/tailwind.css" />
</head>
<body>
<div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
%s
</div>
</body>
</html>
`, string(styledHTML))

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(template))
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
	case "bucketId":
		return app.buckets.IDExists(id)
	default:
		return false
	}
}
