package src

import "net/http"

func (app *application) routes() *http.ServeMux {
	mux := http.NewServeMux()

	fileServer := http.FileServer(http.Dir("./static/"))
	mux.Handle("/static/", corsMiddleware(http.StripPrefix("/static", fileServer)))

	mux.Handle("/", corsMiddleware(http.HandlerFunc(app.RootGet)))
	mux.Handle("/health/", corsMiddleware(http.HandlerFunc(app.HealthGet)))
	mux.Handle("/a/", corsMiddleware(http.HandlerFunc(app.AppGet)))

	return mux
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		enableCors(w, r)
		if r.Method == "OPTIONS" {
			return // Handle preflight requests
		}
		next.ServeHTTP(w, r)
	})
}

func enableCors(w http.ResponseWriter, r *http.Request) {
	allowedOrigins := []string{"http://localhost:1234", "https://beta.dump-link.com"}

	origin := r.Header.Get("Origin")
	for _, allowedOrigin := range allowedOrigins {
		if origin == allowedOrigin {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
			break
		}
	}
}
