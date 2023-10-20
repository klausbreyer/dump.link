import { getBucketState, getTasksByState } from "../context/helper";
import { Bucket, TaskState, BucketState } from "../types";

export function getHeaderBorderColor(bucket: Bucket): string {
  if (bucket.flagged) {
    return "border-rose-500 focus:border-rose-800 hover:border-rose-800";
  }
  const statusToColor = {
    [BucketState.UNSOLVED]:
      "border-orange-500 focus:border-orange-800 hover:border-orange-800",
    [BucketState.SOLVED]:
      "border-yellow-500 focus:border-yellow-800 hover:border-yellow-800",
    [BucketState.DONE]:
      "border-green-500 focus:border-green-800 hover:border-green-800",
    [BucketState.EMPTY]:
      "border-slate-500 focus:border-slate-800 hover:border-slate-800",
    [BucketState.INACTIVE]:
      "border-slate-500 focus:border-slate-800 hover:border-slate-800",
  };

  return statusToColor[getBucketState(bucket)];
}

export function getHeaderTextColor(bucket: Bucket): string {
  if (bucket.flagged) {
    return "text-rose-800";
  }
  const statusToColor = {
    [BucketState.UNSOLVED]: "text-orange-800",
    [BucketState.SOLVED]: "text-yellow-800",
    [BucketState.DONE]: "text-green-800",
    [BucketState.EMPTY]: "text-slate-800",
    [BucketState.INACTIVE]: "text-slate-800",
  };

  return statusToColor[getBucketState(bucket)];
}

export function getHeaderHoverColor(bucket: Bucket): string {
  if (bucket.flagged) {
    return "text-rose-800";
  }
  const statusToColor = {
    flagged: "hover:bg-rose-300",
    [BucketState.UNSOLVED]: "hover:bg-orange-300",
    [BucketState.SOLVED]: "hover:bg-yellow-300",
    [BucketState.DONE]: "hover:bg-green-300",
    [BucketState.EMPTY]: "hover:bg-slate-300",
    [BucketState.INACTIVE]: "hover:bg-slate-300",
  };

  return statusToColor[getBucketState(bucket)];
}

export function getBucketBackgroundColorTop(bucket: Bucket): string {
  if (bucket.flagged) {
    return "bg-rose-200";
  }

  const statusToColor = {
    [BucketState.UNSOLVED]: "bg-orange-200",
    [BucketState.SOLVED]: "bg-yellow-200",
    [BucketState.DONE]: "bg-green-200",
    [BucketState.EMPTY]: "bg-slate-200",
    [BucketState.INACTIVE]: "bg-slate-200",
  };

  return statusToColor[getBucketState(bucket)];
}

export function getBucketBackgroundColorBottom(bucket: Bucket): string {
  if (bucket.flagged) {
    return "bg-rose-300";
  }

  const statusToColor = {
    [BucketState.UNSOLVED]: "bg-orange-300",
    [BucketState.SOLVED]: "bg-yellow-300",
    [BucketState.DONE]: "bg-green-300",
    [BucketState.EMPTY]: "bg-slate-300",
    [BucketState.INACTIVE]: "bg-slate-300",
  };

  return statusToColor[getBucketState(bucket)];
}
