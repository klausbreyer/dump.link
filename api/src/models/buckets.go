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
	Priority  int       `json:"priority"`
	UpdatedBy string    `json:"updatedBy"`
}

type BucketModel struct {
	DB *sql.DB
}

func (m *BucketModel) Insert(name string, done bool, dump bool, layer *int, flagged bool, projectID string, priority int) (string, error) {
	var id string
	for {
		id = NewID(projectID)
		if !m.IDExists(id) {
			break
		}
	}
	stmt := `INSERT INTO buckets (id, name, done, dump, layer, flagged, project_id, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := m.DB.Exec(stmt, id, name, done, dump, layer, flagged, projectID, priority)
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

func (m *BucketModel) GetForProjectId(projectId string) ([]*Bucket, error) {
	stmt := `SELECT id, name, done, dump, layer, flagged, project_id, created_at, updated_at, priority, updated_by FROM buckets WHERE project_id = ? ORDER BY priority`
	rows, err := m.DB.Query(stmt, projectId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var buckets []*Bucket
	for rows.Next() {
		var createdAtStr, updatedAtStr string
		b := &Bucket{}

		err = rows.Scan(&b.ID, &b.Name, &b.Done, &b.Dump, &b.Layer, &b.Flagged, &b.ProjectID, &createdAtStr, &updatedAtStr, &b.Priority, &b.UpdatedBy)
		if err != nil {
			return nil, err
		}

		b.CreatedAt, err = time.Parse(DateTimeLayout, createdAtStr)
		if err != nil {
			return nil, fmt.Errorf("failed to parse createdAt: %v", err)
		}

		b.UpdatedAt, err = time.Parse(DateTimeLayout, updatedAtStr)
		if err != nil {
			return nil, fmt.Errorf("failed to parse updatedAt: %v", err)
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

func (m *BucketModel) ResetProjectLayers(projectId string) error {
	query := `UPDATE buckets SET layer = NULL WHERE project_id = ?`
	_, err := m.DB.Exec(query, projectId)
	return err
}

func (m *BucketModel) ResetLayer(bucketId string) error {
	query := `UPDATE buckets SET layer = NULL WHERE id = ?`
	_, err := m.DB.Exec(query, bucketId)
	return err
}
