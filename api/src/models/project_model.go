package models

import (
	"database/sql"
	"fmt"
	"time"
)

type Project struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	StartedAt time.Time `json:"startedAt"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Appetite  int       `json:"appetite"`
}

type ProjectModel struct {
	DB *sql.DB
}

func (m *ProjectModel) Insert(name string, started_at time.Time, appetite int) (string, error) {
	var id string
	for {
		id = NewID()
		if !m.IDExists(id) {
			break
		}
	}
	stmt := `INSERT INTO projects (id, name, started_at, appetite) VALUES (?, ?, ?, ?)`
	_, err := m.DB.Exec(stmt, id, name, started_at, appetite)
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
	stmt := `SELECT id, name, started_at, created_at, updated_at, appetite FROM projects WHERE id = ?`
	row := m.DB.QueryRow(stmt, id)

	var (
		started_atStr, created_atStr, updated_atStr string
		p                                           Project
	)

	err := row.Scan(&p.ID, &p.Name, &started_atStr, &created_atStr, &updated_atStr, &p.Appetite)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Project with ID %s not found", id)
		}
		return nil, err
	}

	// Parse the datetime strings
	p.StartedAt, err = time.Parse(DateLayout, started_atStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse started_at: %v", err)
	}
	p.CreatedAt, err = time.Parse(DateTimeLayout, created_atStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse createdAt: %v", err)
	}

	p.UpdatedAt, err = time.Parse(DateTimeLayout, updated_atStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse updatedAt: %v", err)
	}

	return &p, nil
}
