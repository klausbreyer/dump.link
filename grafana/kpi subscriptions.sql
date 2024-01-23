SELECT
	DATE_FORMAT(l.created_at, '%Y-%m') AS month,
	COUNT(
		DISTINCT CASE
			WHEN l.count > 1 THEN l.project_id
			ELSE NULL
		END
	) AS per_project_users_online_in_parallel_2plus,
	COUNT(
		DISTINCT CASE
			WHEN l.count > 2 THEN l.project_id
			ELSE NULL
		END
	) AS per_project_users_online_in_parallel_3plus,
	COUNT(
		DISTINCT CASE
			WHEN l.count > 4 THEN l.project_id
			ELSE NULL
		END
	) AS per_project_users_online_in_parallel_5plus,
	COUNT(
		DISTINCT CASE
			WHEN l.count > 9 THEN l.project_id
			ELSE NULL
		END
	) AS per_project_users_online_in_parallel_10plus
FROM
	log_subscriptions l
	INNER JOIN projects p ON l.project_id = p.id
WHERE
	LENGTH(p.owner_email) > 0
	AND p.owner_email NOT IN (
		'kb@v01.io',
		'm@me.com',
		'matt@dump.link',
		'matt@dump.link.com',
		'mattlane66@me.com'
	)
GROUP BY
	DATE_FORMAT(l.created_at, '%Y-%m');
