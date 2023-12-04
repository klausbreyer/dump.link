CREATE TABLE `log_actions` (
	`project_id` VARCHAR(11) NOT NULL,
	`bucket_id` VARCHAR(22) NULL,
	`task_id` VARCHAR(22) NULL,
	`action` VARCHAR(255) NOT NULL,
	/* in ms */
	`duration` INT NOT NULL,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
