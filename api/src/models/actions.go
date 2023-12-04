package models

import (
	"database/sql"
	"time"
)

type Action struct {
	ProjectID string    `json:"project_id"`
	BucketID  *string   `json:"bucket_id,omitempty"` // Pointer to handle NULL values
	TaskID    *string   `json:"task_id,omitempty"`   // Pointer to handle NULL values
	Action    string    `json:"action"`
	Duration  int       `json:"duration"`
	CreatedAt time.Time `json:"created_at"`
}

type ActionModel struct {
	DB *sql.DB
}

func (m *ActionModel) Insert(projectID string, bucketID, taskID *string, action string, duration int) error {
	stmt := `INSERT INTO actions (project_id, bucket_id, task_id, action, duration, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
	_, err := m.DB.Exec(stmt, projectID, bucketID, taskID, action, duration)
	if err != nil {
		return err
	}

	return nil
}

func (m *ActionModel) Log(projectID string, bucketID, taskID *string, startTime time.Time, action string) error {
	duration := int(time.Since(startTime).Milliseconds())
	stmt := `INSERT INTO actions (project_id, bucket_id, task_id, action, duration, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
	_, err := m.DB.Exec(stmt, projectID, bucketID, taskID, action, duration)
	if err != nil {
		return err
	}

	return nil
}
