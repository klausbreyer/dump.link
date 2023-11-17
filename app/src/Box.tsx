import React, { useEffect } from "react";
import { useDrag, useDragLayer, useDrop } from "react-dnd";

import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import Header from "./Header";
import {
  getBucketBackgroundColorTop,
  getHeaderTextColor,
  getHoverBorderColor,
} from "./common/colors";
import { useData } from "./context/data";
import {
  getArrangeBucketType,
  getBucket,
  getBucketsAvailableFor,
  getBucketsDependingOn,
  getLayerForBucketId,
  getSequenceBucketType,
} from "./context/helper";
import { useGlobalDragging } from "./context/dragging";
import {
  Bucket,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
  TabContext,
} from "./types";
import MicroProgress from "./MicroProgress";

interface BoxProps {
  bucket: Bucket;
  context: TabContext;

  onDragStart?: (offset: { x: number; y: number }) => void;
  onDragEnd?: () => void;
}

const Box: React.FC<BoxProps> = (props) => {
  const { bucket, context } = props;
  const { removeBucketDependency, addBucketDependency, getBuckets } = useData();

  const buckets = getBuckets();
  const availbleIds = getBucketsAvailableFor(buckets, bucket.id);
  const dependingIds = getBucketsDependingOn(buckets, bucket.id);

  const currentLayer = getLayerForBucketId(buckets, bucket.id);
  const dependenciesLayers = bucket.dependencies.map((id) => {
    return getLayerForBucketId(buckets, id);
  });

  const isMovable: boolean = !dependenciesLayers.some((layer) => {
    return layer > currentLayer;
  });

  const layerProps = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging(),
  }));

  const { globalDragging, setGlobalDragging } = useGlobalDragging();

  const [collectedProps, dropRef] = useDrop(
    {
      accept: availbleIds.map((id) => getSequenceBucketType(id)),

      drop: (item: DraggedBucket) => {
        const fromBucket = getBucket(buckets, item.bucketId);
        if (!fromBucket) return;
        addBucketDependency(fromBucket, bucket.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [availbleIds, bucket, buckets, addBucketDependency, getSequenceBucketType],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

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
        props.onDragEnd && props.onDragEnd();
      },
    },
    [bucket, getSequenceBucketType],
  );

  useEffect(() => {
    setGlobalDragging(
      sequenceIsDragging ? DraggingType.SEQUENCE : DraggingType.NONE,
      bucket.id,
    );

    if (sequenceIsDragging && props.onDragStart) {
      props.onDragStart(layerProps.differenceFromInitialOffset!);
    }
    if (!sequenceIsDragging && props.onDragEnd) {
      props.onDragEnd();
    }
  }, [sequenceIsDragging, setGlobalDragging]);

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
    setGlobalDragging(
      foliationIsDragging ? DraggingType.ARRANGE : DraggingType.NONE,
      bucket.id,
    );
  }, [foliationIsDragging, setGlobalDragging]);

  const bgTop = getBucketBackgroundColorTop(bucket);

  const dragref =
    context === TabContext.Sequence
      ? sequenceDragRef
      : context === TabContext.Arrange && isMovable
        ? arrangeDragRef
        : (x: any) => x;

  const showUnavailable =
    globalDragging.type === DraggingType.SEQUENCE &&
    !canDrop &&
    !sequenceIsDragging;

  const hoverBorder =
    (context === TabContext.Sequence ||
      (context === TabContext.Arrange && isMovable)) &&
    getHoverBorderColor(bucket);

  return (
    <div
      id={bucket.id}
      className={` w-full rounded-md overflow-hidden opacity-95  border-2
       ${isMovable || context === TabContext.Sequence ? "cursor-move" : ""}
      ${hoverBorder}
      border-slate-300
           ${canDrop && !isOver && "border-dashed border-2 border-gray-400"}
            ${isOver && " border-gray-400"}


      `}
      ref={(node) =>
        dragref(dropRef(arrangePreviewRev(sequencePreviewRev(node))))
      }
    >
      <div className={`${bgTop}`}>
        <Header bucket={bucket} context={context} />
        <MicroProgress bucket={bucket} />

        <div className={`min-h-[1rem] `}>
          <ul className="p-1 text-sm">
            {TabContext.Sequence === context &&
              dependingIds?.map((id) => (
                <BucketItem
                  key={id}
                  context={context}
                  callback={() => removeBucketDependency(id, bucket.id)}
                  bucket={getBucket(buckets, id)}
                />
              ))}
            {TabContext.Sequence === context && (
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
  const bucketName = bucket?.name || "Unnamed";

  const bgHeader = getHeaderTextColor(bucket);

  if (TabContext.Sequence === context) {
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
  if (TabContext.Arrange === context) {
    return (
      <li
        className={`flex items-center justify-between group gap-1 p-0.5 ${bgHeader}`}
      >
        <span className="">{bucketName}</span>
      </li>
    );
  }
};
