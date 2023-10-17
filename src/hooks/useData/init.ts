import { Bucket, TaskState } from "../../types";

const initialBuckets: Bucket[] = Array.from({ length: 11 }).map((_, index) => ({
  id: index + "",
  name: `index ${index}`,
  dependencies: index === 6 ? ["1", "2"] : [],
  flagged: index === 6,
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

export default initialBuckets;
