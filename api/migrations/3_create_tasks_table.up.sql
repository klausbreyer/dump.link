CREATE TABLE `Task` (
            `id` VARCHAR(11) NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `closed` BOOLEAN NOT NULL,
            `bucket_id` VARCHAR(11) NOT NULL,
            PRIMARY KEY (`id`),
            FOREIGN KEY (`bucket_id`) REFERENCES `Bucket` (`id`)
        );