SELECT
	p1.owner_email,
	COUNT(DISTINCT p1.id) as projects_count
FROM
	`projects` p1
	JOIN `projects` p2 ON p1.owner_email = p2.owner_email
	AND p1.id <> p2.id
	AND DATEDIFF(p2.created_at, p1.created_at) >= 1
WHERE
	p1.owner_email NOT IN (
		'kb@v01.io',
		'm@me.com',
		'matt@dump.link',
		'matt@dump.link.com',
		'mattlane66@me.com',
		''
	)
GROUP BY
	p1.owner_email
HAVING
	projects_count > 1;
