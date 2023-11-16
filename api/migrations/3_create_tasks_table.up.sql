CREATE TABLE `Task` (
            `id` VARCHAR(22) NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `closed` BOOLEAN NOT NULL,
            `bucket_id` VARCHAR(22) NOT NULL,
            `priority` FLOAT NOT NULL,
            PRIMARY KEY (`id`)
        );
