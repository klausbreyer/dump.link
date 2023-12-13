import { Dependency } from "../types";
import { hasCyclicDependencyWithBucket } from "./helper";

// Sample data for testing
const dependencies: Dependency[] = [
  {
    bucketId: "a",
    dependencyId: "b",
  },
  {
    bucketId: "b",
    dependencyId: "c",
  },
  {
    bucketId: "b",
    dependencyId: "d",
  },
  {
    bucketId: "d",
    dependencyId: "e",
  },
  {
    bucketId: "d",
    dependencyId: "f",
  },
  {
    bucketId: "f",
    dependencyId: "g",
  },
  {
    bucketId: "g",
    dependencyId: "h",
  },
  {
    bucketId: "b",
    dependencyId: "f",
  },
  {
    bucketId: "b",
    dependencyId: "e",
  },
  {
    bucketId: "c",
    dependencyId: "d",
  },
  {
    bucketId: "c",
    dependencyId: "i",
  },
  {
    bucketId: "b",
    dependencyId: "c",
  },
];

// Test cases
describe("hasCyclicDependencyWithBucket tests", () => {
  it("should detect a cycle when adding a dependency that creates a cycle", () => {
    const bucketId = "b";
    const dependencyId = "f";
    const result = hasCyclicDependencyWithBucket(
      bucketId,
      dependencyId,
      dependencies,
    );
    expect(result).toBe(true); // Expecting a cycle
  });

  it("should not detect a cycle when adding a dependency that does not create a cycle", () => {
    const bucketId = "a";
    const dependencyId = "c";
    const result = hasCyclicDependencyWithBucket(
      bucketId,
      dependencyId,
      dependencies,
    );
    expect(result).toBe(false); // No cycle expected
  });

  // Add more test cases as needed
});
