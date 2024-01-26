import { Dependency } from "../types";
import { hasCyclicDependencyWithBucket } from "./helper_dependencies";

// Sample data for testing
const dependencies: Dependency[] = [
  {
    bucketId: "a",
    dependencyId: "b",
    createdBy: "user",
    createdAt: new Date(),
  },
  {
    bucketId: "b",
    dependencyId: "c",
    createdBy: "user",
    createdAt: new Date(),
  },
  {
    bucketId: "b",
    dependencyId: "d",
    createdBy: "user",
    createdAt: new Date(),
  },
  {
    bucketId: "d",
    dependencyId: "e",
    createdBy: "user",
    createdAt: new Date(),
  },
  {
    bucketId: "d",
    dependencyId: "f",
    createdBy: "user",
    createdAt: new Date(),
  },
  {
    bucketId: "f",
    dependencyId: "g",
    createdBy: "user",
    createdAt: new Date(),
  },
  {
    bucketId: "g",
    dependencyId: "h",
    createdBy: "user",
    createdAt: new Date(),
  },
  {
    bucketId: "b",
    dependencyId: "f",
    createdBy: "user",
    createdAt: new Date(),
  },
  {
    bucketId: "b",
    dependencyId: "e",
    createdBy: "user",
    createdAt: new Date(),
  },
  {
    bucketId: "c",
    dependencyId: "d",
    createdBy: "user",
    createdAt: new Date(),
  },
  {
    bucketId: "c",
    dependencyId: "i",
    createdBy: "user",
    createdAt: new Date(),
  },
  {
    bucketId: "b",
    dependencyId: "c",
    createdBy: "user",
    createdAt: new Date(),
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
