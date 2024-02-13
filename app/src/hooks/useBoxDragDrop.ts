import { useEffect } from "react";
import { useDrag, useDragLayer, useDrop } from "react-dnd";
import { uniqueValues } from "../context/data/arrays";
import {
  getArrangeBucketType,
  getBucket,
  getOtherBuckets,
  getSequenceBucketType,
} from "../context/data/buckets";
import { useData } from "../context/data/data";
import { getWholeSubgraph } from "../context/data/layers";
import { useGlobalInteraction } from "../context/interaction";
import {
  Bucket,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
} from "../types";
import { getBucketsAvailableFor } from "../context/data/dependencies";

export const useBoxDragDrop = (
  bucket: Bucket,
  onDragStart?: (offset: { x: number; y: number }) => void,
  onDragEnd?: () => void,
) => {
  const { buckets, dependencies, resetBucketLayer, addBucketDependency } =
    useData();
  const { updateGlobalDragging } = useGlobalInteraction();

  const others = getOtherBuckets(buckets);
  const availbleIds = getBucketsAvailableFor(others, dependencies, bucket.id);

  // Arrange Drag Logic
  const [
    { isDragging: foliationIsDragging },
    arrangeDragRef,
    arrangePreviewRev,
  ] = useDrag(
    () => ({
      type: getArrangeBucketType(bucket.id),
      item: { bucketId: bucket.id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {},
    }),
    [bucket, getArrangeBucketType],
  );
  useEffect(() => {
    updateGlobalDragging(
      foliationIsDragging ? DraggingType.ARRANGE : DraggingType.NONE,
      bucket.id,
    );
  }, [foliationIsDragging, updateGlobalDragging]);

  // Sequence Drag Logic
  const [
    { isDragging: sequenceIsDragging },
    sequenceDragRef,
    sequencePreviewRev,
  ] = useDrag(
    {
      type: getSequenceBucketType(bucket.id),
      item: { bucketId: bucket.id },

      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        onDragEnd && onDragEnd();
      },
    },
    [bucket, getSequenceBucketType],
  );

  const layerProps = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging(),
  }));

  useEffect(() => {
    updateGlobalDragging(
      sequenceIsDragging ? DraggingType.SEQUENCE : DraggingType.NONE,
      bucket.id,
    );

    if (sequenceIsDragging && onDragStart) {
      onDragStart(layerProps.differenceFromInitialOffset!);
    }
    if (!sequenceIsDragging && onDragEnd) {
      onDragEnd();
    }
  }, [sequenceIsDragging, updateGlobalDragging]);

  // Drop Logic
  const [collectedProps, dropRef] = useDrop(
    {
      accept: availbleIds.map((id) => getSequenceBucketType(id)),

      drop: (from: DraggedBucket) => {
        const fromBucket = getBucket(others, from.bucketId);
        if (!fromBucket) return;
        addBucketDependency(fromBucket, bucket.id);

        //for all the connected subgraphs (up to the root and down to all the leaves)  reset layers
        //because it can have been somewhere else moved before.
        const affectedIds = uniqueValues([
          getWholeSubgraph(dependencies, from.bucketId),
          getWholeSubgraph(dependencies, bucket.id),
        ]);
        affectedIds.forEach((id) => resetBucketLayer(id));
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [
      availbleIds,
      bucket,
      dependencies,
      others,
      addBucketDependency,
      getSequenceBucketType,
      resetBucketLayer,
    ],
  );
  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  return {
    isOver,
    canDrop,
    sequenceIsDragging,
    arrangeDragRef,
    sequenceDragRef,
    sequencePreviewRev,
    dropRef,
    arrangePreviewRev,
  };
};
