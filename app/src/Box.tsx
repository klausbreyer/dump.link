import React, { useEffect } from "react";
import { useDrag, useDragLayer, useDrop } from "react-dnd";

import {
  ArrowsPointingOutIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import BoxHeader from "./BoxHeader";
import MicroProgress from "./MicroProgress";
import TaskGroup from "./TaskGroup";
import Modal from "./common/Modal";
import {
  getBucketBackgroundColorTop,
  getHeaderTextColor,
} from "./common/colors";
import { useData } from "./context/data";
import { checkBucketActivity } from "./context/helper_activities";
import { uniqueValues } from "./context/helper_arrays";
import {
  bucketsChangedWhileAway,
  checkIfBucketIDExists,
  getArrangeBucketType,
  getBucket,
  getOtherBuckets,
  getSequenceBucketType,
} from "./context/helper_buckets";
import {
  checkIfDependencyExists,
  getBucketsAvailableFor,
  getBucketsDependingOn,
  getUniqueDependingIdsForbucket,
} from "./context/helper_dependencies";
import { getWholeSubgraph } from "./context/helper_layers";
import { getUsername } from "./context/helper_requests";
import { getTasksForBucket } from "./context/helper_tasks";
import { useGlobalInteraction } from "./context/interaction";
import {
  Bucket,
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
    tasks,
    buckets,
    project,
    dependencies,
    activities,
    resetBucketLayer,
    addBucketDependency,
  } = useData();

  const {
    globalDragging,
    updateGlobalDragging,
    hoveredBuckets,
    updateHoveredBuckets,
  } = useGlobalInteraction();

  const others = getOtherBuckets(buckets);
  const bucketsChanged = bucketsChangedWhileAway(others, project.id);
  const tasksForbucket = getTasksForBucket(tasks, bucket.id);
  const availbleIds = getBucketsAvailableFor(others, dependencies, bucket.id);
  const dependingIds = getBucketsDependingOn(dependencies, bucket.id);
  const uniqueDependingIds = getUniqueDependingIdsForbucket(
    others,
    dependencies,
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

  const isHovered: boolean =
    hoveredBuckets.includes(bucket.id) && !project.archived;

  const getBorderClass = (): string => {
    const bucketActive = checkBucketActivity(activities, bucket.id);
    const selfActive = bucketActive && bucketActive.createdBy === getUsername();
    const othersActive =
      bucketActive && bucketActive.createdBy !== getUsername();

    const isPastActivity =
      checkIfBucketIDExists(bucketsChanged, bucket.id) ||
      checkIfDependencyExists(dependencies, bucket.id);

    if (selfActive) {
      return "border-2 border-indigo-500";
    } else if (othersActive) {
      return "border-dashed border-2 border-purple-500";
    } else if (canDrop && !isOver) {
      return "border-dashed border-2 border-slate-400";
    } else if (isOver) {
      return "border-slate-400";
    } else if (isPastActivity) {
      return "border-dashed border-2 border-cyan-400";
    }

    switch (context) {
      case TabContext.Arrange:
        return isHovered
          ? "border-slate-500"
          : `border-slate-300 hover:border-slate-500 ${
              project.archived ? "cursor-pointer" : "cursor-move"
            }`;
      case TabContext.Sequence:
        return `border-slate-300 hover:border-slate-500 ${
          project.archived ? "cursor-pointer" : "cursor-move"
        }`;
      default:
        return "";
    }
  };

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
        ${getBorderClass()}
      `}
        ref={(node) =>
          !project.archived &&
          dragref(dropRef(arrangePreviewRev(sequencePreviewRev(node))))
        }
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
                    archived={project.archived}
                    context={context}
                    callback={() => removeBucketDependency(id, bucket.id)}
                    bucket={getBucket(others, id)}
                  />
                ))}
              {
                <li className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 p-1">
                    {showUnavailable && (
                      <>
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        Cycle Detected
                      </>
                    )}
                  </span>
                  <span>
                    <ArrowsPointingOutIcon
                      title="Show Task Group"
                      className="w-5 h-5 hover:bg-slate-300 "
                      onClick={handleClick}
                    />
                  </span>
                </li>
              }
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
  archived: boolean;
  callback: () => void;
}

const BucketItem: React.FC<BucketItemProps> = (props) => {
  const { bucket, context, callback, archived } = props;
  if (!bucket) return null;
  const bucketName = bucket?.name || "Unnamed";

  const bgHeader = getHeaderTextColor(bucket);

  if (TabContext.Sequence === context) {
    return (
      <li
        onClick={() => !archived && callback()}
        className={`flex cursor-pointer items-center justify-between group gap-1 p-0.5
        ${!archived && "hover:underline"}
        ${bgHeader}`}
      >
        <span className="">{bucketName}</span>
        {!archived && (
          <XMarkIcon className="hidden w-5 h-5 shrink-0 group-hover:block" />
        )}
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
