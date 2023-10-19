import { Bucket, BucketID, Task, TaskState } from "../types";

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
    if (visited.has(currentId)) return true;
    visited.add(currentId);

    const currentBucket = allBuckets.find((b) => b.id === currentId);
    if (!currentBucket) return false;

    for (const depId of currentBucket.dependencies) {
      if (traverse(depId, visited)) return true;
    }
    return false;
  };

  // Start the traversal with the proposed dependency and the given bucket's ID
  return traverse(dependencyId, new Set([bucket.id]));
};

export function getTasksByState(
  bucket: Bucket | undefined,
  state: TaskState,
): Task[] {
  const tasks = bucket?.tasks || [];
  return tasks.filter((task) => task.state === state);
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

export const findSubarrayIndex = (data: string[][], id: string): number => {
  for (const subarray of data) {
    const index = subarray.indexOf(id);
    if (index !== -1) {
      return index;
    }
  }
  return -1; // Return -1 if the id is not found in any subarray
};
