import React, { useEffect } from "react";
import { useDrag, useDragLayer, useDrop } from "react-dnd";

import {
  ArrowLeftOnRectangleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import Header from "./Header";
import {
  getBucketBackgroundColorTop,
  getBucketFlaggedStyle,
  getHeaderTextColor,
  getHoverBorderColor,
} from "./common/colors";
import { useData } from "./context/data";
import { getFoliationBucketType, getGraphBucketType } from "./context/helper";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import {
  Bucket,
  BucketID,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
  TabContext,
} from "./types";

interface BoxProps {
  bucket: Bucket;
  context: TabContext;

  onDragStart?: (offset: { x: number; y: number }) => void;
  onDragEnd?: () => void;
}

const Box: React.FC<BoxProps> = (props) => {
  const { bucket, context } = props;
  const {
    removeBucketDependency,
    getBucket,
    addBucketDependency,
    getBucketsAvailableFor,
    getBucketsDependingOn,
  } = useData();

  const availbleIds = getBucketsAvailableFor(bucket.id);
  const dependingIds = getBucketsDependingOn(bucket.id);

  const layerProps = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging(),
  }));

  // useEffect(() => {
  //   if (layerProps.isDragging && props.onDragStart) {
  //     props.onDragStart(layerProps.differenceFromInitialOffset!);
  //   }
  // }, [layerProps.isDragging, layerProps.differenceFromInitialOffset]);

  // useEffect(() => {
  //   if (!layerProps.isDragging && layerProps.item && props.onDragEnd) {
  //     props.onDragEnd();
  //   }
  // }, [layerProps.isDragging]);

  const { globalDragging, setGlobalDragging } = useGlobalDragging();

  const [collectedProps, dropRef] = useDrop(
    {
      accept: availbleIds.map((id) => getGraphBucketType(id)),

      drop: (item: DraggedBucket) => {
        const fromBucket = getBucket(item.bucketId);
        if (!fromBucket) return;
        addBucketDependency(fromBucket, bucket.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [availbleIds, bucket, addBucketDependency, getGraphBucketType],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const [
    { isDragging: graphIsDragging },
    sequencingDragRef,
    sequencingPreviewRev,
  ] = useDrag(
    //@todo: can this anoymous function be gone?
    () => ({
      type: getGraphBucketType(bucket.id),
      item: { bucketId: bucket.id },

      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        props.onDragEnd && props.onDragEnd();
      },
    }),
    [bucket, getGraphBucketType],
  );

  useEffect(() => {
    setGlobalDragging(
      graphIsDragging ? DraggingType.GRAPH : DraggingType.NONE,
      bucket.id,
    );

    if (graphIsDragging && props.onDragStart) {
      props.onDragStart(layerProps.differenceFromInitialOffset!);
    }
    if (!graphIsDragging && props.onDragEnd) {
      props.onDragEnd();
    }
  }, [graphIsDragging, setGlobalDragging]);

  const [
    { isDragging: foliationIsDragging },
    orderingDragRef,
    orderingPreviewRev,
  ] = useDrag(
    () => ({
      type: getFoliationBucketType(bucket.id),
      item: { bucketId: bucket.id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {},
    }),
    [bucket, getFoliationBucketType],
  );

  useEffect(() => {
    setGlobalDragging(
      foliationIsDragging ? DraggingType.FOLIATION : DraggingType.NONE,
      bucket.id,
    );
  }, [foliationIsDragging, setGlobalDragging]);

  const bgTop = getBucketBackgroundColorTop(bucket);

  const dragref =
    context === TabContext.Sequencing
      ? sequencingDragRef
      : context === TabContext.Ordering
      ? orderingDragRef
      : (x: any) => x;

  const showUnavailable =
    globalDragging.type === DraggingType.GRAPH && !canDrop && !graphIsDragging;

  const hoverBorder = getHoverBorderColor(bucket);

  return (
    <div
      id={bucket.id}
      className={` cursor-move w-full rounded-md overflow-hidden opacity-95  border-2
      ${hoverBorder}
           ${canDrop && !isOver && "border-dashed border-2 border-gray-400"}
            ${isOver && " border-gray-400"}
            ${!canDrop && !isOver && " border-transparent"}

      `}
      ref={(node) =>
        dragref(dropRef(orderingPreviewRev(sequencingPreviewRev(node))))
      }
    >
      <div className={`${bgTop}`}>
        <Header bucket={bucket} context={context} />

        <div className={`min-h-[1rem]  `}>
          <ul className="p-1 text-sm">
            {dependingIds?.map((id) => (
              <BucketItem
                key={id}
                context={context}
                callback={() => removeBucketDependency(id, bucket.id)}
                bucket={getBucket(id)}
              />
            ))}
            {TabContext.Sequencing === context && (
              <li className="flex items-center justify-center h-8 gap-1 p-1 text-sm">
                {showUnavailable && (
                  <>
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Cycle Detected
                  </>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Box;

interface BucketItemProps {
  bucket: Bucket | undefined;
  context: TabContext;
  callback: () => void;
}

const BucketItem: React.FC<BucketItemProps> = (props) => {
  const { bucket, context, callback } = props;
  if (!bucket) return null;
  const bucketName = bucket?.name || "Untitled";

  const bgHeader = getHeaderTextColor(bucket);

  if (TabContext.Sequencing === context) {
    return (
      <li
        onClick={() => callback()}
        className={`flex cursor-pointer hover:underline items-center justify-between group gap-1 p-0.5 ${bgHeader}`}
      >
        <span className="">{bucketName}</span>
        <XMarkIcon className="hidden w-5 h-5 shrink-0 group-hover:block" />
      </li>
    );
  }
  if (TabContext.Ordering === context) {
    return (
      <li
        className={`flex cursor-pointer items-center justify-between group gap-1 p-0.5 ${bgHeader}`}
      >
        <span className="">{bucketName}</span>
      </li>
    );
  }
};
