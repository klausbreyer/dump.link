export type ProjectID = string;
export type BucketID = string;
export type TaskID = string;

export type UserName = string;

export type Activity = {
  projectId: ProjectID;
  bucketId?: BucketID;
  taskId?: TaskID;
  createdBy: UserName;
  createdAt: Date;
};

export type Task = {
  id: TaskID;
  bucketId: BucketID;
  title: string;
  closed: boolean;
  priority: number;
  updatedBy: UserName;
  createdAt: Date;
  updatedAt: Date;
};

export type Bucket = {
  id: BucketID;
  projectId: ProjectID;
  name: string;
  done: boolean;
  dump: boolean;
  layer: number | null;
  flagged: boolean;
  updatedBy: UserName;
  createdAt: Date;
  updatedAt: Date;
};

export type Dependency = {
  bucketId: BucketID;
  dependencyId: BucketID;
  createdBy: UserName;
  createdAt: Date;
};

export type Project = {
  id: string;
  name: string;
  startedAt: Date;
  endingAt: Date | null;
  appetite: number; // 0 = n/a
  archived: boolean;
  updatedBy: UserName;
  createdAt: Date;
  updatedAt: Date;
};

export type State = {
  project: Project;
  buckets: Bucket[];
  tasks: Task[];
  dependencies: Dependency[];
  activities: Activity[];
};

export type TaskUpdates = {
  closed?: Task["closed"];
  title?: Task["title"];
  priority?: Task["priority"];
  bucketId?: Task["bucketId"];
  updatedBy?: Project["updatedBy"];
};

export type BucketUpdates = {
  name?: Bucket["name"];
  layer?: Bucket["layer"];
  flagged?: Bucket["flagged"];
  done?: Bucket["done"];
  updatedBy?: Project["updatedBy"];
};

export type ProjectUpdates = {
  name?: Project["name"];
  startedAt?: Project["startedAt"];
  endingAt?: Project["endingAt"];
  appetite?: Project["appetite"];
  archived?: Project["archived"];
  updatedBy?: Project["updatedBy"];
};

export type DependencyUpdates = {
  bucketId?: Dependency["bucketId"];
  dependencyId?: Dependency["dependencyId"];
};

export type ActivityUpdates = {
  bucketId?: Activity["bucketId"];
  taskId?: Activity["taskId"];
  createdBy?: Activity["createdBy"];
};
export interface lastAccessedProject {
  id: string;
  name: string;
  lastAccessed: string; // assuming lastAccessed is a string
}

export type ApiMessage = {
  message: string;
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
