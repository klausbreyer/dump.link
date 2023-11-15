package src

import "net/http"

func (app *Application) routes() *http.ServeMux {
	mux := http.NewServeMux()

	fileServer := http.FileServer(http.Dir("./static/"))
	mux.Handle("/static/", http.StripPrefix("/static", fileServer))

	mux.HandleFunc("/", app.RootGet)
	mux.HandleFunc("/health/", app.HealthGet)
	mux.HandleFunc("/a/", app.AppGet)

	return mux
}
