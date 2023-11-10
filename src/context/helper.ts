import { Bucket, BucketID, BucketState, Task, TaskID } from "../types";

// main.ts
const crypto = window.crypto || (window as any).msCrypto;

// NewID generates a random base-58 ID.
export function NewID(): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // base58
  const size = 11;

  // Create a Uint8Array and fill it with random values
  const idBuffer = new Uint8Array(size);
  crypto.getRandomValues(idBuffer);

  // Convert Uint8Array to array of numbers
  const idArray = Array.from(idBuffer);

  // Map each byte to a character in the base58 alphabet
  const id = idArray.map((p) => alphabet[p % alphabet.length]).join("");

  return id;
}
/**
 * Given a list of chains, this function returns each unique pair from all the chains.
 *
 * @param chains - An array of chains where each chain is an array of BucketIDs.
 * @returns An array of unique pairs from the chains.
 */
export const getAllPairs = (chains: BucketID[][]): [BucketID, BucketID][] => {
  const pairsSet = new Set<string>();

  for (const chain of chains) {
    for (let i = 0; i < chain.length - 1; i++) {
      pairsSet.add(`${chain[i]},${chain[i + 1]}`);
    }
  }

  return Array.from(pairsSet).map(
    (pair) => pair.split(",") as [BucketID, BucketID],
  );
};

export function divideIntoSubsets(input: BucketID[][]): BucketID[][][] {
  const remaining = [...input];
  const groups: BucketID[][][] = [];

  while (remaining.length > 0) {
    const currentGroup: BucketID[][] = [remaining[0]];
    const valuesInCurrentGroup: Set<BucketID> = new Set(remaining[0]);
    remaining.splice(0, 1);

    let i = 0;
    while (i < remaining.length) {
      if (remaining[i].some((value) => valuesInCurrentGroup.has(value))) {
        for (const value of remaining[i]) {
          valuesInCurrentGroup.add(value);
        }
        currentGroup.push(remaining[i]);
        remaining.splice(i, 1);
      } else {
        i++;
      }
    }

    groups.push(currentGroup);
  }

  return groups;
}
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

export function uniqueValues<T>(arr: T[][]): T[] {
  return [...new Set(arr.flatMap((subArray) => subArray))];
}

// Function to get the bucket with dump: true
export const getDumpBucket = (buckets: Bucket[]): Bucket | undefined => {
  return buckets.find((bucket) => bucket.dump === true);
};

// Function to get all the other buckets (excluding the one with dump: true)
export const getOtherBuckets = (buckets: Bucket[]): Bucket[] => {
  return buckets.filter((bucket) => bucket.dump !== true);
};

export const countTasks = (buckets: Bucket[]): number => {
  return buckets.reduce((total, bucket) => total + bucket.tasks.length, 0);
};
/**
 * Checks if adding a dependency to the given bucket would result in a cyclic relationship.
 *
 * @param {Bucket} bucket - The bucket to which a new dependency is being added.
 * @param {BucketID} dependencyId - The proposed dependency ID.
 * @param {Bucket[]} allBuckets - List of all buckets.
 * @returns {boolean} - Returns true if adding the dependency would cause a cycle, false otherwise.
 */
export const hasCyclicDependencyWithBucket = (
  bucket: Bucket,
  dependencyId: BucketID,
  allBuckets: Bucket[],
): boolean => {
  // Recursive function to traverse the dependency graph
  const traverse = (currentId: BucketID, visited: Set<string>): boolean => {
    if (visited.has(currentId)) return false;
    visited.add(currentId);

    const currentBucket = allBuckets.find((b) => b.id === currentId);
    if (!currentBucket) return false;

    // If we reach the bucket.id while traversing from the dependencyId,
    // it indicates a cycle
    if (currentBucket.id === bucket.id) return true;

    for (const depId of currentBucket.dependencies) {
      if (traverse(depId, visited)) return true;
    }
    return false;
  };

  // Start the traversal with the dependencyId
  return traverse(dependencyId, new Set());
};

export function getTasksByClosed(
  bucket: Bucket | undefined,
  closed: boolean,
): Task[] {
  const tasks = bucket?.tasks || [];
  return tasks.filter((task) => task.closed === closed);
}

