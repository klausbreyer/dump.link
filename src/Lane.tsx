import React from "react";
import { useDrop } from "react-dnd";

import { useData } from "./context/data";
import {
  getFirstValues,
  getFoliationBucketType,
  getLastValues,
  getOtherBuckets,
} from "./context/helper";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import {
  BucketID,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
} from "./types";

interface LaneProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
  hoverable: boolean;
  defaultHidden: boolean;
  index?: number;
  chains: BucketID[][];
}

const Lane: React.FC<LaneProps> = (props) => {
  const { children, index, hoverable, defaultHidden, chains } = props;
  const {
    getBucket,
    getBuckets,
    updateBucketLayer,
    getLayersForSubgraphChains,
    getAllowedBucketsByLayer,
  } = useData();
  const buckets = getBuckets();

  const others = getOtherBuckets(buckets);
  const allowedOnLayers = getAllowedBucketsByLayer(chains, index);

  const layersWithBucketIds = getLayersForSubgraphChains(chains);

  const { globalDragging } = useGlobalDragging();

  const getAccept = () => {
    // all that is not depending on another.
    if (index === -1) {
      return getFirstValues(chains).map((bucketId) =>
        getFoliationBucketType(bucketId),
      );
    }

    // all that is not having any dependents
    if (index === allowedOnLayers.length) {
      return getLastValues(chains).map((bucketId) =>
        getFoliationBucketType(bucketId),
      );
    }

    // unconnected buckets lane.
    if (index === undefined || !allowedOnLayers[index]) {
      return [];
    }

    //default behaviour
    return allowedOnLayers[index].map((bucketId) =>
      getFoliationBucketType(bucketId),
    );
  };

  const [collectedProps, dropRef] = useDrop(
    {
      accept: getAccept(),

      drop: (item: DraggedBucket) => {
        const bucket = getBucket(item.bucketId);

        if (!bucket) return;
        if (index === null || index === undefined) return;

        console.log("drop", bucket.id, index);

        updateBucketLayer(bucket.id, index);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [
      others,
      index,
      getFoliationBucketType,
      updateBucketLayer,
      layersWithBucketIds,
      getAccept,
      allowedOnLayers,
    ],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const showWhileDragging =
    defaultHidden === false || globalDragging.type === DraggingType.FOLIATION;
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
        className={`border-2 flex-wrap flex items-center justify-center min-h-[5rem] w-full gap-8 relative
        ${dropActive && "border-dashed border-gray-400"}
        ${dropOver && "border-solid border-gray-400"}
        ${!dropActive && !dropOver && "border-solid border-transparent"}
        ${showWhileDragging ? "opacity-100" : "opacity-0"}
      `}
      >
        {children}
      </div>
    </div>
  );
};
export default Lane;
