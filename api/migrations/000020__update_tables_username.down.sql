ALTER TABLE
	`projects` DROP COLUMN updated_by;

ALTER TABLE
	`buckets` DROP COLUMN updated_by;

ALTER TABLE
	`dependencies` DROP COLUMN created_by;

ALTER TABLE
	`tasks` DROP COLUMN updated_by;

ALTER TABLE
	`log_actions` DROP COLUMN created_by;

ALTER TABLE
	`log_subscriptions` DROP COLUMN created_by;
