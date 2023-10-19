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
  } = useData();
  const buckets = getBuckets();

  console.log("chains", chains);

  const others = getOtherBuckets(buckets);

  const layersWithBucketIds = getLayersForSubgraphChains(chains);

  // @todo: this calculation does not belong here.

  const allowedOnLayers: BucketID[][] = [];
  // Check if index is valid
  if (index !== undefined && index >= 0) {
    const lookup: Map<BucketID, [number, number]> = new Map();
    for (const idsInLayer of layersWithBucketIds) {
      const getLayersForBucketIds = (
        chains: any,
        bucketIds: BucketID[],
      ): number[] => {
        return bucketIds.map((id) => getLayerForBucketId(chains, id));
      };
      console.log(index, idsInLayer);

      for (const idInLayer of idsInLayer) {
        const bucket = getBucket(idInLayer);
        if (!bucket) continue;

        const dependents = getBucketsDependingOn(idInLayer);
        const dependencies = bucket.dependencies || [];

        // Fetch layers for dependents and dependencies
        const dependentLayers = getLayersForBucketIds(chains, dependents);
        const dependencyLayers = getLayersForBucketIds(chains, dependencies);

        const minLayer = Math.min(...dependentLayers);
        const maxLayer = Math.min(...dependencyLayers);

        console.log(
          "idresult",
          getBucket(idInLayer)?.name,
          idInLayer,
          minLayer,
          maxLayer,
        );
        lookup.set(idInLayer, [minLayer, maxLayer]);
        // when max is unlimited, there is no limit.
      }
    }

    console.log(lookup);

    const others = getOtherBuckets(buckets);
    for (
      let layerIndex = 0;
      layerIndex < layersWithBucketIds.length;
      layerIndex++
    ) {
      // if (layerIndex === index) continue;

      const allowedOnLayer: BucketID[] = [];
      const layer = layersWithBucketIds[layerIndex];
      for (const bucket of others) {
        const id = bucket.id;
        const res = lookup.get(id);
        if (!res) continue;
        const [min, max] = res;

        const currentLayer = getLayerForBucketId(chains, id);

        if (
          currentLayer !== layerIndex &&
          min <= layerIndex &&
          max >= layerIndex
        ) {
          allowedOnLayer.push(id);
        }
      }
      allowedOnLayers.push(allowedOnLayer);
    }
    console.dir(allowedOnLayers);
  }

  const { globalDragging } = useGlobalDragging();

  const getAccept = (index?: number) => {
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

    if (index === undefined || !allowedOnLayers[index]) {
      return [];
    }

    return allowedOnLayers[index].map((bucketId) =>
      getFoliationBucketType(bucketId),
    );
  };

  const [collectedProps, dropRef] = useDrop(
    {
      accept: getAccept(index),

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
    [
      others,
      index,
      getFoliationBucketType,
      updateBucketLayer,
      getAccept,
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
        className={` border-2 flex items-center justify-center min-h-[5rem] w-full gap-8 relative
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
export default FoliationLane;
