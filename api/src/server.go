package src

import (
	"database/sql"
	"embed"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"dump.link/src/models"
	_ "github.com/go-sql-driver/mysql"
)

type Application struct {
	contentFS embed.FS

	errorLog *log.Logger
	infoLog  *log.Logger
	buckets  *models.BucketModel
	tasks    *models.TaskModel
	projects *models.ProjectModel
}

func Run(contentFS embed.FS) error {
	addr := flag.String("addr", "0.0.0.0:8080", "HTTP network address")
	flag.Parse()
	infoLog := log.New(os.Stdout, "INFO\t", log.Ldate|log.Ltime)
	errorLog := log.New(os.Stderr, "ERROR\t", log.Ldate|log.Ltime|log.Lshortfile)

	db, err := openDB()
	if err != nil {
		errorLog.Fatal(err)
	}

	defer db.Close()

	app := &Application{
		contentFS: contentFS,
		errorLog:  errorLog,
		infoLog:   infoLog,

		buckets:  &models.BucketModel{DB: db},
		tasks:    &models.TaskModel{DB: db},
		projects: &models.ProjectModel{DB: db},
	}

	srv := &http.Server{
		Addr:     *addr,
		ErrorLog: errorLog,
		Handler:  app.routes(),
	}

	infoLog.Printf("Starting server on http://%s", *addr)
	err = srv.ListenAndServe()
	errorLog.Fatal(err)

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
