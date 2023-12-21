package models

import (
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type Task struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Closed    bool      `json:"closed"`
	BucketID  string    `json:"bucketId"`
	Priority  int       `json:"priority"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	UpdatedBy string    `json:"updatedBy"`
}

type TaskModel struct {
	DB *sql.DB
}

func (m *TaskModel) Insert(id string, title string, closed bool, bucketID string, priority int, projectId string, updatedBy string) (string, error) {
	stmt := `INSERT INTO tasks (id, title, closed, bucket_id, priority, updated_by) VALUES (?, ?, ?, ?, ?, ?)`
	_, err := m.DB.Exec(stmt, id, title, closed, bucketID, priority, updatedBy)
	if err != nil {
		return "", err
	}

	return id, nil
}

func (m *TaskModel) IDExists(id string) bool {
	stmt := `SELECT COUNT(id) FROM tasks WHERE id = ?`
	var count int
	err := m.DB.QueryRow(stmt, id).Scan(&count)
	if err != nil {
		// Handle error. For simplicity, return true to indicate an error occurred.
		return true
	}
	return count > 0
}

func (m *TaskModel) Get(id string) (*Task, error) {
	stmt := `SELECT id, title, closed, bucket_id, priority, created_at, updated_at, updated_by FROM tasks WHERE id = ?`
	row := m.DB.QueryRow(stmt, id)

	t := &Task{}
	var createdAtStr, updatedAtStr string

	err := row.Scan(&t.ID, &t.Title, &t.Closed, &t.BucketID, &t.Priority, &createdAtStr, &updatedAtStr, &t.UpdatedBy)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Task with ID %s not found", id)
		}
		return nil, err
	}

	t.CreatedAt, err = time.Parse(DateTimeLayout, createdAtStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse createdAt: %v", err)
	}

	t.UpdatedAt, err = time.Parse(DateTimeLayout, updatedAtStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse updatedAt: %v", err)
	}

	return t, nil
}

func (m *TaskModel) GetForProjectId(projectId string) ([]*Task, error) {
	stmt := `SELECT t.id, t.title, t.closed, t.bucket_id, t.priority, t.created_at, t.updated_at, t.updated_by
		FROM tasks AS t
		WHERE t.bucket_id IN (
			SELECT b.id
			FROM buckets AS b
			WHERE b.project_id = ?)`

	rows, err := m.DB.Query(stmt, projectId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []*Task
	for rows.Next() {
		var createdAtStr, updatedAtStr string
		t := &Task{}

		err := rows.Scan(&t.ID, &t.Title, &t.Closed, &t.BucketID, &t.Priority, &createdAtStr, &updatedAtStr, &t.UpdatedBy)
		if err != nil {
			return nil, err
		}

		t.CreatedAt, err = time.Parse(DateTimeLayout, createdAtStr)
		if err != nil {
			return nil, fmt.Errorf("failed to parse createdAt: %v", err)
		}

		t.UpdatedAt, err = time.Parse(DateTimeLayout, updatedAtStr)
		if err != nil {
			return nil, fmt.Errorf("failed to parse updatedAt: %v", err)
		}

		tasks = append(tasks, t)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tasks, nil
}

func (m *TaskModel) Delete(taskId string) error {
	stmt := `DELETE FROM tasks WHERE id = ?`

	_, err := m.DB.Exec(stmt, taskId)
	if err != nil {
		return err
	}

	return nil
}

func (m *TaskModel) Update(taskId string, updates map[string]interface{}) error {
	// Build the SQL query dynamically based on the updates map
	queryParts := []string{}
	args := []interface{}{}

	for key, value := range updates {
		queryParts = append(queryParts, fmt.Sprintf("%s = ?", key))
		args = append(args, value)
	}

	sql := fmt.Sprintf("UPDATE tasks SET %s WHERE id = ?", strings.Join(queryParts, ", "))
	args = append(args, taskId)

	_, err := m.DB.Exec(sql, args...)
	if err != nil {
		return err
	}

	return nil
}
