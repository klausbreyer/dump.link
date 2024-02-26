package models

import (
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type Project struct {
	ID        string     `json:"id"`
	Name      string     `json:"name"`
	StartedAt time.Time  `json:"startedAt"`
	EndingAt  *time.Time `json:"endingAt"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	Appetite  int        `json:"appetite"`
	Archived  bool       `json:"archived"`
	UpdatedBy string     `json:"updatedBy"`
	// OwnerEmail    string    `json:"ownerEmail"`    // never read. Only ingested.
	// OwnerFirstName string   `json:"ownerFirstName"` // never read. Only ingested.
	// OwnerLastName string    `json:"ownerLastName"`  // never read. Only ingested.
}

type ProjectModel struct {
	DB *sql.DB
}

func (m *ProjectModel) GetNewID() string {
	var id string
	for {
		id = NewID()
		if !m.IDExists(id) {
			break
		}
	}
	return id
}

func (m *ProjectModel) InsertAnonymous(id string, name string, appetite int, ownerEmail, ownerFirstName, ownerLastName, userId string) error {
	startedAt := time.Now()
	stmt := `INSERT INTO projects (id, name, started_at, appetite, owner_email, owner_firstname, owner_lastname, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := m.DB.Exec(stmt, id, name, startedAt, appetite, ownerEmail, ownerFirstName, ownerLastName, userId)
	if err != nil {
		return err
	}

	return nil
}

func (m *ProjectModel) InsertRegistered(id string, name string, appetite int, userId, orgId string) error {
	startedAt := time.Now()
	stmt := `INSERT INTO projects (id, name, started_at, appetite, created_by, org_id) VALUES (?, ?, ?, ?, ?, ?)`
	_, err := m.DB.Exec(stmt, id, name, startedAt, appetite, userId, orgId)
	if err != nil {
		return err
	}

	return nil
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
	stmt := `SELECT id, name, started_at, created_at, ending_at, updated_at, appetite, archived, updated_by FROM projects WHERE id = ?`
	row := m.DB.QueryRow(stmt, id)

	var (
		startedAtStr, createdAtStr, updatedAtStr string
		endingAt                                 sql.NullString // Use sql.NullString for nullable endingAt field
		p                                        Project
	)

	err := row.Scan(&p.ID, &p.Name, &startedAtStr, &createdAtStr, &endingAt, &updatedAtStr, &p.Appetite, &p.Archived, &p.UpdatedBy)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Project with ID %s not found", id)
		}
		return nil, err
	}

	// Parse the non-nullable datetime strings
	p.StartedAt, err = time.Parse(DateLayout, startedAtStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse startedAt: %v", err)
	}

	p.CreatedAt, err = time.Parse(DateTimeLayout, createdAtStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse createdAt: %v", err)
	}

	p.UpdatedAt, err = time.Parse(DateTimeLayout, updatedAtStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse updatedAt: %v", err)
	}

	// Handle nullable endingAt
	if endingAt.Valid {
		var endingAtTime time.Time
		endingAtTime, err = time.Parse(DateLayout, endingAt.String)
		if err != nil {
			return nil, fmt.Errorf("failed to parse endingAt: %v", err)
		}
		p.EndingAt = &endingAtTime
	} else {
		p.EndingAt = nil
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
