import {
  Bucket,
  BucketID,
  BucketState,
  Dependency,
  Task,
  TaskID,
  lastAccessedProject,
} from "../types";

const crypto = window.crypto || (window as any).msCrypto;

export const PRIORITY_INCREMENT = 100000;

export const extractIdFromUrl = () => {
  const url = window.location.pathname;
  const parts = url.split("/");
  return parts[parts.length - 1];
};

export const saveProjectIdToLocalStorage = (
  projectId: string,
  projectName: string,
) => {
  const savedProjects = localStorage.getItem("recentProjects");
  let recentProjects = savedProjects ? JSON.parse(savedProjects) : [];

  const existingProjectIndex = recentProjects.findIndex(
    (p: lastAccessedProject) => p.id === projectId,
  );
  const projectData = {
    id: projectId,
    name: projectName,
    lastAccessed: new Date().toISOString(),
  };

  if (existingProjectIndex > -1) {
    // Update existing project data
    recentProjects[existingProjectIndex] = projectData;
  } else {
    // Add new project data
    recentProjects.push(projectData);
  }

  // Sort the projects by last accessed date
  recentProjects = recentProjects.sort(
    (a: lastAccessedProject, b: lastAccessedProject) =>
      new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime(),
  );

  localStorage.setItem("recentProjects", JSON.stringify(recentProjects));
};

// NewID generates a random base-58 ID with optional prefixes.
export function NewID(...prefixes: string[]): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // base58
  const size = 11;

  // Concatenate all prefixes if provided
  const prefix = prefixes.join("");

  // Create an array for the ID
  const id = new Array(size);

  for (let i = 0; i < size; i++) {
    const randomValue = crypto.getRandomValues(new Uint8Array(1))[0];
    id[i] = alphabet[randomValue % alphabet.length];
  }

  return prefix + id.join("");
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
 * @param {BucketID} bucketId - The ID of the bucket to which a new dependency is being added.
 * @param {BucketID} dependencyId - The proposed dependency ID.
 * @param {Dependency[]} dependencies - List of all dependencies.
 * @param {Bucket[]} allBuckets - List of all buckets.
 * @returns {boolean} - Returns true if adding the dependency would cause a cycle, false otherwise.
 */
export const hasCyclicDependencyWithBucket = (
  bucketId: BucketID,
  dependencyId: BucketID,
  dependencies: Dependency[],
): boolean => {
  // Recursive function to traverse the dependency graph
  const traverse = (currentId: BucketID, visited: Set<BucketID>): boolean => {
    if (visited.has(currentId)) return false;
    visited.add(currentId);

    // Find all buckets that the current bucket depends on
    const dependentIds = dependencies
      .filter((dep) => dep.bucketId === currentId)
      .map((dep) => dep.dependencyId);

    // If we reach the bucketId while traversing from the dependencyId, it indicates a cycle
    if (dependentIds.includes(bucketId)) return true;

    for (const depId of dependentIds) {
      if (traverse(depId, visited)) return true;
    }
    return false;
  };

  // Start the traversal with the dependencyId
  return traverse(dependencyId, new Set());
};

