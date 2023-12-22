import { Activity, TaskID, UserName } from "../types";

export function checkTaskActivity(
  activities: Activity[],
  taskId: TaskID,
): UserName | null {
  const activity = activities.find((activity) => activity.taskId === taskId);
  if (!activity) return null;

  return activity.createdBy;
}

export function checkBucketActivity(
  activities: Activity[],
  bucketId: string,
): UserName | null {
  const activity = activities.find(
    (activity) => activity.bucketId === bucketId,
  );
  if (!activity) return null;
  return activity.createdBy;
}
