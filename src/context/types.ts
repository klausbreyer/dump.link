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
  id: number;
  name: string;
  tasks: Task[];
};
