export type BucketID = string;
export type TaskID = string;

export type Task = {
  id: TaskID;
  title: string;
  closed: boolean;
};

export type Bucket = {
  id: BucketID;
  name: string;
  active: boolean;
  dump: boolean;
  layer?: number; //overwrite layer. only write when moved. then it keeps this position, no matter what.
  tasks: Task[];
  flagged: boolean;
  dependencies: BucketID[]; // List of Bucket IDs this bucket depends on
};

export type State = {
  buckets: Bucket[];
};

export type DraggedTask = {
  taskId: TaskID;
};

export type DraggedBucket = {
  bucketId: BucketID;
};

export type DropCollectedProps = {
  isOver: boolean;
  canDrop: boolean;
};

export enum DraggingType {
  TASK = "TASK",
  GRAPH = "GRAPH",
  FOLIATION = "FOLIATION",
  NONE = "",
}

export type GlobalDraggingState = {
  type: DraggingType;
  entity: string | null;
};

export enum BucketState {
  INACTIVE = "inactive",
  UNSOLVED = "unsolved",
  SOLVED = "solved",
  DONE = "done",
  EMPTY = "empty",
}
