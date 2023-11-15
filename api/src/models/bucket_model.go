package models

import (
	"database/sql"
	"fmt"
)

type Bucket struct {
	ID        string
	Name      string
	Done      bool
	Dump      bool
	Layer     *int
	Flagged   bool
	ProjectID string
}

type BucketModel struct {
	DB *sql.DB
}

func (m *BucketModel) Insert(name string, done bool, dump bool, layer *int, flagged bool, projectID string) (string, error) {
	stmt := `INSERT INTO Bucket (name, done, dump, layer, flagged, project_id) VALUES (?, ?, ?, ?, ?, ?)`
	res, err := m.DB.Exec(stmt, name, done, dump, layer, flagged, projectID)
	if err != nil {
		return "", err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%d", id), nil
}

func (m *BucketModel) Get(id string) (*Bucket, error) {
	stmt := `SELECT id, name, done, dump, layer, flagged, project_id FROM Bucket WHERE id = ?`
	row := m.DB.QueryRow(stmt, id)

	b := &Bucket{}

	err := row.Scan(&b.ID, &b.Name, &b.Done, &b.Dump, &b.Layer, &b.Flagged, &b.ProjectID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("Bucket with ID %s not found", id)
		}
		return nil, err
	}

	return b, nil
}

func (m *BucketModel) Latest() ([]*Bucket, error) {
	stmt := `SELECT id, name, done, dump, layer, flagged, project_id FROM Bucket ORDER BY id DESC LIMIT 10`
	rows, err := m.DB.Query(stmt)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var buckets []*Bucket

	for rows.Next() {
		b := &Bucket{}
		err = rows.Scan(&b.ID, &b.Name, &b.Done, &b.Dump, &b.Layer, &b.Flagged, &b.ProjectID)
		if err != nil {
			return nil, err
		}
		buckets = append(buckets, b)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return buckets, nil
}