export function sortTasksNotClosedFirst(bucket: Bucket | undefined): Task[] {
  const tasks = bucket?.tasks || [];

  return tasks.sort((a, b) => {
    if (!a.closed && b.closed) return -1;
    if (a.closed && !b.closed) return 1;
    return 0;
  });
}

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

/**
 * Finds the largest index within subarrays for a given id.
 * @param data - The 2D array containing subarrays.
 * @param id - The id to search for.
 * @returns The largest index of the id within the subarrays, or -1 if not found.
 */
export const findLargestSubarrayIndex = (
  data: BucketID[][],
  id: BucketID,
): number => {
  let largestIndex = -1;

  for (const subarray of data) {
    const index = subarray.indexOf(id);
    if (index > largestIndex) {
      largestIndex = index;
    }
  }

  return largestIndex;
};

export const isLastInSubarray = (data: BucketID[][], id: BucketID): boolean => {
  for (const subarray of data) {
    if (subarray[subarray.length - 1] === id) {
      return true;
    }
  }
  return false; // Return false if the id is not the last in any subarray
};

/**
 * Finds the index of a task by its ID in a given bucket.
 * @param bucket - The bucket containing the tasks.
 * @param taskId - The ID of the task to find.
 * @returns The index of the task if found, otherwise -1.
 */
export const getTaskIdIndex = (bucket: Bucket, taskId: TaskID): number => {
  return bucket.tasks.findIndex((task) => task.id === taskId);
};

/**
 * Checks if the given id is present in only one sub-array.
 *
 * @param data - The 2D array to search through
 * @param id - The id to look for
 * @returns True if the id is present in only one sub-array, false otherwise
 */
export const isOnlyInOneSubArray = (
  data: BucketID[][],
  id: BucketID,
): boolean => {
  let count = 0; // Counter to keep track of how many times the id appears across all sub-arrays

  for (const subarray of data) {
    if (subarray.includes(id)) {
      count++;
    }

    // If count is greater than 1, we can break early as the id is in more than one sub-array
    if (count > 1) {
      return false;
    }
  }

  // Return true only if the id appears in exactly one sub-array
  return count === 1;
};
export const SubArrayLength = (data: BucketID[][], id: BucketID): number => {
  for (const subarray of data) {
    if (subarray.includes(id)) {
      return subarray.length;
    }
  }
  return -1; // Return -1 if the id is not found in any subarray
};
export const getLargestSubArray = (data: BucketID[][]): BucketID[] => {
  if (data.length === 0) return [];

  return data.reduce((a, b) => (a.length > b.length ? a : b));
};

export function getTwoLowestUniqueNumbers(arr: number[]): number[] {
  const uniqueNumbers = Array.from(new Set(arr));
  const sortedUniqueNumbers = uniqueNumbers.sort((a, b) => a - b);
  return sortedUniqueNumbers.slice(0, 2);
}
// Function to get the first value from each sub-array, deduplicated
export function getFirstValues(arr: string[][]): string[] {
  const firstValues: Set<string> = new Set();

  for (const subArr of arr) {
    if (subArr.length > 0) {
      firstValues.add(subArr[0]);
    }
  }

  return [...firstValues];
}

// Function to get the last value from each sub-array, deduplicated
export function getLastValues(arr: string[][]): string[] {
  const lastValues: Set<string> = new Set();

  for (const subArr of arr) {
    if (subArr.length > 0) {
      lastValues.add(subArr[subArr.length - 1]);
    }
  }

  return [...lastValues];
}

//calculate percentage of tasks in bucket closed
export function getBucketPercentage(bucket: Bucket): number {
  const closedTasks = bucket.tasks.filter((task) => task.closed);
  const percentage = Math.round(
    (closedTasks.length / bucket.tasks.length) * 100,
  );

  percentage > 0 ? percentage : percentage;
  return percentage;
}

export function getBucketState(bucket: Bucket): BucketState {
  // Check if all tasks are closed
  const allTasksClosed = bucket.tasks.every((task) => task.closed);
  const hasClosedTasks = bucket.tasks.some((task) => task.closed);

  // Handle buckets with no tasks
  if (bucket.tasks.length === 0) {
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
