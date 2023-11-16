CREATE TABLE `Task` (
            `id` VARCHAR(11) NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `closed` BOOLEAN NOT NULL,
            `bucket_id` VARCHAR(11) NOT NULL,
            `priority` FLOAT NOT NULL
            PRIMARY KEY (`id`)
        );
