CREATE TABLE `Project` (
            `id` VARCHAR(11) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `startedAt` DATETIME NOT NULL,
            `createdAt` DATETIME NOT NULL,
            `appetite` INT NOT NULL,
            PRIMARY KEY (`id`)
        );
