package src

import (
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/julienschmidt/httprouter"
)

func (s *Server) StaticHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	http.ServeFile(w, r, r.URL.Path[1:])
}

func (s *Server) handleError(w http.ResponseWriter, r *http.Request, err error) {
	id := GenerateUUID()
	fmt.Println("Error ID: ", id)
	fmt.Println("Error: ", err)
	fmt.Println("Request: ", r)
	http.Error(w, fmt.Sprintf("Error: %s", id), http.StatusInternalServerError)
}

func (s *Server) HealthGet(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	fmt.Fprint(w, "healthy")
}

func (s *Server) RootGet(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {

	mdContent, err := fs.ReadFile(s.contentFS, "content/index.md")
	if err != nil {
		log.Printf("Error reading markdown: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	htmlContent := markdown.ToHTML(mdContent, nil, nil)

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
%s
</body>
</html>
`, string(htmlContent))

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(template))
}

// AppGet handles the request and serves the HTML with dynamic script and stylesheet links.
func (s *Server) AppGet(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
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
