package models

import (
	"database/sql"
	"fmt"
	"time"
)

type Project struct {
	ID       string
	Name     string
	StartAt  time.Time
	Appetite int
}

type ProjectModel struct {
	DB *sql.DB
}

func (m *ProjectModel) Insert(name string, startAt time.Time, appetite int) (string, error) {
	stmt := `INSERT INTO Project (name, startAt, appetite) VALUES (?, ?, ?)`
	res, err := m.DB.Exec(stmt, name, startAt, appetite)
	if err != nil {
		return "", err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%d", id), nil
}

func (m *ProjectModel) Get(id string) (*Project, error) {
	stmt := `SELECT id, name, startAt, appetite FROM Project WHERE id = ?`
	row := m.DB.QueryRow(stmt, id)

	p := &Project{}

	err := row.Scan(&p.ID, &p.Name, &p.StartAt, &p.Appetite)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Project with ID %s not found", id)
		}
		return nil, err
	}

	return p, nil
}
