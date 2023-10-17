import React, { useEffect, useRef, useState } from "react";
import FlexCol from "../common/FlexCol";
import { useData } from "../hooks/useData";
import {
  deduplicateInnerValues,
  difference,
  getAllPairs,
  getElementsAtIndex,
  getFoliationBucketType,
  getLongestChain,
  getOtherBuckets,
  removeDuplicates,
  uniqueValues,
} from "../hooks/useData/helper";
import Container from "../common/Container";
import Box from "../graph/Box";
import {
  Bucket,
  BucketID,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
} from "../types";
import { useDrop } from "react-dnd";
import { useGlobalDragging } from "../hooks/useGlobalDragging";

interface LaneProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
  hoverable: boolean;
  defaultHidden: boolean;
  index?: number;
}

const Lane: React.FC<LaneProps> = (props) => {
  const { children, index, hoverable, defaultHidden } = props;
  const { getBucket, getBuckets } = useData();
  const buckets = getBuckets();

  const others = getOtherBuckets(buckets);

  const { globalDragging } = useGlobalDragging();

  const [collectedProps, dropRef] = useDrop(
    {
      accept: others.map((bucket) => getFoliationBucketType(bucket.id)),

      drop: (item: DraggedBucket) => {
        const bucket = getBucket(item.bucketId);
        if (!bucket) return;
        if (!index) return;
        console.log(bucket, index);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [others, index, getFoliationBucketType],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const showWhileDragging =
    defaultHidden === false || globalDragging === DraggingType.FOLIATION;
  const dropActive = hoverable && canDrop && !isOver;
  const dropOver = hoverable && canDrop && isOver;

  return (
    <div
      ref={dropRef}
      className={`flex items-center justify-center min-h-[5rem] w-full gap-8
        ${dropActive && "border-dashed border-2 border-gray-400"}
        ${dropOver && "border-solid border-2 border-gray-400"}
        ${showWhileDragging ? "opacity-100" : "opacity-0"}
      `}
    >
      {children}
    </div>
  );
};
export default Lane;
