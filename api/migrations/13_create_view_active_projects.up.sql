CREATE VIEW view_projects_active_7d AS
SELECT
	p.id AS project_id,
	p.name AS project_name,
	COUNT(la.project_id) AS total_actions,
	DATEDIFF(CURRENT_DATE, p.created_at) + 1 AS days_since_creation,
	ROUND(
		COUNT(la.project_id) / (DATEDIFF(CURRENT_DATE, p.created_at) + 1),
		2
	) AS average_actions_per_day
FROM
	log_actions la
	JOIN projects p ON la.project_id = p.id
WHERE
	la.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
GROUP BY
	p.id,
	p.name
ORDER BY
	average_actions_per_day DESC;
