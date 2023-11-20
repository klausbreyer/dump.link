package models

import (
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type Bucket struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Done      bool      `json:"done"`
	Dump      bool      `json:"dump"`
	Layer     *int      `json:"layer"`
	Flagged   bool      `json:"flagged"`
	ProjectID string    `json:"projectId"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type BucketModel struct {
	DB *sql.DB
}

func (m *BucketModel) Insert(name string, done bool, dump bool, layer *int, flagged bool, projectID string) (string, error) {
	var id string
	for {
		id = NewID(projectID)
		if !m.IDExists(id) {
			break
		}
	}
	stmt := `INSERT INTO buckets (id, name, done, dump, layer, flagged, project_id) VALUES (?, ?, ?, ?, ?, ?, ?)`
	_, err := m.DB.Exec(stmt, id, name, done, dump, layer, flagged, projectID)
	if err != nil {
		return "", err
	}

	return id, nil
}

func (m *BucketModel) IDExists(id string) bool {
	stmt := `SELECT COUNT(id) FROM buckets WHERE id = ?`
	var count int
	err := m.DB.QueryRow(stmt, id).Scan(&count)
	if err != nil {
		// Handle error. For simplicity, return true to indicate an error occurred.
		return true
	}
	return count > 0
}

func (m *BucketModel) Get(id string) (*Bucket, error) {
	stmt := `SELECT id, name, done, dump, layer, flagged, project_id FROM buckets WHERE id = ?`
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

func (m *BucketModel) GetForProjectId(projectId string) ([]*Bucket, error) {
	stmt := `SELECT id, name, done, dump, layer, flagged, project_id FROM buckets WHERE project_id = ?`
	rows, err := m.DB.Query(stmt, projectId)
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

func (m *BucketModel) Update(bucketId string, updates map[string]interface{}) error {
	queryParts := []string{}
	args := []interface{}{}

	for key, value := range updates {
		queryParts = append(queryParts, fmt.Sprintf("%s = ?", key))
		args = append(args, value)
	}

	sql := fmt.Sprintf("UPDATE buckets SET %s WHERE id = ?", strings.Join(queryParts, ", "))
	args = append(args, bucketId)

	_, err := m.DB.Exec(sql, args...)
	if err != nil {
		return err
	}

	return nil
}
