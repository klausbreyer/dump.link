import { Bucket, BucketID, Dependency } from "../Project/types";
import { difference, uniqueValues } from "../utils/arrays";
import { getBucket, getNamedBuckets, getOtherBuckets } from "./buckets";
import {
  getAllDependencyChains,
  getBucketDependencies,
  getBucketsDependingOn,
} from "./dependencies";

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

export const getLayers = (
  buckets: Bucket[],
  dependencies: Dependency[],
): BucketID[][] => {
  const chains = getAllDependencyChains(buckets, dependencies);

  // Create a map to store the result of findSubarrayIndex as key and the corresponding ids as values
  const layersMap: Map<number, BucketID[]> = new Map();

  const uniqueIds = uniqueValues(chains);
  const namedBuckets = getNamedBuckets(getOtherBuckets(buckets));
  const namedBucketIds = namedBuckets.map((bucket) => bucket.id);
  const namedBucketsMissingInLayersMap = difference(namedBucketIds, uniqueIds);

  const ids = [...uniqueIds, ...namedBucketsMissingInLayersMap];

  // Process each id
  ids.forEach((id) => {
    const bucket = getBucket(buckets, id);
    if (!bucket) return;
    let index: number;

    if (bucket.layer !== null) {
      // Use bucket.layer if set, otherwise use findSubarrayIndex
      index = bucket.layer;
    } else {
      index = findLargestSubarrayIndex(chains, id);
      if (index === -1) {
        index = 0;
      }
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
  const maxKey = keys[keys.length - 1];

  // Ensure layersArray starts from 0
  for (let i = 0; i <= maxKey; i++) {
    if (layersMap.has(i)) {
      layersArray.push(layersMap.get(i)!);
    } else {
      layersArray.push([]);
    }
  }

  return layersArray;
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

/**
 * Finds the largest index within subarrays for a given id.
 * @param data - The 2D array containing subarrays.
 * @param id - The id to search for.
 * @returns The largest index of the id within the subarrays, or -1 if not found.
 */
const findLargestSubarrayIndex = (data: BucketID[][], id: BucketID): number => {
  let largestIndex = -1;

  for (const subarray of data) {
    const index = subarray.indexOf(id);
    if (index > largestIndex) {
      largestIndex = index;
    }
  }

  return largestIndex;
};

export function rootsOfSubgraph(
  dependencies: Dependency[],
  bucketId: BucketID,
): BucketID[] {
  let roots = new Set<BucketID>();

  const findRoots = (currentBucketId: BucketID) => {
    const dependentBuckets = getBucketsDependingOn(
      dependencies,
      currentBucketId,
    );

    if (dependentBuckets.length === 0) {
      roots.add(currentBucketId);
    } else {
      dependentBuckets.forEach(findRoots);
    }
  };

  findRoots(bucketId);

  return Array.from(roots);
}

export function getWholeSubgraph(
  dependencies: Dependency[],
  bucketId: BucketID,
): BucketID[] {
  let visited = new Set<BucketID>();

  const traverse = (currentBucketId: BucketID) => {
    if (visited.has(currentBucketId)) {
      return;
    }

    visited.add(currentBucketId);

    const dependentBuckets = getBucketsDependingOn(
      dependencies,
      currentBucketId,
    );
    dependentBuckets.forEach(traverse);

    const bucketDependencies = getBucketDependencies(
      dependencies,
      currentBucketId,
    );
    bucketDependencies.forEach(traverse);
  };

  traverse(bucketId);

  return Array.from(visited);
}
