ALTER TABLE
	`buckets` DROP FOREIGN KEY `fk_buckets_projects`;

ALTER TABLE
	`tasks` DROP FOREIGN KEY `fk_tasks_buckets`;

ALTER TABLE
	`dependencies` DROP FOREIGN KEY `fk_dependencies_buckets`;
