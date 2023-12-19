import React from "react";
import { useDrop } from "react-dnd";

import { useData } from "./context/data";
import {
  getArrangeBucketType,
  getBucket,
  getBucketDependencies,
  getBucketsDependingOnNothing,
  getLayers,
  getOtherBuckets,
} from "./context/helper";
import { useGlobalInteraction } from "./context/interaction";
import {
  Bucket,
  BucketID,
  Dependency,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
} from "./types";

interface LaneProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
  hoverable: boolean;
  defaultHidden: boolean;
  index: number;
}
const getAccept = (
  buckets: Bucket[],
  dependencies: Dependency[],
  index: number,
) => {
  const others = getOtherBuckets(buckets);
  const bucketsNotDepending = getBucketsDependingOnNothing(
    others,
    dependencies,
  );

  const layers = getLayers(buckets, dependencies);

  const accept: string[] = [];

  /**
   * Special Case:
   * new lane: accepts all. everything can be moved down.
   */
  if (index === undefined || !layers[index]) {
    return buckets.map((bucket) => getArrangeBucketType(bucket.id));
  }

  /**
   * General Case: Everything that is not depending on something can be moved everywhere
   */
  bucketsNotDepending.forEach((bucket) => {
    accept.push(getArrangeBucketType(bucket.id));
  });

  /**
   * Case 1: Upwards-Move
   *
   * layer allows all buckets that are a dependent on all the buckets in all the layers above.
   */

  //map that holds the lowest dependency layer for each bucket
  // attention: lower = larger number (because top -> down)
  const lowestDependencyLayer = new Map<BucketID, number>();

  layers.forEach((layer, layerIndex) => {
    // Iterating through each bucket in the layer
    for (const bucketId of layer) {
      // Getting dependencies of the current bucket
      const bucketDependencies = getBucketDependencies(dependencies, bucketId);

      bucketDependencies.forEach((dependencyId) => {
        // Updating the lowest layer index for the dependency
        const currentLowestLayerIndex = lowestDependencyLayer.get(dependencyId);
        if (!currentLowestLayerIndex || layerIndex > currentLowestLayerIndex) {
          lowestDependencyLayer.set(dependencyId, layerIndex);
        }
      });
    }
  });

  //push all the lowest dependencies into accept
  lowestDependencyLayer.forEach((layerIndex, bucketId) => {
    if (index > layerIndex) {
      accept.push(getArrangeBucketType(bucketId));
    }
  });
  // such a move needs the update of all dependent boxes.

  /**
   * Case 2: downward-move
   * layer allows all that comes from above(because it will push everything down)
   */
  accept.push(
    ...layers
      .slice(0, index)
      .flatMap((bucketId) => bucketId)
      .map((bucketId) => getArrangeBucketType(bucketId)),
  );

  // such a move needs the update of all dependent boxes.

  /**
   * Case 3: No Move.
   * All Boxes all that are  currently in the lane can stay there.
   */
  accept.push(
    ...layers[index].map((bucketId) => getArrangeBucketType(bucketId)),
  );
  return accept;
};

const Lane: React.FC<LaneProps> = (props) => {
  const { children, index, hoverable, defaultHidden } = props;
  const { buckets, dependencies, moveSubgraph } = useData();

  const { globalDragging } = useGlobalInteraction();

  const [collectedProps, dropRef] = useDrop(
    {
      accept: getAccept(buckets, dependencies, index),

      drop: (item: DraggedBucket) => {
        const bucket = getBucket(buckets, item.bucketId);

        if (!bucket) return;
        if (index === null || index === undefined) return;

        moveSubgraph(bucket.id, index);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [dependencies, index, buckets, moveSubgraph, getAccept],
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
        ${dropActive && "border-dashed border-slate-400"}
        ${dropOver && "border-solid border-slate-400"}
        ${!dropActive && !dropOver && "border-solid border-transparent"}
        ${showWhileDragging ? "opacity-100" : "opacity-0"}
      `}
      >
        <div className="text-sm">Layer {index + 1}</div>
        <div
          className={`flex flex-1 flex-wrap items-center justify-evenly gap-8
          ${index % 2 === 0 && "pl-10"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
export default Lane;
