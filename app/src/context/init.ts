import { Bucket, Project } from "../types";
import { NewID } from "./helper";

const initialBuckets: Bucket[] = Array.from({ length: 11 }).map((_, index) => ({
  id: NewID(),
  name: ``,
  dependencies: [],
  flagged: false,
  dump: index === 0,
  done: false,
  tasks:
    index === 0
      ? [
          {
            id: Date.now().toString() + index,
            title: "Your first task",
            closed: false,
            priority: 100000,
          },
        ]
      : [],
}));

const state: Project = {
  id: NewID(),
  name: "Untitled Project",
  startedAt: new Date(),
  appetite: 6,
  buckets: initialBuckets,
};

export default state;
