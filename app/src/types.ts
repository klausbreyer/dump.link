// all ids are 11 chars base58 alphanumerical.

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
  done: boolean;
  dump: boolean;
  layer?: number;
  tasks: Task[];
  flagged: boolean;
  dependencies: BucketID[]; // List of Bucket IDs this bucket depends on
};

export type Project = {
  id: string;
  name: string;
  startAt: Date;
  appetite: number;
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

export enum TabContext {
  Group = "Group",
  Sequence = "Sequence",
  Arrange = "Arrange",
  Settings = "Settings",
}

export enum DraggingType {
  TASK = "TASK",
  SEQUENCE = TabContext.Sequence,
  ARRANGE = TabContext.Arrange,
  NONE = "",
}
