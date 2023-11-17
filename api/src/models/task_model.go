package models

import (
	"database/sql"
	"fmt"
)

type Task struct {
	ID       string  `json:"id"`
	Title    string  `json:"title"`
	Closed   bool    `json:"closed"`
	BucketID string  `json:"bucketId"`
	Priority float64 `json:"priority"`
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
	SELECT t.id, t.title, t.closed, t.bucket_id, t.priority
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
		var t Task
		err := rows.Scan(&t.ID, &t.Title, &t.Closed, &t.BucketID, &t.Priority)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, &t)
	}

	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tasks, nil
}
