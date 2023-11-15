CREATE TABLE `Project` (
            `id` VARCHAR(11) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `startAt` DATETIME NOT NULL,
            `appetite` INT NOT NULL,
            PRIMARY KEY (`id`)
        );