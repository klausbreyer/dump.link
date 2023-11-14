package src

import (
	"fmt"
	"io/fs"
	"log"
	"net/http"
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

func (s *Server) RootGet(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {

	mdContent, err := fs.ReadFile(s.contentFS, "content/index.md")
	if err != nil {
		log.Printf("Error reading markdown: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	htmlContent := markdown.ToHTML(mdContent, nil, nil)
	htmlTemplate := `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>dump-link.com</title>
<link rel="stylesheet" href="/static/tailwind.css" />
</head>
<body>
{{.Content}}
</body>
</html>
`

	finalHTML := strings.Replace(htmlTemplate, "{{.Content}}", string(htmlContent), 1)

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(finalHTML))
}

func (s *Server) HealthGet(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	fmt.Fprint(w, "healthy")
}
