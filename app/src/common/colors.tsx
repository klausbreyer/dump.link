import { getBucketState, getTasksByClosed } from "../context/helper";
import { Bucket, BucketState, Task } from "../types";

// Separate function for flagged condition
export function getFlaggedHeaderTextColor(): string {
  return "text-rose-500";
}

export function getInputBorderColor(bucket: Bucket): string {
  return "border-slate-500 hover:border-slate-600 focus:border-slate-600";
}

export function getHoverBorderColor(bucket: Bucket): string {
  return "hover:border-slate-600";
}

export function getHeaderTextColor(bucket: Bucket): string {
  return "text-slate-800";
}

export function getBucketBackgroundColorTop(
  bucket: Bucket,
  tasks: Task[],
): string {
  const statusToColor = {
    [BucketState.UNSOLVED]: "bg-slate-200",
    [BucketState.SOLVED]: "bg-slate-200",
    [BucketState.DONE]: "bg-green-200",
    [BucketState.EMPTY]: "bg-slate-100",
    [BucketState.INACTIVE]: "bg-slate-200",
  };

  return statusToColor[getBucketState(bucket, tasks)];
}

export function getFlagButtonBackground(bucket: Bucket, tasks: Task[]): string {
  const slate = "bg-slate-200 hover:bg-slate-300 focus:bg-slate-300";
  const statusToColor = {
    [BucketState.UNSOLVED]: slate,
    [BucketState.SOLVED]: slate,
    [BucketState.DONE]: "bg-green-300 hover:bg-green-400 focus:bg-green-400",
    [BucketState.EMPTY]: slate,
    [BucketState.INACTIVE]: slate,
  };

  return statusToColor[getBucketState(bucket, tasks)];
}

export function getBucketFlaggedStyle(bucket: Bucket, tasks: Task[]): string {
  const open = getTasksByClosed(tasks, false);
  if ((bucket.flagged && open.length > 0) || tasks.length === 0) {
    return " bg-rose-500 ";
  }
  return "";
}
