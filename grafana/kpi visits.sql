SELECT
	subquery.month,
	SUM(subquery.visits_on_days_2_plus) AS visits_on_days_2_plus,
	SUM(subquery.visits_on_days_3_plus) AS visits_on_days_3_plus,
	SUM(subquery.visits_on_days_5_plus) AS visits_on_days_5_plus,
	SUM(subquery.visits_on_days_10_plus) AS visits_on_days_10_plus
FROM
	(
		SELECT
			project_id,
			DATE_FORMAT(created_at, '%Y-%m') AS month,
			CASE
				WHEN COUNT(DISTINCT DATE(created_at)) > 1 THEN 1
				ELSE 0
			END AS visits_on_days_2_plus,
			CASE
				WHEN COUNT(DISTINCT DATE(created_at)) > 2 THEN 1
				ELSE 0
			END AS visits_on_days_3_plus,
			CASE
				WHEN COUNT(DISTINCT DATE(created_at)) > 4 THEN 1
				ELSE 0
			END AS visits_on_days_5_plus,
			CASE
				WHEN COUNT(DISTINCT DATE(created_at)) > 9 THEN 1
				ELSE 0
			END AS visits_on_days_10_plus
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
			project_id,
			month
	) AS subquery
GROUP BY
	month;
