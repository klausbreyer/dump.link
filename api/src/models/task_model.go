package models

import (
	"database/sql"
	"fmt"
)

type Task struct {
	ID       string
	Title    string
	Closed   bool
	BucketID string
	Priority float64
}

type TaskModel struct {
	DB *sql.DB
}

func (m *TaskModel) Insert(title string, closed bool, bucketID string, priority float64) (string, error) {
	stmt := `INSERT INTO Task (title, closed, bucket_id, priority) VALUES (?, ?, ?, ?)`
	res, err := m.DB.Exec(stmt, title, closed, bucketID, priority)
	if err != nil {
		return "", err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%d", id), nil
}

func (m *TaskModel) Get(id string) (*Task, error) {
	stmt := `SELECT id, title, closed, bucket_id, priority FROM Task WHERE id = ?`
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
