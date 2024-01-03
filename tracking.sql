-- Projects created (excluding ours)
SELECT
	COUNT(*) AS project_count
FROM
	projects
WHERE
	LENGTH(owner_email) > 0
	AND owner_email NOT IN (
		'kb@v01.io',
		'm@me.com',
		'matt@dump.link',
		'matt@dump.link.com',
		'mattlane66@me.com'
	);

-- Unique E-Mails that created projects (excluding ours)
SELECT
	COUNT(DISTINCT owner_email) AS unique_email_count
FROM
	projects
WHERE
	LENGTH(owner_email) > 0
	AND owner_email NOT IN (
		'kb@v01.io',
		'm@me.com',
		'matt@dump.link',
		'matt@dump.link.com',
		'mattlane66@me.com'
	);

-- Visits
SELECT
	COUNT(*)
FROM
	(
		SELECT
			project_id
		FROM
			log_actions
		WHERE
			project_id IN (
				SELECT
					id
				FROM
					projects
				WHERE
					LENGTH(owner_email) > 0
					AND owner_email NOT IN (
						'kb@v01.io',
						'm@me.com',
						'matt@dump.link',
						'matt@dump.link.com',
						'mattlane66@me.com'
					)
			)
		GROUP BY
			project_id
		HAVING
			COUNT(DISTINCT DATE(created_at)) > 4
	) AS subquery;

-- ACtivity
SELECT
	COUNT(*)
FROM
	(
		SELECT
			project_id
		FROM
			log_actions
		WHERE
			project_id IN (
				SELECT
					id
				FROM
					projects
				WHERE
					LENGTH(owner_email) > 0
					AND owner_email NOT IN (
						'kb@v01.io',
						'm@me.com',
						'matt@dump.link',
						'matt@dump.link.com',
						'mattlane66@me.com'
					)
			)
			AND action != 'SET_INITIAL_STATE'
		GROUP BY
			project_id
		HAVING
			COUNT(DISTINCT DATE(created_at)) > 4
	) AS subquery;

-- Projects with more than 1/2/5 subscribers at the same time
SELECT
	COUNT(DISTINCT project_id)
FROM
	log_subscriptions
WHERE
	count > 1
	AND project_id IN (
		SELECT
			id
		FROM
			projects
		WHERE
			LENGTH(owner_email) > 0
			AND owner_email NOT IN (
				'kb@v01.io',
				'm@me.com',
				'matt@dump.link',
				'matt@dump.link.com',
				'mattlane66@me.com'
			)
	);
