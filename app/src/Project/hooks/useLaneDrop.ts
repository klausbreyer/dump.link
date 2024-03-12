import { useDrop } from "react-dnd";
import {
  getArrangeBucketType,
  getBucket,
  getOtherBuckets,
} from "../../models/buckets";
import {
  getBucketDependencies,
  getBucketsDependingOnNothing,
} from "../../models/dependencies";
import { getLayers } from "../../models/layers";
import { useData } from "../context/data";
import { Bucket, BucketID, Dependency, DraggedBucket } from "../types";

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

export function useLaneDrop(index: number) {
  const { buckets, dependencies, moveSubgraph } = useData();

  const [{ isOver, canDrop }, dropRef] = useDrop(
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

  return { isOver, canDrop, dropRef };
}
