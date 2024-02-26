-- Up Migration
START TRANSACTION;

-- Make owner fields nullable
ALTER TABLE
	`projects`
MODIFY
	`owner_email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
MODIFY
	`owner_firstname` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
MODIFY
	`owner_lastname` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL;

-- Add new fields
ALTER TABLE
	`projects`
ADD
	`org_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
ADD
	`user_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL;

-- Add constraint to ensure either new or old fields are filled, but not both
ALTER TABLE
	`projects`
ADD
	CONSTRAINT `chk_owner_or_user` CHECK (
		(
			NOT (
				`owner_email` IS NULL
				AND `owner_firstname` IS NULL
				AND `owner_lastname` IS NULL
			)
			AND `org_id` IS NULL
			AND `user_id` IS NULL
		)
		OR (
			`owner_email` IS NULL
			AND `owner_firstname` IS NULL
			AND `owner_lastname` IS NULL
			AND NOT (
				`org_id` IS NULL
				AND `user_id` IS NULL
			)
		)
	);

COMMIT;
