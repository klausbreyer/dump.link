ALTER TABLE
	`buckets`
ADD
	CONSTRAINT `fk_buckets_projects` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE;

ALTER TABLE
	`tasks`
ADD
	CONSTRAINT `fk_tasks_buckets` FOREIGN KEY (`bucket_id`) REFERENCES `buckets`(`id`) ON DELETE CASCADE;

ALTER TABLE
	`dependencies`
ADD
	CONSTRAINT `fk_dependencies_buckets` FOREIGN KEY (`bucket_id`) REFERENCES `buckets`(`id`) ON DELETE CASCADE;
