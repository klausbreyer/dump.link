package models

import (
	"database/sql"
	"fmt"
	"time"
)

type Dependency struct {
	BucketID     string    `json:"bucketId"`
	DependencyId string    `json:"dependencyId"`
	CreatedAt    time.Time `json:"createdAt"`
}

type DependencyModel struct {
	DB *sql.DB
}

func (m *DependencyModel) Insert(bucketID string, dependencyId string) error {
	stmt := `INSERT INTO dependencies (bucket_id, dependency_id) VALUES (?, ?)`
	_, err := m.DB.Exec(stmt, bucketID, dependencyId)
	return err
}

func (m *DependencyModel) Exists(bucketID, dependencyID string) (bool, error) {
	var exists bool
	stmt := `SELECT EXISTS(SELECT 1 FROM dependencies WHERE bucket_id = ? AND dependency_id = ?)`
	err := m.DB.QueryRow(stmt, bucketID, dependencyID).Scan(&exists)
	return exists, err
}

func (m *DependencyModel) GetForProjectId(projectId string) ([]*Dependency, error) {
	stmt := `SELECT bd.bucket_id, bd.dependency_id, bd.created_at
         FROM dependencies bd
         WHERE bd.bucket_id IN (
             SELECT b.id
             FROM buckets b
             WHERE b.project_id = ?)`

	rows, err := m.DB.Query(stmt, projectId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dependencies []*Dependency

	for rows.Next() {
		var createdAtStr string
		bd := &Dependency{}

		err = rows.Scan(&bd.BucketID, &bd.DependencyId, &createdAtStr)
		if err != nil {
			return nil, err
		}

		bd.CreatedAt, err = time.Parse(DateTimeLayout, createdAtStr)
		if err != nil {
			return nil, fmt.Errorf("failed to parse createdAt: %v", err)
		}

		dependencies = append(dependencies, bd)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return dependencies, nil
}

func (m *DependencyModel) Delete(bucketID string, dependsOnBucketID string) (int64, error) {
	stmt := `DELETE FROM dependencies WHERE bucket_id = ? AND dependency_id = ?`
	result, err := m.DB.Exec(stmt, bucketID, dependsOnBucketID)
	if err != nil {
		return 0, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, err
	}

	return rowsAffected, nil
}
