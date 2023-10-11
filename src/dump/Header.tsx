import React, { ChangeEvent, useState } from "react";
import TaskItem from "./TaskItem";
import FlexCol from "../design/FlexCol";
import { getTasksByState, useTasks } from "../context/useTasks";
import { useDrop } from "react-dnd";
import {
  Bucket,
  DraggedItem,
  DropCollectedProps,
  TaskState,
} from "../context/types";
import CardList from "../design/CardList";
import { getBackgroundColor } from "./Bucket";

export interface HeaderProps {
  bucketId: string;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { bucketId } = props;

  const {
    getBucket,
    getBuckets,
    moveTask,
    getBucketForTask,
    getOpenBucketType,
    renameBucket,
    flagBucket,
  } = useTasks();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 48) {
      renameBucket(bucketId, newValue);
    } else {
      renameBucket(bucketId, newValue.substring(0, 48)); // Abschneiden nach 48 Zeichen
    }
  };

  const bucket = getBucket(bucketId);
  const handleClick = () => {
    flagBucket(bucketId, !bucket?.flagged);
  };

  const bgTop = getBackgroundColor(bucket, "top");
  const bgBottom = getBackgroundColor(bucket, "bottom");
  const border = getBorderColor(bucket);
  const hover = getHoverColor(bucket);
  return (
    <div className={`w-full ${bgTop} p-1 flex gap-1 `}>
      <input
        type="text"
        className={`w-full bg-transparent border-b-2 focus:outline-none ${border}
        `}
        value={bucket?.name}
        onChange={handleChange}
      />
      <button
        onClick={handleClick}
        className={`px-2 bg-transparent border-2 focus:outline-none ${border}
			  ${hover}
        `}
      >
        F
      </button>
    </div>
  );
};

export default Header;

export function getBorderColor(bucket: Bucket | undefined): string {
  if (bucket?.flagged) {
    return "border-rose-500 focus:border-rose-700 hover:border-rose-700";
  }

  const openCount = getTasksByState(bucket, TaskState.OPEN).length;
  const closedCount = getTasksByState(bucket, TaskState.CLOSED).length;

  if (openCount === 0) {
    if (closedCount > 0) {
      return "border-green-500 focus:border-green-700 hover:border-green-700";
    } else {
      return "border-slate-500 focus:border-slate-700 hover:border-slate-700";
    }
  } else {
    return "border-amber-500 focus:border-amber-700 hover:border-amber-700";
  }
}

export function getHoverColor(bucket: Bucket | undefined): string {
  if (bucket?.flagged) {
    return "hover:bg-rose-300";
  }

  const openCount = getTasksByState(bucket, TaskState.OPEN).length;
  const closedCount = getTasksByState(bucket, TaskState.CLOSED).length;

  if (openCount === 0) {
    if (closedCount > 0) {
      return "hover:bg-green-300";
    } else {
      return "hover:bg-slate-300";
    }
  } else {
    return "hover:bg-amber-300";
  }
}
