import React, { useEffect, useRef, useState } from "react";
import FlexCol from "./common/FlexCol";
import { useData } from "./context/data";
import {
  getFirstValues,
  getFoliationBucketType,
  getLastValues,
  getOtherBuckets,
  getTwoLowestUniqueNumbers,
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
  chains: BucketID[][];
}

const FoliationLane: React.FC<FoliationLaneProps> = (props) => {
  const { children, index, hoverable, defaultHidden, chains } = props;
  const {
    getBucket,
    getBuckets,
    updateBucketLayer,
    getLayersForSubgraphChains,
    getLayerForBucketId,
    getBucketsDependingOn,
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

        const old = getLayerForBucketId(chains, bucket.id);

        console.log("drop", bucket.id, old, index);

        const lengthOfOldLayer = layersWithBucketIds?.[old]?.length;
        console.log(layersWithBucketIds, "lengthOfOldLayer", lengthOfOldLayer);

        const lengthOfNewLayer = layersWithBucketIds?.[index]?.length;
        console.log(layersWithBucketIds, "lengthOfNewLayer", lengthOfNewLayer);

        let layersToRemove = 0;
        // for (const layer of layersWithBucketIds) {
        //   if (layer.length === 0) {
        //     countEmptyLayersInbetween++;
        //   }
        // }

        if (lengthOfOldLayer === 1) {
          layersToRemove++;
        }

        console.log("layersToRemove", layersToRemove);

        let updated = index;
        if (old === 0) {
          console.log("CORRECT", layersToRemove);

          updated = updated - layersToRemove;
        }
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
      getLayerForBucketId,
      allowedOnLayers,
    ],
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
        className={` border-2 flex-wrap flex items-center justify-center min-h-[5rem] w-full gap-8 relative
        ${dropActive && "border-dashed border-gray-400"}
        ${dropOver && "border-solid border-gray-400"}
        ${!dropActive && !dropOver && "border-solid border-transparent"}
        ${showWhileDragging ? "opacity-100" : "opacity-0"}
      `}
      >
        <div>{index}</div>
        {children}
      </div>
    </div>
  );
};
export default FoliationLane;
