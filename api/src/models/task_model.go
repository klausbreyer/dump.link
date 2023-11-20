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
	Priority  float64   `json:"priority"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type TaskModel struct {
	DB *sql.DB
}

func (m *TaskModel) Insert(id string, title string, closed bool, bucketID string, priority float64, projectId string) (string, error) {
	stmt := `INSERT INTO tasks (id, title, closed, bucket_id, priority) VALUES (?, ?, ?, ?, ?)`
	_, err := m.DB.Exec(stmt, id, title, closed, bucketID, priority)
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
	stmt := `SELECT id, title, closed, bucket_id, priority FROM tasks WHERE id = ?`
	row := m.DB.QueryRow(stmt, id)

	t := &Task{}

	err := row.Scan(&t.ID, &t.Title, &t.Closed, &t.BucketID, &t.Priority)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Task with ID %s not found", id)
		}
		return nil, err
	}

	return t, nil
}

func (m *TaskModel) GetForProjectId(projectId string) ([]*Task, error) {
	stmt := `
	SELECT t.id, t.title, t.closed, t.bucket_id, t.priority, t.created_at, t.updated_at
	FROM tasks AS t
	INNER JOIN buckets AS b ON t.bucket_id = b.id
	WHERE b.project_id = ?
	`
	rows, err := m.DB.Query(stmt, projectId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []*Task
	for rows.Next() {
		var createdAtStr, updatedAtStr string
		t := &Task{}

		err := rows.Scan(&t.ID, &t.Title, &t.Closed, &t.BucketID, &t.Priority, &createdAtStr, &updatedAtStr)
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
