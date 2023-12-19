import {
  Bucket,
  BucketID,
  BucketState,
  Dependency,
  Task,
  TaskID,
  lastAccessedProject,
} from "../types";
import { getBucket, getNamedBuckets, getOtherBuckets } from "./helper";
import { difference, uniqueValues } from "./helper_arrays";

export const getUniqueDependingIdsForbucket = (
  buckets: Bucket[],
  dependencies: Dependency[],
  bucketId: BucketID,
): BucketID[] => {
  return uniqueValues(
    getDependencyChainsForBucket(buckets, dependencies, bucketId),
  );
};

export const getDependencyChainsForBucket = (
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

export const hasCyclicDependencyWithBucket = (
  bucketId: BucketID,
  dependencyId: BucketID,
  dependencies: Dependency[],
): boolean => {
  // Convert dependencies into a map for easy lookup
  const dependencyMap = new Map<BucketID, BucketID[]>();
  dependencies.forEach((dep) => {
    if (!dependencyMap.has(dep.bucketId)) {
      dependencyMap.set(dep.bucketId, []);
    }
    dependencyMap.get(dep.bucketId)!.push(dep.dependencyId);
  });

  // Check if the new dependency already exists, indicating a cycle
  if (dependencyMap.get(bucketId)?.includes(dependencyId)) {
    return true;
  }

  // Add the new dependency to the map
  if (!dependencyMap.has(bucketId)) {
    dependencyMap.set(bucketId, []);
  }
  dependencyMap.get(bucketId)!.push(dependencyId);

  // Helper function for DFS
  const dfs = (
    node: BucketID,
    visited: Set<BucketID>,
    stack: Set<BucketID>,
  ): boolean => {
    visited.add(node);
    stack.add(node);

    const neighbors = dependencyMap.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, visited, stack)) {
          return true; // Cycle found
        }
      } else if (stack.has(neighbor)) {
        return true; // Current node is already in the stack, cycle found
      }
    }

    stack.delete(node); // Remove node from current path
    return false;
  };

  return dfs(bucketId, new Set(), new Set());
};

export const getBucketsDependingOn = (
  dependencies: Dependency[],
  dependencyId: BucketID,
): BucketID[] => {
  return dependencies
    .filter((dep) => dep.dependencyId === dependencyId)
    .map((dep) => dep.bucketId);
};

export const getBucketsDependingOnNothing = (
  buckets: Bucket[],
  dependencies: Dependency[],
): Bucket[] => {
  return buckets.filter(
    (bucket) => getBucketsDependingOn(dependencies, bucket.id).length === 0,
  );
};

export const getBucketDependencies = (
  dependencies: Dependency[],
  bucketId: BucketID,
): BucketID[] => {
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

  const currentBucket = buckets.find((bucket) => bucket.id === givenBucketId);

  return buckets
    .filter(
      (bucket) =>
        bucket.id !== givenBucketId && // Exclude the given bucket itself
        !directDependencies.includes(bucket.id) && // Exclude direct dependencies
        !hasCyclicDependencyWithBucket(bucket.id, givenBucketId, dependencies), // Exclude buckets that would result in a cyclic dependency
    )
    .map((bucket) => bucket.id); // Extract the bucket IDs
};
