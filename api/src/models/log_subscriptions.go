package models

import (
	"database/sql"
	"time"
)

// LogSubscription represents the structure of the `log_subscriptions` table.
type LogSubscription struct {
	ProjectID string    `json:"project_id"`
	Count     int       `json:"count"`
	CreatedAt time.Time `json:"created_at"`
	CreatedBy string    `json:"created_by"`
}

// LogSubscriptionModel provides the methods to interact with the `log_subscriptions` table.
type LogSubscriptionModel struct {
	DB *sql.DB
}

// Insert creates a new log subscription record.
func (m *LogSubscriptionModel) Insert(projectID string, count int, createdBy string) error {
	createdBy = ToMD5Hash(createdBy)
	stmt := `INSERT INTO log_subscriptions (project_id, count, created_at, created_by) VALUES (?, ?, CURRENT_TIMESTAMP, ?)`
	_, err := m.DB.Exec(stmt, projectID, count, createdBy)
	if err != nil {
		return err
	}

	return nil
}
