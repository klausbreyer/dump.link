import { BucketID } from "../../types";

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
