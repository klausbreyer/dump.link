import { randomBytes } from "crypto";
import { Bucket, BucketID, BucketState, Task } from "../types";

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

// NewID generates a random base-58 ID.
export function NewID(): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // base58
  const size = 11;

  const idBuffer = randomBytes(size);
  const idArray = Array.from(idBuffer);

  const id = idArray.map((p) => alphabet[p % alphabet.length]);

  return id.join("");
}

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

export const getClosedBucketType = (bucketId: BucketID) => {
  return `CLOSED_BUCKET_${bucketId}`;
};

export const getOpenBucketType = (bucketId: BucketID) => {
  return `OPEN_BUCKET_${bucketId}`;
};

export const getGraphBucketType = (bucketId: BucketID) => {
  return `GRAPH_${bucketId}`;
};

export const getFoliationBucketType = (bucketId: BucketID) => {
  return `FOLIATION_${bucketId}`;
};

export const findSubarrayIndex = (data: BucketID[][], id: BucketID): number => {
  for (const subarray of data) {
    const index = subarray.indexOf(id);
    if (index !== -1) {
      return index;
    }
  }
  return -1; // Return -1 if the id is not found in any subarray
};

export const isLastInSubarray = (data: BucketID[][], id: BucketID): boolean => {
  for (const subarray of data) {
    if (subarray[subarray.length - 1] === id) {
      return true;
    }
  }
  return false; // Return false if the id is not the last in any subarray
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

export function getBucketState(bucket: Bucket): BucketState {
  // Check if all tasks are closed
  const allTasksClosed = bucket.tasks.every((task) => task.closed);
  const hasClosedTasks = bucket.tasks.some((task) => task.closed);

  // Handle buckets with no tasks
  if (bucket.tasks.length === 0) {
    return BucketState.EMPTY;
  }

  if (allTasksClosed && hasClosedTasks && bucket.active) {
    return BucketState.SOLVED;
  }

  if (allTasksClosed && hasClosedTasks && !bucket.active) {
    return BucketState.DONE;
  }

  if (!allTasksClosed && bucket.active) {
    return BucketState.UNSOLVED;
  }

  if (!allTasksClosed && !bucket.active) {
    return BucketState.INACTIVE;
  }

  // This line should theoretically never be reached, but it's here for completeness
  throw new Error("Undefined bucket state.");
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
