CREATE TABLE `Bucket` (
            `id` VARCHAR(11) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `done` BOOLEAN NOT NULL,
            `dump` BOOLEAN NOT NULL,
            `layer` INT,
            `flagged` BOOLEAN NOT NULL,
            `project_id` VARCHAR(11) NOT NULL,
            PRIMARY KEY (`id`)
        );
