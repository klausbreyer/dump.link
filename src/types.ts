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
};

export type DraggedItem = {
  taskId: string;
};

export type DropCollectedProps = {
  isOver: boolean;
  canDrop: boolean;
};
