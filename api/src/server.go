package src

import (
	"database/sql"
	"embed"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"sync"

	"dump.link/src/models"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/websocket"
)

type wsClient struct {
	conn        *websocket.Conn
	projectId   string
	clientToken string
}
type application struct {
	contentFS embed.FS

	logger       *slog.Logger
	buckets      *models.BucketModel
	tasks        *models.TaskModel
	projects     *models.ProjectModel
	dependencies *models.DependencyModel

	clients map[string]map[*wsClient]bool // Map projectId to Clients
	mutex   sync.Mutex
}

func Run(contentFS embed.FS) error {
	addr := flag.String("addr", "0.0.0.0:8080", "HTTP network address")
	flag.Parse()
	// Use the slog.New() function to initialize a new structured logger, which
	// writes to the standard out stream and uses the default settings.
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	db, err := openDB()
	if err != nil {
		logger.Error(err.Error())
	}

	defer db.Close()

	app := &application{
		contentFS: contentFS,
		logger:    logger,

		buckets:      &models.BucketModel{DB: db},
		tasks:        &models.TaskModel{DB: db},
		projects:     &models.ProjectModel{DB: db},
		dependencies: &models.DependencyModel{DB: db},

		clients: make(map[string]map[*wsClient]bool),
	}

	logger.Info(fmt.Sprintf("starting server at http://%s", *addr))
	err = http.ListenAndServe(*addr, app.routes())
	logger.Error(err.Error())
	os.Exit(1)
	return nil
}

// The openDB() function wraps sql.Open() and returns a sql.DB connection pool
// for a given DSN.
func openDB() (*sql.DB, error) {
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")
	dbTls := os.Getenv("DB_TLS")

	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?tls=%s&interpolateParams=true", user, password, dbHost, dbName, dbTls)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	if err = db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}
