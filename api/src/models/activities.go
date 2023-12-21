package models

import (
	"database/sql"
	"fmt"
	"time"
)

type Activity struct {
	ProjectID string    `json:"projectId"`
	BucketID  *string   `json:"bucketId,omitempty"`
	TaskID    *string   `json:"taskId,omitempty"`
	CreatedBy string    `json:"createdBy"`
	CreatedAt time.Time `json:"createdAt"`
}

type ActivityModel struct {
	DB *sql.DB
}

func (m *ActivityModel) ReplaceActivity(projectID string, bucketID *string, taskID *string, createdBy string, createdAt time.Time) error {
	if bucketID != nil && taskID != nil {
		return fmt.Errorf("activity can only have a bucketID or a taskID, not both")
	}

	tx, err := m.DB.Begin()
	if err != nil {
		return err
	}

	// Lösche alle existierenden Einträge für die gegebene Projekt-ID und den Benutzernamen
	delStmt := `DELETE FROM activities WHERE project_id = ? AND created_by = ?`
	if _, err := tx.Exec(delStmt, projectID, createdBy); err != nil {
		tx.Rollback()
		return err
	}

	// Füge den neuen Eintrag ein
	insertStmt := `INSERT INTO activities (project_id, bucket_id, task_id, created_by, created_at) VALUES (?, ?, ?, ?, ?)`
	if _, err := tx.Exec(insertStmt, projectID, bucketID, taskID, createdBy, createdAt); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (m *ActivityModel) GetForProjectId(projectID string) ([]*Activity, error) {
	stmt := `SELECT project_id, bucket_id, task_id, created_by, created_at FROM activities WHERE project_id = ?`
	rows, err := m.DB.Query(stmt, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []*Activity
	for rows.Next() {
		a := &Activity{}
		var createdAtStr string

		err = rows.Scan(&a.ProjectID, &a.BucketID, &a.TaskID, &a.CreatedBy, &createdAtStr)
		if err != nil {
			return nil, err
		}

		a.CreatedAt, err = time.Parse(DateTimeLayout, createdAtStr)
		if err != nil {
			return nil, fmt.Errorf("failed to parse createdAt: %v", err)
		}

		activities = append(activities, a)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return activities, nil
}
