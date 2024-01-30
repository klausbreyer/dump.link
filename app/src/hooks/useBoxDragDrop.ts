import {
  useDrag,
  useDrop,
  DragSourceMonitor,
  DropTargetMonitor,
  useDragLayer,
} from "react-dnd";
import {
  Bucket,
  DraggedBucket,
  DropCollectedProps,
  DraggingType,
} from "../types";
import {
  getSequenceBucketType,
  getArrangeBucketType,
  getOtherBuckets,
  getBucket,
} from "../context/data/buckets";
import { useAbsence } from "../context/absence";
import { useData } from "../context/data/data";
import { useGlobalInteraction } from "../context/interaction";
import { useEffect } from "react";
import { uniqueValues } from "../context/data/arrays";
import { getWholeSubgraph } from "../context/data/layers";

export const useBoxDragDrop = (
  bucket: Bucket,
  onDragStart?: (offset: { x: number; y: number }) => void,
  onDragEnd?: () => void,
) => {
  const { buckets, dependencies, resetBucketLayer, addBucketDependency } =
    useData();

  const { updateGlobalDragging } = useGlobalInteraction();

  const others = getOtherBuckets(buckets);
  const availbleIds = others.map((b) => b.id); // Assuming this logic is correct

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
