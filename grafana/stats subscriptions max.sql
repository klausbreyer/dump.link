SELECT
	DATE(created_at) AS date,
	MAX(count) AS max_subscribers
FROM
	log_subscriptions
GROUP BY
	DATE(created_at);
