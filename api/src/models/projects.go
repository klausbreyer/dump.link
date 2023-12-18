package models

import (
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type Project struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	StartedAt time.Time `json:"startedAt"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Appetite  int       `json:"appetite"`
	Archived  bool      `json:"archived"`
	// OwnerEmail    string    `json:"ownerEmail"`    // never read. Only ingested.
	// OwnerFirstName string   `json:"ownerFirstName"` // never read. Only ingested.
	// OwnerLastName string    `json:"ownerLastName"`  // never read. Only ingested.
}

type ProjectModel struct {
	DB *sql.DB
}

func (m *ProjectModel) Insert(name string, startedAt time.Time, appetite int, ownerEmail, ownerFirstName, ownerLastName string) (string, error) {
	var id string
	for {
		id = NewID()
		if !m.IDExists(id) {
			break
		}
	}
	stmt := `INSERT INTO projects (id, name, started_at, appetite, owner_email, owner_firstname, owner_lastname) VALUES (?, ?, ?, ?, ?, ?, ?)`
	_, err := m.DB.Exec(stmt, id, name, startedAt, appetite, ownerEmail, ownerFirstName, ownerLastName)
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
	stmt := `SELECT id, name, started_at, created_at, updated_at, appetite, archived FROM projects WHERE id = ?`
	row := m.DB.QueryRow(stmt, id)

	var (
		started_atStr, created_atStr, updated_atStr string
		p                                           Project
	)

	err := row.Scan(&p.ID, &p.Name, &started_atStr, &created_atStr, &updated_atStr, &p.Appetite, &p.Archived)
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

func (m *ProjectModel) Update(projectId string, updates map[string]interface{}) error {
	queryParts := []string{}
	args := []interface{}{}

	for key, value := range updates {
		queryParts = append(queryParts, fmt.Sprintf("%s = ?", key))
		args = append(args, value)
	}

	sql := fmt.Sprintf("UPDATE projects SET %s WHERE id = ?", strings.Join(queryParts, ", "))
	args = append(args, projectId)

	_, err := m.DB.Exec(sql, args...)
	if err != nil {
		return err
	}

	return nil
}

func (m *ProjectModel) Delete(id string) error {
	stmt := `DELETE FROM projects WHERE id = ?`
	result, err := m.DB.Exec(stmt, id)
	if err != nil {
		return fmt.Errorf("error deleting project: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no project found with ID %s", id)
	}

	return nil
}
