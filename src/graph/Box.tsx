import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { getTasksByState, useTasks } from "../hooks/useTasks";
import { getBucketBackgroundColor } from "../common/colors";
import BucketHeader from "../dump/BucketHeader";

interface BoxProps {
  bucketId: string;
}

const Box: React.FC<BoxProps> = (props) => {
  const { bucketId } = props;
  const {
    moveTask,
    getBucket,
    updateTask,
    getTask,
    changeTaskState,
    getClosedBucketType,
    getOpenBucketType,
    getBucketForTask,
    getBuckets,
  } = useTasks();

  const bucket = getBucket(bucketId);

  const bgTop = getBucketBackgroundColor(bucket, "top");

  return (
    <div className={`w-full`}>
      <BucketHeader bucketId={bucketId} />
      <div className={`min-h-[6rem] ${bgTop} `}></div>
    </div>
  );
};

export default Box;
