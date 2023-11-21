CREATE TABLE `tasks` (
    `id` VARCHAR(22) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `closed` BOOLEAN NOT NULL,
    `bucket_id` VARCHAR(22) NOT NULL,
    `priority` INT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);
