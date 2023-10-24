import { randomBytes } from "crypto";

import { Bucket, State } from "../types";
import { NewID } from "./helper";

let initialBuckets: Bucket[] = Array.from({ length: 11 }).map((_, index) => ({
  id: NewID(),
  name: ``,
  dependencies: [],
  flagged: index === 6,
  dump: index === 0,
  active: false,
  tasks:
    index === 0
      ? [
          {
            id: Date.now().toString() + index,
            title: "Your first task",
            closed: false,
          },
        ]
      : [],
}));

// initialBuckets[2].layer = 3;
// initialBuckets[6].dependencies = [initialBuckets[1].id, initialBuckets[2].id];
// initialBuckets[5].dependencies = [initialBuckets[6].id];
// initialBuckets[7].dependencies = [initialBuckets[6].id, initialBuckets[8].id];
// initialBuckets[9].dependencies = [initialBuckets[10].id];
initialBuckets[10].name = "Chowder";

const state: State = {
  buckets: initialBuckets,
};

export default state;
