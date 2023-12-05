CREATE TABLE `log_subscriptions` (
	`project_id` VARCHAR(11) NOT NULL,
	`count` INT NOT NULL,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
