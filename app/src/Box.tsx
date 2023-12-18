import React, { useEffect } from "react";
import { useDrag, useDragLayer, useDrop } from "react-dnd";

import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import BoxHeader from "./BoxHeader";
import MicroProgress from "./MicroProgress";
import {
  getBucketBackgroundColorTop,
  getHeaderTextColor,
} from "./common/colors";
import { useData } from "./context/data";
import {
  getArrangeBucketType,
  getBucket,
  getBucketsAvailableFor,
  getBucketsDependingOn,
  getOtherBuckets,
  getSequenceBucketType,
  getTasksForBucket,
  getUniqueDependingIdsForbucket,
} from "./context/helper";
import { useGlobalInteraction } from "./context/interaction";
import {
  Bucket,
  DraggedBucket,
  DraggingType,
  DropCollectedProps,
  TabContext,
} from "./types";
import Modal from "./common/Modal";
import TaskGroup from "./TaskGroup";

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
    getTasks,
    getDependencies,
    addBucketDependency,
    getBuckets,
  } = useData();

  const {
    globalDragging,
    updateGlobalDragging,
    hoveredBuckets,
    updateHoveredBuckets,
  } = useGlobalInteraction();

  const buckets = getBuckets();
  const others = getOtherBuckets(buckets);
  const tasks = getTasks();
  const deps = getDependencies();
  const tasksForbucket = getTasksForBucket(tasks, bucket.id);
  const availbleIds = getBucketsAvailableFor(others, deps, bucket.id);
  const dependingIds = getBucketsDependingOn(deps, bucket.id);
  const uniqueDependingIds = getUniqueDependingIdsForbucket(
    others,
    deps,
    bucket.id,
  );

  const [isOpen, setIsOpen] = React.useState(false);

  const layerProps = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging(),
  }));

  /**
   * Dropping
   */
  const [collectedProps, dropRef] = useDrop(
    {
      accept: availbleIds.map((id) => getSequenceBucketType(id)),

      drop: (item: DraggedBucket) => {
        const fromBucket = getBucket(others, item.bucketId);
        if (!fromBucket) return;
        addBucketDependency(fromBucket, bucket.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [availbleIds, bucket, others, addBucketDependency, getSequenceBucketType],
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
    updateGlobalDragging(
      sequenceIsDragging ? DraggingType.SEQUENCE : DraggingType.NONE,
      bucket.id,
    );

    if (sequenceIsDragging && props.onDragStart) {
      props.onDragStart(layerProps.differenceFromInitialOffset!);
    }
    if (!sequenceIsDragging && props.onDragEnd) {
      props.onDragEnd();
    }
  }, [sequenceIsDragging, updateGlobalDragging]);

  /**
   * Dragging
   */
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

  /**
   * Handler
   */
  const handleMouseOver = () => {
    updateHoveredBuckets(uniqueDependingIds);
  };

  const handleMouseOut = () => {
    updateHoveredBuckets([]);
  };

  const handleClick = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  /**
   * Styles & View Logic
   */
  const bgTop = getBucketBackgroundColorTop(bucket, tasksForbucket);

  const showUnavailable =
    globalDragging.type === DraggingType.SEQUENCE &&
    !canDrop &&
    !sequenceIsDragging;

  const isHovered: boolean = hoveredBuckets.includes(bucket.id);
  const hoverBorder: string = (() => {
    switch (context) {
      case TabContext.Arrange:
        return isHovered ? "border-slate-600" : "border-slate-300";
      case TabContext.Sequence:
        return "border-slate-300 hover:border-slate-600";
      default:
        return "";
    }
  })();

  const dragref =
    context === TabContext.Sequence
      ? sequenceDragRef
      : context === TabContext.Arrange
        ? arrangeDragRef
        : (x: any) => x;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className={` p-2 ${bgTop} rounded-xl`}>
          <TaskGroup bucket={bucket} />
        </div>
      </Modal>
      <div
        id={bucket.id}
        className={` w-full rounded-md overflow-hidden opacity-95  border-2
        ${isHovered || context === TabContext.Sequence ? "cursor-move" : ""}
        ${hoverBorder}
        ${canDrop && !isOver && "border-dashed border-2 border-slate-400"}
        ${isOver && " border-slate-400"}
      `}
        ref={(node) =>
          dragref(dropRef(arrangePreviewRev(sequencePreviewRev(node))))
        }
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        <div className={`${bgTop}`}>
          <BoxHeader bucket={bucket} context={context} />
          <MicroProgress bucket={bucket} />
          <div className={`min-h-[1rem] `}>
            <ul className="p-1 text-sm">
              {TabContext.Sequence === context &&
                dependingIds?.map((id) => (
                  <BucketItem
                    key={id}
                    context={context}
                    callback={() => removeBucketDependency(id, bucket.id)}
                    bucket={getBucket(others, id)}
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
    </>
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
