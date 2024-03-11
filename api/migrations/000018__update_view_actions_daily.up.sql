-- Drop the existing view
DROP VIEW IF EXISTS view_actions_daily;

-- Recreate the view with RESET_PROJECT_LAYERS instead of RESET_LAYERS_FOR_ALL_BUCKETS
CREATE VIEW view_actions_daily AS
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
	-- Updated part
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
			WHEN action = 'SET_INITIAL_STATE' THEN 1
			ELSE 0
		END
	) AS set_initial_state,
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