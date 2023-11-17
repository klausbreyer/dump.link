import { Bucket, BucketID, BucketState, Project, Task, TaskID } from "../types";

const crypto = window.crypto || (window as any).msCrypto;

export const transformApiResponseToProject = (apiResponse: any): Project => {
  // Zuerst die Tasks mappen
  const tasksMap = new Map<TaskID, Task>();
  apiResponse.tasks.forEach((task: any) => {
    tasksMap.set(task.id, {
      id: task.id,
      title: task.title,
      closed: task.closed,
      priority: task.priority,
    });
  });

  // Jetzt die Buckets mappen und die zugehörigen Tasks einbinden
  const buckets = apiResponse.buckets.map((bucket: any) => ({
    id: bucket.id,
    name: bucket.name,
    done: bucket.done,
    dump: bucket.dump,
    layer: bucket.layer ?? undefined, // 'null' in der API-Antwort wird zu 'undefined'
    tasks: apiResponse.tasks
      .filter((task: any) => task.bucketId === bucket.id)
      .map((task: any) => tasksMap.get(task.id)!),
    flagged: bucket.flagged,
    dependencies: [], // Muss aus weiteren Informationen abgeleitet werden, falls vorhanden
  }));

  // Abschließend das gesamte Project-Objekt zusammenstellen
  return {
    id: apiResponse.project.id,
    name: apiResponse.project.name,
    startedAt: new Date(apiResponse.project.startedAt),
    appetite: apiResponse.project.appetite,
    buckets: buckets,
  };
};

export const extractIdFromUrl = () => {
  const url = window.location.pathname;
  const parts = url.split("/");
  return parts[parts.length - 1];
};

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

export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => a.priority - b.priority);
};

export const getBucketsDependingOn = (
  buckets: Bucket[],
  dependencyId: BucketID,
) => {
  return buckets
    .filter((bucket) => bucket.dependencies.includes(dependencyId))
    .map((bucket) => bucket.id);
};
/**
 * Returns a list of BucketID that can be associated with the given bucket.
 *
 * Specifically, the function filters out:
 * 1. The bucket specified by `givenBucketId` itself.
 * 2. Buckets that are direct dependencies of the bucket specified by `givenBucketId`.
 * 3. Buckets that would create a cyclic dependency if associated with the bucket specified by `givenBucketId`.
 *
 * @param givenBucketId - The ID of the bucket for which to find available buckets.
 * @returns A list of BucketID that can be associated with the given bucket.
 */
export const getBucketsAvailableFor = (
  buckets: Bucket[],
  givenBucketId: BucketID,
): BucketID[] => {
  return buckets
    .filter(
      (bucket) =>
        bucket.id !== givenBucketId && // Exclude the given bucket itself
        !bucket.dependencies.includes(givenBucketId) && // Exclude direct dependencies
        !hasCyclicDependencyWithBucket(bucket, givenBucketId, buckets), // Exclude buckets that would result in a cyclic dependency
    )
    .map((bucket) => bucket.id); // Extract the bucket IDs
};

const getDependencyChainsForBucket = (
  buckets: Bucket[],
  bucketId: BucketID,
): BucketID[][] => {
  const bucket = buckets.find((b) => b.id === bucketId);
  if (!bucket) return [];

  // If the bucket has no dependencies, just return the bucket itself.
  if (bucket.dependencies.length === 0) {
    return [[bucketId]];
  }

  let chains: BucketID[][] = [];
  for (const dependencyId of bucket.dependencies) {
    const dependencyChains = getDependencyChainsForBucket(
      buckets,
      dependencyId,
    );
    for (const chain of dependencyChains) {
      chains.push([bucketId, ...chain]);
    }
  }

  return chains;
};

// This function retrieves all dependency chains for all buckets.
export const getAllDependencyChains = (buckets: Bucket[]) => {
  let allChains: BucketID[][] = [];

  const others = getOtherBuckets(buckets);

  for (const bucket of others) {
    allChains = [
      ...allChains,
      ...getDependencyChainsForBucket(buckets, bucket.id),
    ];
  }

  // Filter out sub-chains to retain only the longest unique paths.
  return allChains
    .filter(
      (chain) =>
        !allChains.some(
          (otherChain) =>
            otherChain.length > chain.length &&
            JSON.stringify(otherChain.slice(-chain.length)) ===
              JSON.stringify(chain),
        ),
    )
    .filter((chain) => chain.length > 1);
};

export const getTaskType = (
  buckets: Bucket[],
  task: Task | null | undefined,
) => {
  if (!task) {
    return "NO_OP";
  }

  const bucket = getBucketForTask(buckets, task);

  if (!bucket) {
    return "NO_OP";
  }

  if (bucket && task.closed) {
    return getClosedBucketType(bucket.id);
  }

  return getOpenBucketType(bucket.id);
};

export const getBucketForTask = (buckets: Bucket[], task: Task) => {
  return buckets.find((bucket) => bucket.tasks.some((bt) => bt.id === task.id));
};

