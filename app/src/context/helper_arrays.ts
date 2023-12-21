export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

export function uniqueValues<T>(arr: T[][]): T[] {
  return [...new Set(arr.flatMap((subArray) => subArray))];
}
