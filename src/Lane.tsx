import React from "react";
import { useDrop } from "react-dnd";

import { useData } from "./context/data";
import {
  getArrangeBucketType,
  getLastValues,
  getOtherBuckets,
} from "./context/helper";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import { DraggedBucket, DraggingType, DropCollectedProps } from "./types";

interface LaneProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
  hoverable: boolean;
  defaultHidden: boolean;
  index: number;
}

const Lane: React.FC<LaneProps> = (props) => {
  const { children, index, hoverable, defaultHidden } = props;
  const {
    getBucket,
    getBuckets,
    updateBucketLayer,
    getAllDependencyChains,
    getAllowedBucketsByLayer,
  } = useData();
  const buckets = getBuckets();

  const chains = getAllDependencyChains();
  const others = getOtherBuckets(buckets);
  const allowedOnLayers = getAllowedBucketsByLayer(index);

  const { globalDragging } = useGlobalDragging();

  const getAccept = () => {
    // all that is not having any dependents
    if (index === allowedOnLayers.length) {
      return getLastValues(chains).map((bucketId) =>
        getArrangeBucketType(bucketId),
      );
    }

    // unconnected buckets lane.
    if (index === undefined || !allowedOnLayers[index]) {
      return [];
    }

    //default behaviour
    return allowedOnLayers[index].map((bucketId) =>
      getArrangeBucketType(bucketId),
    );
  };

  const [collectedProps, dropRef] = useDrop(
    {
      accept: getAccept(),

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
    [others, index, updateBucketLayer, getAccept],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const showWhileDragging =
    defaultHidden === false || globalDragging.type === DraggingType.ARRANGE;
  const dropActive = hoverable && canDrop && !isOver;
  const dropOver = hoverable && canDrop && isOver;

  const isUnconnected = index === null || index === undefined;

  return (
    <div
      className={`p-4 [&:not(:last-child)]:border-b border-black border-solid
      ${isUnconnected && "bg-slate-100"}
    `}
    >
      <div
        ref={dropRef}
        className={`border-2 min-h-[5rem] w-full relative flex flex-row gap-8
        ${dropActive && "border-dashed border-gray-400"}
        ${dropOver && "border-solid border-gray-400"}
        ${!dropActive && !dropOver && "border-solid border-transparent"}
        ${showWhileDragging ? "opacity-100" : "opacity-0"}
      `}
      >
        <div className="text-sm">{index + 1}</div>
        <div
          className={`flex flex-1 flex-wrap items-center justify-evenly gap-8 `}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
export default Lane;
