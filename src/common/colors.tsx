import { Bucket } from "../types";

// Separate function for flagged condition
export function getFlaggedHeaderTextColor(): string {
  return "text-rose-500";
}

export function getInputBorderColor(bucket: Bucket): string {
  return "border-slate-600 hover:border-slate-800 focus:border-slate-800";
  // const statusToColor = {
  //   [BucketState.UNSOLVED]:
  //     "border-orange-600 hover:border-orange-800 focus:border-orange-800",
  //   [BucketState.SOLVED]:
  //     "border-yellow-600 hover:border-yellow-800 focus:border-yellow-800",
  //   [BucketState.DONE]:
  //     "border-green-600 hover:border-green-800 focus:border-green-800",
  //   [BucketState.EMPTY]:
  //     "border-slate-600 hover:border-slate-800 focus:border-slate-800",
  //   [BucketState.INACTIVE]:
  //     "border-slate-600 hover:border-slate-800 focus:border-slate-800",
  // };
  // return statusToColor[getBucketState(bucket)];
}

export function getHoverBorderColor(bucket: Bucket): string {
  return "hover:border-slate-600";
  // const statusToColor = {
  //   [BucketState.UNSOLVED]: "hover:border-orange-600",
  //   [BucketState.SOLVED]: "hover:border-yellow-600",
  //   [BucketState.DONE]: "hover:border-green-600",
  //   [BucketState.EMPTY]: "hover:border-slate-600",
  //   [BucketState.INACTIVE]: "hover:border-slate-600",
  // };

  // return statusToColor[getBucketState(bucket)];
}

export function getHeaderBorderColor(bucket: Bucket): string {
  return "border-slate-600";
  // const statusToColor = {
  //   [BucketState.UNSOLVED]: "border-orange-600",
  //   [BucketState.SOLVED]: "border-yellow-600",
  //   [BucketState.DONE]: "border-green-600",
  //   [BucketState.EMPTY]: "border-slate-600",
  //   [BucketState.INACTIVE]: "border-slate-600",
  // };

  // return statusToColor[getBucketState(bucket)];
}

export function getActiveColor(bucket: Bucket): string {
  return "bg-slate-300 ";
  // const statusToColor = {
  //   [BucketState.UNSOLVED]: "bg-orange-300 ",
  //   [BucketState.SOLVED]: "bg-yellow-300 ",
  //   [BucketState.DONE]: "bg-green-300 ",
  //   [BucketState.EMPTY]: "bg-slate-300 ",
  //   [BucketState.INACTIVE]: "bg-slate-300 ",
  // };

  // return statusToColor[getBucketState(bucket)];
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
  return "bg-sky-200";

  // const statusToColor = {
  //   [BucketState.UNSOLVED]: "bg-orange-200",
  //   [BucketState.SOLVED]: "bg-yellow-200",
  //   [BucketState.DONE]: "bg-green-200",
  //   [BucketState.EMPTY]: "bg-slate-200",
  //   [BucketState.INACTIVE]: "bg-slate-200",
  // };

  // return statusToColor[getBucketState(bucket)];
}

export function getBucketBackgroundColorBottom(bucket: Bucket): string {
  return "bg-green-300 hover:bg-green-400";
  // const statusToColor = {
  //   [BucketState.UNSOLVED]: "bg-orange-300 hover:bg-orange-400",
  //   [BucketState.SOLVED]: "bg-yellow-300 hover:bg-yellow-400",
  //   [BucketState.DONE]: "bg-green-300 hover:bg-green-400",
  //   [BucketState.EMPTY]: "bg-slate-300 hover:bg-slate-400",
  //   [BucketState.INACTIVE]: "bg-slate-300 hover:bg-slate-400",
  // };

  // return statusToColor[getBucketState(bucket)];
}

export function getBucketBackgroundColorBottomHover(bucket: Bucket): string {
  return "bg-green-400";
  // const statusToColor = {
  //   [BucketState.UNSOLVED]: "bg-orange-400",
  //   [BucketState.SOLVED]: "bg-yellow-400",
  //   [BucketState.DONE]: "bg-green-400",
  //   [BucketState.EMPTY]: "bg-slate-400",
  //   [BucketState.INACTIVE]: "bg-slate-400",
  // };

  // return statusToColor[getBucketState(bucket)];
}

export function getButtonBackground(bucket: Bucket): string {
  return "bg-slate-300 hover:bg-slate-400 focus:bg-slate-400";
  // const statusToColor = {
  //   [BucketState.UNSOLVED]:
  //     "bg-orange-300 hover:bg-orange-400 focus:bg-orange-400",
  //   [BucketState.SOLVED]:
  //     "bg-yellow-300 hover:bg-yellow-400 focus:bg-yellow-400",
  //   [BucketState.DONE]: "bg-green-300 hover:bg-green-400 focus:bg-green-400",
  //   [BucketState.EMPTY]: "bg-slate-300 hover:bg-slate-400 focus:bg-slate-400",
  //   [BucketState.INACTIVE]:
  //     "bg-slate-300 hover:bg-slate-400 focus:bg-slate-400",
  // };

  // return statusToColor[getBucketState(bucket)];
}

export function getBucketFlaggedStyle(bucket: Bucket): string {
  if (!bucket.flagged) {
    return "";
  }
  return " bg-rose-500 ";
}