export function getTasksByClosed(tasks: Task[], closed: boolean): Task[] {
  return tasks.filter((task) => task.closed === closed);
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

export const getBucketsDependingOn = (
  dependencies: Dependency[],
  dependencyId: BucketID,
): BucketID[] => {
  return dependencies
    .filter((dep) => dep.dependencyId === dependencyId)
    .map((dep) => dep.bucketId);
};

export const getBucketDependencies = (
  dependencies: Dependency[],
  bucketId: BucketID,
): BucketID[] => {
  // Filtert alle Dependencies, bei denen der gegebene Bucket als abhängig aufgeführt ist
  return dependencies
    .filter((dependency) => dependency.bucketId === bucketId)
    .map((dependency) => dependency.dependencyId);
};

export const getBucketsAvailableFor = (
  buckets: Bucket[],
  dependencies: Dependency[],
  givenBucketId: BucketID,
): BucketID[] => {
  // Filter to find direct dependencies of the given bucket
  const directDependencies = dependencies
    .filter((dep) => dep.bucketId === givenBucketId)
    .map((dep) => dep.dependencyId);

  return buckets
    .filter(
      (bucket) =>
        bucket.id !== givenBucketId && // Exclude the given bucket itself
        !directDependencies.includes(bucket.id) && // Exclude direct dependencies
        !hasCyclicDependencyWithBucket(bucket.id, givenBucketId, dependencies), // Exclude buckets that would result in a cyclic dependency
    )
    .map((bucket) => bucket.id); // Extract the bucket IDs
};

//@todo: maybe remove, when not needed. Could be helpful to move whole blocks.
const getDependencyChainsForBucket = (
  buckets: Bucket[],
  dependencies: Dependency[],
  bucketId: BucketID,
): BucketID[][] => {
  const bucket = buckets.find((b) => b.id === bucketId);
  if (!bucket) return [];

  // Find direct dependencies of the bucket
  const directDependencies = dependencies
    .filter((dep) => dep.bucketId === bucketId)
    .map((dep) => dep.dependencyId);

  // If the bucket has no dependencies, just return the bucket itself.
  if (directDependencies.length === 0) {
    return [[bucketId]];
  }

  let chains: BucketID[][] = [];
  for (const dependencyId of directDependencies) {
    const dependencyChains = getDependencyChainsForBucket(
      buckets,
      dependencies,
      dependencyId,
    );
    for (const chain of dependencyChains) {
      chains.push([bucketId, ...chain]);
    }
  }

  return chains;
};

export const getAllDependencyChains = (
  buckets: Bucket[],
  dependencies: Dependency[],
) => {
  let allChains: BucketID[][] = [];

  // Assuming getOtherBuckets function is defined elsewhere and works with the new structure
  const others = getOtherBuckets(buckets);

  for (const bucket of others) {
    allChains = [
      ...allChains,
      ...getDependencyChainsForBucket(buckets, dependencies, bucket.id),
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

export const getNamedBuckets = (buckets: Bucket[]) => {
  return buckets.filter((bucket) => bucket.name !== "");
};

export const getBucketForTask = (buckets: Bucket[], task: Task) => {
  // Find the bucket that has the same id as the task's bucketId
  return buckets.find((bucket) => bucket.id === task.bucketId);
};
export const getLayers = (
  buckets: Bucket[],
  dependencies: Dependency[],
): BucketID[][] => {
  const chains = getAllDependencyChains(buckets, dependencies);
  if (chains.length === 0) {
    return [];
  }
  // Create a map to store the result of findSubarrayIndex as key and the corresponding ids as values
  const layersMap: Map<number, BucketID[]> = new Map();

  const ids = uniqueValues(chains);

  // Get all the buckets that are not in the chains - test.
  const namedBuckets = getNamedBuckets(getOtherBuckets(buckets));
  const namedBucketIds = namedBuckets.map((bucket) => bucket.id);

  const namedBucketsMissingInLayersMap = difference(namedBucketIds, ids);

  const mergedIds = [...ids, ...namedBucketsMissingInLayersMap];

  // Process each id
  mergedIds.forEach((id) => {
    const bucket = getBucket(buckets, id);
    if (!bucket) return;
    let index: number;

    if (bucket.layer !== null) {
      // Use bucket.layer if set, otherwise use findSubarrayIndex
      index = bucket.layer;
    } else {
      index = findLargestSubarrayIndex(chains, id);
    }

    // Adding or updating the layersMap
    if (layersMap.has(index)) {
      layersMap.get(index)!.push(id); // Add to the existing array
    } else {
      layersMap.set(index, [id]); // Create a new array with the id
    }
  });

  // Convert the map to an array of arrays
  const layersArray: BucketID[][] = [];
  const keys = Array.from(layersMap.keys()).sort((a, b) => a - b); // Sorting the keys in ascending order

  // Populate the layersArray with BucketID arrays, ordered by layer
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
  dependencies: Dependency[],
  bucketId: BucketID,
): number => {
  const layers = getLayers(buckets, dependencies);

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
  dependencies: Dependency[],
  index: number | undefined,
): BucketID[][] => {
  if (index === undefined || index < 0) {
    return [];
  }

  const MIN_LAYER = -1;
  const MAX_LAYER = Number.MAX_SAFE_INTEGER;

  const layersWithBucketIds = getLayers(buckets, dependencies);
  const lookup: Map<BucketID, [number, number]> = new Map();
  const layerForBucketId: Map<BucketID, number> = new Map();

  layersWithBucketIds.forEach((ids, layerIndex) => {
    ids.forEach((id) => layerForBucketId.set(id, layerIndex));
  });

  for (const idsInLayer of layersWithBucketIds) {
    for (const idInLayer of idsInLayer) {
      const bucket = getBucket(buckets, idInLayer);
      if (!bucket) continue;

      const dependentOn = getBucketsDependingOn(dependencies, idInLayer);
      const dependencyFor = getBucketDependencies(dependencies, idInLayer);

      const dependentOnLayers = new Set<number>(
        dependentOn
          .map((id) => layerForBucketId.get(id))
          .filter((layer): layer is number => layer !== undefined),
      );

      const dependencyForLayers = new Set<number>(
        dependencyFor
          .map((id: BucketID) => layerForBucketId.get(id))
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

export const getTask = (tasks: Task[], taskId: TaskID) => {
  // Find and return the task with the matching ID in the tasks array
  return tasks.find((t) => t.id === taskId);
};

export const getTaskIndex = (tasks: Task[], taskId: TaskID): number => {
  // Find and return the index of the task in the tasks array
  return tasks.findIndex((t) => t.id === taskId);
};

export const getTasksForBucket = (
  tasks: Task[],
  bucketId: BucketID,
): Task[] => {
  // Filter and return tasks that belong to the given bucket
  return tasks.filter((task) => task.bucketId === bucketId);
};

export function calculateHighestPriority(tasks: Task[]) {
  let highestPriority = 0;
  tasks.forEach((task) => {
    if (task.priority > highestPriority) {
      highestPriority = task.priority;
    }
  });
  return highestPriority;
}

export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => a.priority - b.priority);
};

//it is there, from the api. But I do not want to have it in the rest of the app.
type TaskWithUpdatedAt = Task & {
  updatedAt: Date;
};

export const sortTasksByUpdatedAt = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // Ensure that both a and b are treated as TaskWithUpdatedAt
    const taskA = a as TaskWithUpdatedAt;
    const taskB = b as TaskWithUpdatedAt;

    // Convert date strings to Date objects or use a default date
    const dateA = taskA.updatedAt || new Date(0);
    const dateB = taskB.updatedAt || new Date(0);

    // Compare the Date objects
    if (dateA > dateB) return -1;
    if (dateA < dateB) return 1;
    return 0;
  });
};
export const dateToISO = (date: Date) =>
  date instanceof Date ? date.toISOString().split("T")[0] : date;

export const ISOToDate = (isoDate: string) => new Date(isoDate);

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
}

// Figuring out means: not all tasks of the bucket are closed
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

export function formatDate(date: Date): string {
  const day = date.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];

  let daySuffix: string;

  if ([11, 12, 13].includes(day)) {
    daySuffix = "th";
  } else if (day % 10 === 1) {
    daySuffix = "st";
  } else if (day % 10 === 2) {
    daySuffix = "nd";
  } else if (day % 10 === 3) {
    daySuffix = "rd";
  } else {
    daySuffix = "th";
  }

  return `${month} ${day}${daySuffix}`;
}

export function calculateRemainingTime(
  startedAt: Date,
  endingAt: Date,
): string {
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day

  // Function to determine singular or plural form
  const formatTime = (count: number, singular: string, plural: string) =>
    `${count} ${count === 1 ? singular : plural} left`;

  // Ensure the current date is within the range
  if (today < startedAt) {
    return ""; // Return empty string if the date is before the start
  }

  if (today > endingAt) {
    // Handling the case where today's date is past the ending date
    return "Time budget ended";
  }

  // Calculate the difference in days
  const diffDays = Math.round(
    Math.abs((endingAt.getTime() - today.getTime()) / oneDay),
  );

  // Check if the time budget has ended
  if (diffDays === 0) {
    return "Time budget ended";
  }

  return formatTime(diffDays, "day", "days");
}
