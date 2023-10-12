import { Bucket, TaskState } from "../types";
import { getTasksByState } from "../hooks/useTasks";

// Hilfsfunktion, die den Status des Eimers bestimmt
function getBucketStatus(
  bucket: Bucket | undefined,
): "flagged" | "open" | "closed" | "empty" {
  if (bucket?.flagged) {
    return "flagged";
  }

  const openCount = getTasksByState(bucket, TaskState.OPEN).length;
  const closedCount = getTasksByState(bucket, TaskState.CLOSED).length;

  if (openCount === 0) {
    if (closedCount > 0) {
      return "closed";
    } else {
      return "empty";
    }
  } else {
    return "open";
  }
}

export function getHeaderBorderColor(bucket: Bucket | undefined): string {
  const statusToColor = {
    flagged: "border-rose-500 focus:border-rose-700 hover:border-rose-700",
    open: "border-amber-500 focus:border-amber-700 hover:border-amber-700",
    closed: "border-green-500 focus:border-green-700 hover:border-green-700",
    empty: "border-slate-500 focus:border-slate-700 hover:border-slate-700",
  };

  return statusToColor[getBucketStatus(bucket)];
}

export function getHeaderTextColor(bucket: Bucket | undefined): string {
  const statusToColor = {
    flagged: "text-rose-700",
    open: "text-amber-700",
    closed: "text-green-700",
    empty: "text-slate-700",
  };

  return statusToColor[getBucketStatus(bucket)];
}

export function getHeaderHoverColor(bucket: Bucket | undefined): string {
  const statusToColor = {
    flagged: "hover:bg-rose-300",
    open: "hover:bg-amber-300",
    closed: "hover:bg-green-300",
    empty: "hover:bg-slate-300",
  };

  return statusToColor[getBucketStatus(bucket)];
}

export function getBucketBackgroundColor(
  bucket: Bucket | undefined,
  position = "top",
): string {
  const topColorMapping = {
    flagged: "bg-rose-200",
    open: "bg-amber-200",
    closed: "bg-green-200",
    empty: "bg-slate-200",
  };

  const bottomColorMapping = {
    flagged: "bg-rose-300",
    open: "bg-amber-300",
    closed: "bg-green-300",
    empty: "bg-slate-300",
  };

  return position === "top"
    ? topColorMapping[getBucketStatus(bucket)]
    : bottomColorMapping[getBucketStatus(bucket)];
}
