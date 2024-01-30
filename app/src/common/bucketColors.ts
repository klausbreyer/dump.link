import { getBucketState } from "../context/data/buckets";
import { Bucket, BucketState, Task } from "../types";

export function getInputBorderColor(bucket: Bucket): string {
  return "border-slate-500 hover:border-slate-600 focus:border-slate-600";
}

export function getHeaderTextColor(bucket: Bucket): string {
  return "text-slate-800";
}

export function getBucketBackgroundColor(
  bucket: Bucket,
  tasks: Task[],
): string {
  if (bucket.dump === true) {
    return "bg-slate-100";
  }
  const statusToColor = {
    [BucketState.UNSOLVED]: "bg-slate-200",
    [BucketState.SOLVED]: "bg-slate-200",
    [BucketState.DONE]: "bg-green-200",
    [BucketState.EMPTY]: "bg-slate-100",
    [BucketState.INACTIVE]: "bg-slate-200",
  };

  return statusToColor[getBucketState(bucket, tasks)];
}
