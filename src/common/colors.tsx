import { getBucketState, getTasksByClosed } from "../context/helper";
import { Bucket, BucketState } from "../types";

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

  // const statusToColor = {
  //   [BucketState.UNSOLVED]: "text-orange-800",
  //   [BucketState.SOLVED]: "text-yellow-800",
  //   [BucketState.DONE]: "text-green-800",
  //   [BucketState.EMPTY]: "text-slate-800",
  //   [BucketState.INACTIVE]: "text-slate-800",
  // };

  // return statusToColor[getBucketState(bucket)];
}

export function getBucketBackgroundColorTop(bucket: Bucket): string {
  const statusToColor = {
    [BucketState.UNSOLVED]: "bg-slate-300",
    [BucketState.SOLVED]: "bg-slate-300",
    [BucketState.DONE]: "bg-green-200",
    [BucketState.EMPTY]: "bg-slate-100",
    [BucketState.INACTIVE]: "bg-slate-300",
  };

  return statusToColor[getBucketState(bucket)];
}

export function getFlagButtonBackground(bucket: Bucket): string {
  const slate = "bg-slate-400 hover:bg-slate-500 focus:bg-slate-500";
  const statusToColor = {
    [BucketState.UNSOLVED]: slate,
    [BucketState.SOLVED]: slate,
    [BucketState.DONE]: "bg-green-300 hover:bg-green-400 focus:bg-green-400",
    [BucketState.EMPTY]: slate,
    [BucketState.INACTIVE]:
      "bg-slate-200 hover:bg-slate-300 focus:bg-slate-300",
  };

  return statusToColor[getBucketState(bucket)];
}

export function getBucketFlaggedStyle(bucket: Bucket): string {
  const open = getTasksByClosed(bucket, false);
  if (bucket.flagged && open.length > 0) {
    return " bg-rose-500 ";
  }
  return "";
}
