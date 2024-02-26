-- Down Migration
START TRANSACTION;

-- Remove constraint
ALTER TABLE
	`projects` DROP CONSTRAINT `chk_owner_or_user`;

-- Remove new fields
ALTER TABLE
	`projects` DROP COLUMN `org_id`,
	DROP COLUMN `user_id`;

-- Revert owner fields to not nullable
ALTER TABLE
	`projects`
MODIFY
	`owner_email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
MODIFY
	`owner_firstname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
MODIFY
	`owner_lastname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL;

COMMIT;
