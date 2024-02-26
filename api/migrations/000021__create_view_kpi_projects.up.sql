CREATE VIEW view_kpi_projects AS
SELECT
	DATE_FORMAT(created_at, '%Y-%m') AS month,
	COUNT(*) AS project_count,
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
	)
GROUP BY
	DATE_FORMAT(created_at, '%Y-%m');
