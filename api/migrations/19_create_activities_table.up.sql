CREATE TABLE activities (
	project_id VARCHAR(11) NOT NULL,
	bucket_id VARCHAR(22),
	task_id VARCHAR(22),
	created_by VARCHAR(255) NOT NULL,
	created_at DATETIME NOT NULL,
	CONSTRAINT fk_activities_projects FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE = InnoDB CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
