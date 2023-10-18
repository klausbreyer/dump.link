import { Bucket, BucketID, Task, TaskState } from "../types";

/**
 * Given a list of chains, this function returns the longest chain.
 * If there are multiple chains of the same longest length, the first one encountered is returned.
 *
 * @param chains - An array of chains where each chain is an array of BucketIDs.
 * @returns The longest chain or undefined if the list of chains is empty.
 */
export const getLongestChain = (
  chains: BucketID[][],
): BucketID[] | undefined => {
  return chains.reduce((longest, current) => {
    return current.length > longest.length ? current : longest;
  }, [] as BucketID[]);
};

export function removeDuplicates(arr: any[]): any[] {
  return [...new Set(arr)];
}

export function getElementsAtIndex(arrays: any[][], i: number): any[] {
  return arrays.map((array) => array[i]);
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

/**
 * Deduplicates inner values of a two-dimensional array. For each unique BucketID in the sub-arrays,
 * only the BucketID with the highest index in the main array is retained. All other occurrences
 * are replaced with null.
 *
 * @param arr - The two-dimensional array to deduplicate.
 * @returns The array with inner values deduplicated.
 */
export function deduplicateInnerValues(
  arr: (BucketID | null)[][],
): (BucketID | null)[][] {
  const lastIndexMap = new Map<BucketID, number>();

  // Find the last index of each BucketID
  for (let i = 0; i < arr.length; i++) {
    for (const id of arr[i]) {
      if (id !== null) {
        lastIndexMap.set(id, i);
      }
    }
  }

  // Replace values with null, if they are not in their last index
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      const id = arr[i][j];
      if (id !== null && lastIndexMap.get(id) !== i) {
        arr[i][j] = null;
      }
    }
  }

  return arr;
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
/**
 *
 * @returns can return null, to fill the spots.
 */
export const getDefaultLayers = (
  chains: BucketID[][],
): (BucketID | null)[][] => {
  const longestChain = getLongestChain(chains) || [];
  const layers = longestChain.map((_, i) =>
    getElementsAtIndex(chains, i).filter(Boolean),
  );

  //remove duplicates between layers
  const cleanedLayers = deduplicateInnerValues(
    // remove duplicates from each layer.
    layers.map((layer) => removeDuplicates(layer)),
  );

  return cleanedLayers;
};
