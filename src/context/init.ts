import { Bucket, State, TaskState } from "../types";
import { randomBytes } from "crypto";

// NewID generates a random base-58 ID.
function NewID(): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; // base58
  const size = 11;

  const idBuffer = randomBytes(size);
  const idArray = Array.from(idBuffer);

  const id = idArray.map((p) => alphabet[p % alphabet.length]);

  return id.join("");
}

const initialBuckets: Bucket[] = Array.from({ length: 11 }).map((_, index) => ({
  id: NewID(),
  name: `index ${index}`,
  dependencies: [],
  flagged: index === 6,
  dump: index === 0,
  tasks:
    index === 0
      ? [
          {
            id: Date.now().toString() + index,
            title: "Your first task",
            state: TaskState.OPEN,
          },
        ]
      : index === 1
      ? Array.from({ length: 3 }).map((_, i) => ({
          id: Date.now().toString() + index + i,
          title: `Task ${i} in Bucket ${index}`,
          state: TaskState.OPEN,
        }))
      : index === 2
      ? [
          {
            id: Date.now().toString() + index,
            title: "Done Task in Bucket 2",
            state: TaskState.CLOSED,
          },
        ]
      : index === 6
      ? [
          {
            id: Date.now().toString() + index,
            title: "Open Task in Bucket 6",
            state: TaskState.CLOSED,
          },
        ]
      : [],
}));

initialBuckets[6].dependencies = [initialBuckets[1].id, initialBuckets[2].id];
initialBuckets[10].name = "Chowder";

// initialBuckets = Array.from({ length: 11 }).map((_, index) => ({
//   id: index + "",
//   name: ``,
//   flagged: false,
//   tasks:
//     index === 0
//       ? [
//           {
//             id: Date.now().toString() + index,
//             title: "Your first task",
//             state: TaskState.OPEN,
//           },
//         ]
//       : [],
// }));

const state: State = {
  buckets: initialBuckets,
  layers: [],
};

export default state;
