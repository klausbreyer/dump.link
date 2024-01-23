SELECT
	DATE(created_at) AS date,
	SUM(
		CASE
			WHEN action = 'ADD_TASK' THEN 1
			ELSE 0
		END
	) AS add_task,
	SUM(
		CASE
			WHEN action = 'UPDATE_BUCKET' THEN 1
			ELSE 0
		END
	) AS update_bucket,
	SUM(
		CASE
			WHEN action = 'UPDATE_PROJECT' THEN 1
			ELSE 0
		END
	) AS update_project,
	SUM(
		CASE
			WHEN action = 'RESET_PROJECT_LAYERS' THEN 1
			ELSE 0
		END
	) AS reset_project_layers,
	SUM(
		CASE
			WHEN action = 'UPDATE_TASK' THEN 1
			ELSE 0
		END
	) AS update_task,
	SUM(
		CASE
			WHEN action = 'ADD_BUCKET_DEPENDENCY' THEN 1
			ELSE 0
		END
	) AS add_bucket_dependency,
	SUM(
		CASE
			WHEN action = 'REMOVE_BUCKET_DEPENDENCY' THEN 1
			ELSE 0
		END
	) AS remove_bucket_dependency,
	SUM(
		CASE
			WHEN action = 'DELETE_TASK' THEN 1
			ELSE 0
		END
	) AS delete_task,
	SUM(
		CASE
			WHEN action = 'CREATE_PROJECT' THEN 1
			ELSE 0
		END
	) AS create_project
FROM
	log_actions
GROUP BY
	DATE(created_at)
ORDER BY
	date;
