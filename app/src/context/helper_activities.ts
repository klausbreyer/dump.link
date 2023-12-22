import config from "../config";
import { Activity, TaskID, UserName } from "../types";

export function checkTaskActivity(
  activities: Activity[],
  taskId: TaskID,
): UserName | null {
  const activity = activities.find((activity) => activity.taskId === taskId);
  if (!activity) return null;

  if (isActivityOutdated(activity.createdAt)) {
    return null;
  }
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

  if (isActivityOutdated(activity.createdAt)) {
    return null;
  }
  return activity.createdBy;
}

export function isActivityOutdated(activityCreatedAt: Date): boolean {
  const activityAge = Date.now() - new Date(activityCreatedAt).getTime();
  return activityAge > config.ACTIVITY_OUTDATED;
}

export function sortActivitiesByDate(activities: Activity[]): Activity[] {
  return activities.sort(
    (a: Activity, b: Activity) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
