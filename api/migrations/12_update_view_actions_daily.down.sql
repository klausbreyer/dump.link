-- Down Migration: Re-add CHANGE_TASK_STATE to view_actions_daily
BEGIN;

-- Drop the current view
DROP VIEW IF EXISTS view_actions_daily;

-- Recreate the original view with the CHANGE_TASK_STATE aggregation
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
			WHEN action = 'RESET_LAYERS_FOR_ALL_BUCKETS' THEN 1
			ELSE 0
		END
	) AS reset_layers_for_all_buckets,
	SUM(
		CASE
			WHEN action = 'CHANGE_TASK_STATE' THEN 1
			ELSE 0
		END
	) AS change_task_state,
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

COMMIT;
