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
  const { getBucket, getBuckets, moveBucketToLayer } = useData();
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
        //@todo: we need a function that gets us the index of the bucket in the layer.
        //@todo: then we need to call move bucket to layer with the old index and the new index.
        // 	and it needs to check, if it is moving down or up, adjusting the index accordingly. (in case we are removing a layer)

        // alternative: chatgpt finds a solution where it checks if a whole layer is removed and adjust index accordingly! https://chat.openai.com/c/e7db95a9-e623-42c9-9c04-1b3310ced50c

        console.log(bucket.id, index);
        moveBucketToLayer(bucket.id, index);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [others, index, getFoliationBucketType, moveBucketToLayer],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const showWhileDragging =
    defaultHidden === false || globalDragging === DraggingType.FOLIATION;
  const dropActive = hoverable && canDrop && !isOver;
  const dropOver = hoverable && canDrop && isOver;

  return (
    <div
      ref={dropRef}
      className={`flex items-center justify-center min-h-[5rem] w-full gap-8 relative
        ${dropActive && "border-dashed border-2 border-gray-400"}
        ${dropOver && "border-solid border-2 border-gray-400"}
        ${showWhileDragging ? "opacity-100" : "opacity-0"}
      `}
    >
      <div className="absolute top-0 left-0">{index}</div>
      {children}
    </div>
  );
};
export default Lane;
