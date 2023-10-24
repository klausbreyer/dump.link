import { randomBytes } from "crypto";

import { Bucket, State } from "../types";

// NewID generates a random base-58 ID.
function NewID(): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // base58
  const size = 11;

  const idBuffer = randomBytes(size);
  const idArray = Array.from(idBuffer);

  const id = idArray.map((p) => alphabet[p % alphabet.length]);

  return id.join("");
}

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
