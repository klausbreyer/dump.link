ALTER TABLE
	`projects`
ADD
	`owner_email` VARCHAR(255) NOT NULL DEFAULT '',
ADD
	`owner_firstname` VARCHAR(255) NOT NULL DEFAULT '',
ADD
	`owner_lastname` VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE
	`projects`
MODIFY
	`owner_email` VARCHAR(255) NOT NULL,
MODIFY
	`owner_firstname` VARCHAR(255) NOT NULL,
MODIFY
	`owner_lastname` VARCHAR(255) NOT NULL;
