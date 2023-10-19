import React, { useEffect, useRef, useState } from "react";
import FlexCol from "./common/FlexCol";
import { useData } from "./context/data";
import {
  getFoliationBucketType,
  getOtherBuckets,
  uniqueValues,
} from "./context/helper";
import Container from "./common/Container";
import Box from "./Box";
import {
  Bucket,
  BucketID,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
} from "./types";
import { useDrop } from "react-dnd";
import { useGlobalDragging } from "./hooks/useGlobalDragging";

interface FoliationLaneProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
  hoverable: boolean;
  defaultHidden: boolean;
  index?: number;
}

const FoliationLane: React.FC<FoliationLaneProps> = (props) => {
  const { children, index, hoverable, defaultHidden } = props;
  const { getBucket, getBuckets, updateBucketLayer } = useData();
  const buckets = getBuckets();

  const others = getOtherBuckets(buckets);

  // Lane knows it index.
  // based on a given $something it can find out what boxes can be dropped in this lane.
  // const allowed =

  const { globalDragging } = useGlobalDragging();

  const [collectedProps, dropRef] = useDrop(
    {
      accept: others.map((bucket) => getFoliationBucketType(bucket.id)),

      drop: (item: DraggedBucket) => {
        const bucket = getBucket(item.bucketId);

        if (!bucket) return;
        if (index === null || index === undefined) return;

        updateBucketLayer(bucket.id, index);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [others, index, getFoliationBucketType, updateBucketLayer],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const showWhileDragging =
    defaultHidden === false || globalDragging === DraggingType.FOLIATION;
  const dropActive = hoverable && canDrop && !isOver;
  const dropOver = hoverable && canDrop && isOver;

  const isUnconnected = index === null || index === undefined;

  return (
    <div
      className={`p-4 border-b border-black border-solid
      ${isUnconnected && "bg-slate-100"}
    `}
    >
      <div
        ref={dropRef}
        className={` border-2 flex items-center justify-center min-h-[5rem] w-full gap-8 relative
        ${dropActive && "border-dashed border-gray-400"}
        ${dropOver && "border-solid border-gray-400"}
        ${!dropActive && !dropOver && "border-solid border-transparent"}
        ${showWhileDragging ? "opacity-100" : "opacity-0"}
      `}
      >
        <div className="absolute top-0 left-0 font-bold ">
          {isUnconnected ? "Unconnected" : `Layer ${index + 1}`}
        </div>
        {children}
      </div>
    </div>
  );
};
export default FoliationLane;
