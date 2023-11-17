package models

import (
	"database/sql"
)

type BucketDependency struct {
	BucketID          string
	DependsOnBucketID string
}

type BucketDependencyModel struct {
	DB *sql.DB
}

func (m *BucketDependencyModel) Insert(bucketID string, dependsOnBucketID string) error {
	stmt := `INSERT INTO bucket_dependencies (bucket_id, depends_on_bucket_id) VALUES (?, ?)`
	_, err := m.DB.Exec(stmt, bucketID, dependsOnBucketID)
	return err
}

func (m *BucketDependencyModel) Get(bucketID string) ([]string, error) {
	stmt := `SELECT depends_on_bucket_id FROM bucket_dependencies WHERE bucket_id = ?`
	rows, err := m.DB.Query(stmt, bucketID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dependencies []string

	for rows.Next() {
		var dependsOnBucketID string
		err = rows.Scan(&dependsOnBucketID)
		if err != nil {
			return nil, err
		}
		dependencies = append(dependencies, dependsOnBucketID)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return dependencies, nil
}