export const getLayers = (buckets: Bucket[]): BucketID[][] => {
  const chains = getAllDependencyChains(buckets);
  if (chains.length === 0) {
    return [];
  }
  // Create a map to store the result of findSubarrayIndex as key and the corresponding ids as values
  const layersMap: Map<number, BucketID[]> = new Map();

  const ids = uniqueValues(chains);

  // Process each id
  ids.forEach((id) => {
    const bucket = getBucket(buckets, id);
    let index: number;

    if (bucket?.layer !== undefined) {
      // Use bucket.layer if set, otherwise use findSubarrayIndex
      index = bucket.layer;
    } else {
      index = findLargestSubarrayIndex(chains, id);
    }

    // We save all the middle orphans for the last row. but not when it is from the longest chain, because it then will not create the last layer.

    if (layersMap.has(index)) {
      layersMap.get(index)!.push(id); // Add to the existing array
    } else {
      layersMap.set(index, [id]); // Create a new array with the id
    }
  });

  // Convert the map to an array of arrays
  const layersArray: BucketID[][] = [];
  const keys = Array.from(layersMap.keys()).sort((a, b) => a - b); // Sorting the keys in ascending order

  const minKey = keys[0];
  const maxKey = keys[keys.length - 1];

  for (let i = minKey; i <= maxKey; i++) {
    if (layersMap.has(i)) {
      layersArray.push(layersMap.get(i)!);
    } else {
      layersArray.push([]);
    }
  }

  return layersArray;
};

export const getBucket = (buckets: Bucket[], bucketId: BucketID) => {
  return buckets.find((bucket) => bucket.id === bucketId);
};

export const getLayerForBucketId = (
  buckets: Bucket[],
  bucketId: BucketID,
): number => {
  const layers = getLayers(buckets);

  for (let i = 0; i < layers.length; i++) {
    if (layers[i].includes(bucketId)) {
      return i;
    }
  }

  // Return -1 if the bucketId is not found in any layer
  return -1;
};

export const getAllowedBucketsByLayer = (
  buckets: Bucket[],
  index: number | undefined,
): BucketID[][] => {
  // Immediate return if index is undefined or negative
  if (index === undefined || index < 0) {
    return [];
  }

  const MIN_LAYER = -1;
  const MAX_LAYER = Number.MAX_SAFE_INTEGER;

  const layersWithBucketIds = getLayers(buckets);
  const lookup: Map<BucketID, [number, number]> = new Map();

  // Pre-compute layer-to-bucketID mapping
  const layerForBucketId: Map<BucketID, number> = new Map();
  layersWithBucketIds.forEach((ids, layerIndex) => {
    ids.forEach((id) => layerForBucketId.set(id, layerIndex));
  });

  for (const idsInLayer of layersWithBucketIds) {
    for (const idInLayer of idsInLayer) {
      const bucket = getBucket(buckets, idInLayer);
      if (!bucket) continue;

      const dependentOn = getBucketsDependingOn(buckets, idInLayer);
      const dependencyFor = bucket.dependencies || [];

      const dependentOnLayers = new Set<number>(
        dependentOn
          .map((id) => layerForBucketId.get(id))
          .filter((layer): layer is number => layer !== undefined),
      );

      const dependencyForLayers = new Set<number>(
        dependencyFor
          .map((id) => layerForBucketId.get(id))
          .filter((layer): layer is number => layer !== undefined),
      );

      const minLayer = dependentOnLayers.size
        ? Math.max(...dependentOnLayers)
        : MIN_LAYER;

      const maxLayer = dependencyForLayers.size
        ? Math.min(...dependencyForLayers)
        : MAX_LAYER;

      lookup.set(idInLayer, [minLayer, maxLayer]);
    }
  }

  const getAllowedBucketsOnLayer = (
    layerIndex: number,
    others: Bucket[],
  ): BucketID[] => {
    return others
      .map((bucket) => bucket.id)
      .filter((id) => {
        const [min, max] = lookup.get(id) || [MIN_LAYER, MAX_LAYER];
        const currentLayer = layerForBucketId.get(id) || MIN_LAYER;
        return (
          currentLayer !== layerIndex && min < layerIndex && max > layerIndex
        );
      });
  };

  // Main logic
  const allowedOnLayers: BucketID[][] = [];
  const others = getOtherBuckets(buckets);
  for (
    let layerIndex = 0;
    layerIndex < layersWithBucketIds.length;
    layerIndex++
  ) {
    allowedOnLayers.push(getAllowedBucketsOnLayer(layerIndex, others));
  }

  return allowedOnLayers;
};

export const getTask = (buckets: Bucket[], taskId: TaskID) => {
  for (const bucket of buckets) {
    const task = bucket.tasks.find((t) => t.id === taskId);
    if (task) return task;
  }
  return undefined;
};

export const getTaskIndex = (
  buckets: Bucket[],
  task: Task | null,
): number | undefined => {
  if (!task) return undefined;
  const bucket = getBucketForTask(buckets, task);
  if (!bucket) return undefined;

  return bucket.tasks.findIndex((bt) => bt.id === task.id);
};
