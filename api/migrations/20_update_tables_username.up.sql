ALTER TABLE
	`projects`
ADD
	updated_by VARCHAR(255) NOT NULL DEFAULT "";

ALTER TABLE
	`buckets`
ADD
	updated_by VARCHAR(255) NOT NULL DEFAULT "";

ALTER TABLE
	`dependencies`
ADD
	created_by VARCHAR(255) NOT NULL DEFAULT "";

ALTER TABLE
	`tasks`
ADD
	updated_by VARCHAR(255) NOT NULL DEFAULT "";

ALTER TABLE
	`log_actions`
ADD
	created_by VARCHAR(32) NOT NULL DEFAULT "";

ALTER TABLE
	`log_subscriptions`
ADD
	created_by VARCHAR(32) NOT NULL DEFAULT "";
