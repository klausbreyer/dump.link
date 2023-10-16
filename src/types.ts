export enum TaskState {
  OPEN = "open",
  CLOSED = "closed",
}

export type BucketID = string;
export type TaskID = string;

export type Task = {
  id: TaskID;
  title: string;
  state: TaskState;
};

export type Bucket = {
  id: BucketID;
  name: string;
  tasks: Task[];
  flagged?: boolean;
  dependencies: string[]; // List of Bucket IDs this bucket depends on
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
