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
};

export type DraggedItem = {
  taskId: string;
  // fromBucketId: string;
};
