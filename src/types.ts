export enum TaskState {
  OPEN = "open",
  CLOSED = "closed",
}

export type Task = {
  id: string;
  title: string;
  state: TaskState;
};

export type Bucket = {
  id: string;
  name: string;
  tasks: Task[];
  flagged?: boolean;
  dependencies: string[]; // List of Bucket IDs this bucket depends on
};

export type DraggedTask = {
  taskId: Task["id"];
};

export type DraggedBucket = {
  bucketId: Bucket["id"];
};

export type DropCollectedProps = {
  isOver: boolean;
  canDrop: boolean;
};
