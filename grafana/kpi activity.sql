SELECT
	subquery.month,
	SUM(subquery.activity_on_days_2_plus) AS activity_on_days_2_plus,
	SUM(subquery.activity_on_days_3_plus) AS activity_on_days_3_plus,
	SUM(subquery.activity_on_days_5_plus) AS activity_on_days_5_plus
FROM
	(
		SELECT
			project_id,
			DATE_FORMAT(created_at, '%Y-%m') AS month,
			CASE
				WHEN COUNT(DISTINCT DATE(created_at)) > 1 THEN 1
				ELSE 0
			END AS activity_on_days_2_plus,
			CASE
				WHEN COUNT(DISTINCT DATE(created_at)) > 2 THEN 1
				ELSE 0
			END AS activity_on_days_3_plus,
			CASE
				WHEN COUNT(DISTINCT DATE(created_at)) > 4 THEN 1
				ELSE 0
			END AS activity_on_days_5_plus
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
			project_id,
			month
	) AS subquery
GROUP BY
	month;
