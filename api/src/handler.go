package src

import (
	"io/fs"
	"log"
	"net/http"
	"path/filepath"
	"strings"
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

func (app *application) PrivateGet(w http.ResponseWriter, r *http.Request) {

	sub, orgId, err := app.getAndValidateUserAndOrg(r, "private")
	if err != nil {
		app.unauthorizedResponse(w, r, err)
		return
	}

	data := map[string]string{
		"sub":   sub,
		"orgId": orgId,
	}
	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
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
