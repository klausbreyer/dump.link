package src

func (s *Server) routes() {
	s.router.GET("/", s.RootGet)
	s.router.GET("/health", s.HealthGet)
	s.router.GET("/a", s.AppGet)

	s.router.GET("/static/*filepath", s.StaticHandler)
}
