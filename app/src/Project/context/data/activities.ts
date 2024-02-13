import config from "../../../config";
import { Activity, TaskID, UserName } from "../../types";
import { getUsername } from "./requests";

export function checkTaskActivity(
  activities: Activity[],
  taskId: TaskID,
): Activity | null {
  const activity = activities.find((activity) => activity.taskId === taskId);
  if (!activity) return null;

  if (isActivityOutdated(activity.createdAt)) {
    return null;
  }
  return activity;
}

export function checkBucketActivity(
  activities: Activity[],
  bucketId: string,
): Activity | null {
  const activity = activities.find(
    (activity) => activity.bucketId === bucketId,
  );
  if (!activity) return null;

  if (isActivityOutdated(activity.createdAt)) {
    return null;
  }
  return activity;
}

export function isActivityOutdated(activityCreatedAt: Date): boolean {
  const activityAge = Date.now() - new Date(activityCreatedAt).getTime();
  return activityAge > config.PROJECT_ACTIVITY_OUTDATED;
}

export function sortActivitiesByDate(activities: Activity[]): Activity[] {
  return activities.sort(
    (a: Activity, b: Activity) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function validateActivityOther(
  activity: Activity | null,
): Activity | null {
  return activity && activity.createdBy !== getUsername() ? activity : null;
}

export function validateActivitySelf(
  activity: Activity | null,
): Activity | null {
  return activity && activity.createdBy !== getUsername() ? activity : null;
}
