CREATE TABLE `log_subscriptions` (
	`project_id` VARCHAR(11) NOT NULL,
	`count` INT NOT NULL,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
