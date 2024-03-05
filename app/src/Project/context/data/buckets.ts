import { Bucket, BucketID, BucketState, Task } from "../../types";
import { getTasksForBucket } from "./tasks";

// Figuring out means: not all tasks of the bucket are closed
export function filterBucketsFiguringOut(
  buckets: Bucket[],
  tasks: Task[],
): Bucket[] {
  return buckets
    .filter((bucket) => !bucket.dump)
    .filter((bucket) => {
      const bucketTasks = getTasksForBucket(tasks, bucket.id);
      return !bucketTasks.every((task) => task.closed);
    });
} // Figuring out means: not all tasks of the bucket are closed
export function filterBucketsFiguredOut(
  buckets: Bucket[],
  tasks: Task[],
): Bucket[] {
  return buckets
    .filter((bucket) => !bucket.dump && !bucket.done)
    .filter((bucket) => {
      const bucketTasks = getTasksForBucket(tasks, bucket.id);
      return bucketTasks.length > 0;
    })
    .filter((bucket) => {
      const bucketTasks = getTasksForBucket(tasks, bucket.id);
      return bucketTasks.every((task) => task.closed);
    });
}

// Function to get the bucket with dump: true
export const getDumpBucket = (buckets: Bucket[]): Bucket | undefined => {
  return buckets.find((bucket) => bucket.dump === true);
};

// Function to get all the other buckets (excluding the one with dump: true)
export const getOtherBuckets = (buckets: Bucket[]): Bucket[] => {
  return buckets.filter((bucket) => bucket.dump !== true);
};

export const getClosedBucketType = (bucketId: BucketID) => {
  return `CLOSED_BUCKET_${bucketId}`;
};

export const getOpenBucketType = (bucketId: BucketID) => {
  return `OPEN_BUCKET_${bucketId}`;
};

export const getSequenceBucketType = (bucketId: BucketID) => {
  return `SEQUENCE_${bucketId}`;
};

export const getArrangeBucketType = (bucketId: BucketID) => {
  return `ARRANGE_${bucketId}`;
};

// Calculate percentage of tasks closed in a given array of tasks
export function getBucketPercentage(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const closedTasks = tasks.filter((task) => task.closed);
  const percentage = Math.round((closedTasks.length / tasks.length) * 100);

  return percentage;
}

// Determine the state of a bucket based on an array of tasks
export function getBucketState(bucket: Bucket, tasks: Task[]): BucketState {
  const allTasksClosed = tasks.every((task) => task.closed);
  const hasClosedTasks = tasks.some((task) => task.closed);

  // Handle buckets with no tasks
  if (tasks.length === 0) {
    return BucketState.EMPTY;
  }

  if (bucket.done) {
    return BucketState.DONE;
  }

  if (!hasClosedTasks) {
    return BucketState.INACTIVE;
  }

  if (allTasksClosed) {
    return BucketState.SOLVED;
  }

  if (!allTasksClosed) {
    return BucketState.UNSOLVED;
  }

  // This line should theoretically never be reached, but it's here for completeness
  throw new Error("Undefined bucket state.");
}

export const getBucketForTask = (buckets: Bucket[], task: Task) => {
  // Find the bucket that has the same id as the task's bucketId
  return buckets.find((bucket) => bucket.id === task.bucketId);
};

export const getNamedBuckets = (buckets: Bucket[]) => {
  return buckets.filter((bucket) => bucket.name !== "");
};

export const namedBucketsDone = (buckets: Bucket[]) => {
  const namedBuckets = getNamedBuckets(buckets);
  const allBucketsDone =
    namedBuckets.length > 0 && namedBuckets.every((bucket) => bucket.done);
  return allBucketsDone;
};

export const getBucket = (buckets: Bucket[], bucketId: BucketID) => {
  return buckets.find((bucket) => bucket.id === bucketId);
};
