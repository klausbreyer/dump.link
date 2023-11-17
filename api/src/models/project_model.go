package models

import (
	"database/sql"
	"fmt"
	"time"
)

type Project struct {
	ID        string
	Name      string
	StartedAt time.Time
	CreatedAt time.Time
	Appetite  int
}

type ProjectModel struct {
	DB *sql.DB
}

func (m *ProjectModel) Insert(name string, startedAt time.Time, createdAt time.Time, appetite int) (string, error) {
	var id string
	for {
		id = NewID()
		if !m.IDExists(id) {
			break
		}
	}
	stmt := `INSERT INTO projects (id, name, startedAt, createdAt, appetite) VALUES (?, ?, ?, ?, ?)`
	_, err := m.DB.Exec(stmt, id, name, startedAt, createdAt, appetite)
	if err != nil {
		return "", err
	}

	return id, nil
}

func (m *ProjectModel) IDExists(id string) bool {
	stmt := `SELECT COUNT(id) FROM projects WHERE id = ?`
	var count int
	err := m.DB.QueryRow(stmt, id).Scan(&count)
	if err != nil {
		// Handle error. For simplicity, return true to indicate an error occurred.
		return true
	}
	return count > 0
}

func (m *ProjectModel) Get(id string) (*Project, error) {
	stmt := `SELECT id, name, startedAt, createdAt, appetite FROM projects WHERE id = ?`
	row := m.DB.QueryRow(stmt, id)

	var (
		startedAtStr, createdAtStr string
		p                          Project
	)

	err := row.Scan(&p.ID, &p.Name, &startedAtStr, &createdAtStr, &p.Appetite)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Project with ID %s not found", id)
		}
		return nil, err
	}

	// Parse the datetime strings
	layout := "2006-01-02 15:04:05" // Adjust the layout to match your datetime format
	p.StartedAt, err = time.Parse(layout, startedAtStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse startedAt: %v", err)
	}
	p.CreatedAt, err = time.Parse(layout, createdAtStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse createdAt: %v", err)
	}

	return &p, nil
}
