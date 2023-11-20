export type ProjectID = string;
export type BucketID = string;
export type TaskID = string;

export type Task = {
  id: TaskID;
  bucketId: BucketID;
  title: string;
  closed: boolean;
  priority: number;
};

export type Bucket = {
  id: BucketID;
  projectId: ProjectID;
  name: string;
  done: boolean;
  dump: boolean;
  layer?: number;
  flagged: boolean;
};

export type Dependency = {
  bucketId: BucketID;
  dependencyId: BucketID;
};

export type Project = {
  id: string;
  name: string;
  startedAt: Date;
  appetite: number;
};

export type State = {
  project: Project;
  buckets: Bucket[];
  tasks: Task[];
  dependencies: Dependency[];
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
