import { FlagIcon as FlagIconOutline } from "@heroicons/react/24/outline";
import { FlagIcon as FlagIconSolid } from "@heroicons/react/24/solid";
import React from "react";
import {
  getHeaderTextColor,
  getInputBorderColor,
} from "../Project/bucketColors";
import { Bucket, BucketState, Task } from "../Project/types";
import { getBucketState } from "../models/buckets";

export interface FlagButtonProps {
  bucket: Bucket;
  tasks: Task[];
  onClick?: () => void;
}

const FlagButton = React.forwardRef<
  HTMLButtonElement,
  FlagButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const { bucket, tasks, onClick, children, disabled, className, ...rest } =
    props;

  function getFlagButtonBackground(bucket: Bucket, tasks: Task[]): string {
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

  const hover = getFlagButtonBackground(bucket, tasks);
  const text = getHeaderTextColor(bucket);
  const border = getInputBorderColor(bucket);
  const flagColor = "text-rose-500";

  const colors = bucket.flagged
    ? `${flagColor} ${border} ${hover} `
    : `${border} ${hover} ${text}`;

  return (
    <button
      ref={ref}
      onClick={onClick && !disabled ? () => onClick() : () => {}}
      className={`active:transform active:scale-95 transition-transform duration-150 h-8 p-0.5 rounded-sm shadow-sm border-b-4 focus:outline-none ${colors} ${className} `}
      {...rest}
    >
      {bucket?.flagged ? (
        <FlagIconSolid className="w-5 h-5 " />
      ) : (
        <FlagIconOutline className="w-5 h-5 " />
      )}
    </button>
  );
});

export default FlagButton;
