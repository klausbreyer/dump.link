UPDATE
	projects
SET
	updated_by = CONCAT(
		'dumplink|',
		id,
		'_',
		REPLACE(updated_by, ' ', '%20')
	);

UPDATE
	buckets
SET
	updated_by = CONCAT(
		'dumplink|',
		project_id,
		'_',
		REPLACE(updated_by, ' ', '%20')
	);

UPDATE
	tasks
	INNER JOIN buckets ON tasks.bucket_id = buckets.id
SET
	tasks.updated_by = CONCAT(
		'dumplink|',
		buckets.project_id,
		'_',
		REPLACE(tasks.updated_by, ' ', '%20')
	);

UPDATE
	activities
SET
	created_by = CONCAT(
		'dumplink|',
		project_id,
		'_',
		REPLACE(created_by, ' ', '%20')
	);
