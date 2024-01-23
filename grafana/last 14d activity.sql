SELECT
	*
FROM
	(
		SELECT
			p.id AS project_id,
			p.name AS project_name,
			p.owner_email,
			p.created_at,
			CONCAT('https://dump.link/a/', p.id) AS project_link,
			DATEDIFF(CURRENT_DATE, p.created_at) + 1 AS days_since_creation,
			COUNT(
				DISTINCT CASE
					WHEN b.name != '' THEN b.id
				END
			) AS non_empty_bucket_count,
			COUNT(DISTINCT t.id) AS total_task_count,
			COUNT(
				DISTINCT CASE
					WHEN t.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY) THEN t.id
				END
			) AS tasks_created_last_14_days
		FROM
			projects p
			LEFT JOIN buckets b ON p.id = b.project_id
			LEFT JOIN tasks t ON b.id = t.bucket_id
		WHERE
			p.owner_email NOT IN (
				'kb@v01.io',
				'm@me.com',
				'matt@dump.link',
				'matt@dump.link.com',
				'mattlane66@me.com'
			)
		GROUP BY
			p.id,
			p.name,
			p.owner_email,
			p.created_at
	) AS subquery
WHERE
	tasks_created_last_14_days > 0
ORDER BY
	tasks_created_last_14_days DESC;
