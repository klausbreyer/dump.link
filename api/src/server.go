package src

import (
	"embed"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/julienschmidt/httprouter"
)

type Server struct {
	router     *httprouter.Router
	httpServer *http.Server
	contentFS  embed.FS
}

func Run(contentFS embed.FS) error {
	log.Println("starting server...")

	// Determine port for HTTP service.
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server running on: http://%s:%s\n", "localhost", port)

	server := newServer(contentFS)
	if server == nil {
		return fmt.Errorf("error creating new server")
	}

	if err := server.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("ListenAndServe: %+v", err)
	}

	return nil
}
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func newServer(contentFS embed.FS) *Server {
	router := httprouter.New()
	s := &Server{
		httpServer: &http.Server{
			Handler: router,
			Addr:    ":8080", // oder ein anderer Port
		},
		contentFS: contentFS,
		router:    router,
	}
	s.routes()
	return s
}
