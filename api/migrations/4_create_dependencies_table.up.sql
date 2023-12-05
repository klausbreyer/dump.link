CREATE TABLE `dependencies` (
    `bucket_id` VARCHAR(22) NOT NULL,
    `dependency_id` VARCHAR(22) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
