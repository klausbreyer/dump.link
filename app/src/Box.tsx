import React from "react";

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
  getBucketBackgroundColor,
  getHeaderTextColor,
} from "./common/bucketColors";
import {
  checkIfBucketIDExists,
  checkIfDependencyExists,
  useAbsence,
} from "./context/absence";
import { checkBucketActivity } from "./context/data/activities";
import { getBucket, getOtherBuckets } from "./context/data/buckets";
import { useData } from "./context/data/data";
import {
  getBucketsDependingOn,
  getUniqueDependingIdsForbucket,
} from "./context/data/dependencies";
import { getUsername } from "./context/data/requests";
import { getTasksForBucket } from "./context/data/tasks";
import { useGlobalInteraction } from "./context/interaction";
import { useBoxDragDrop } from "./hooks/useBoxDragDrop";
import { Bucket, DraggingType, TabContext } from "./types";

interface BoxProps {
  bucket: Bucket;
  context: TabContext;

  onDragStart?: (offset: { x: number; y: number }) => void;
  onDragEnd?: () => void;
}

const Box: React.FC<BoxProps> = (props) => {
  const { bucket, context, onDragEnd, onDragStart } = props;
  const { acknowledged, bucketsDuringAbsence, dependenciesDuringAbsence } =
    useAbsence();
  const {
    removeBucketDependency,
    tasks,
    buckets,
    project,
    dependencies,
    activities,
  } = useData();

  const { globalDragging, hoveredBuckets, updateHoveredBuckets } =
    useGlobalInteraction();

  const {
    isOver,
    canDrop,
    sequenceIsDragging,
    arrangeDragRef,
    sequenceDragRef,
    sequencePreviewRev,
    dropRef,
    arrangePreviewRev,
  } = useBoxDragDrop(bucket, onDragStart, onDragEnd);

  const others = getOtherBuckets(buckets);
  const tasksForbucket = getTasksForBucket(tasks, bucket.id);
  const dependingIds = getBucketsDependingOn(dependencies, bucket.id);
  const uniqueDependingIds = getUniqueDependingIdsForbucket(
    others,
    dependencies,
    bucket.id,
  );

  const [isOpen, setIsOpen] = React.useState(false);

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
  const bgTop = getBucketBackgroundColor(bucket, tasksForbucket);

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

    const bucketsChanged = bucketsDuringAbsence(others);
    const dependenciesChanged = dependenciesDuringAbsence(dependencies);
    const isAbsence =
      checkIfBucketIDExists(bucketsChanged, bucket.id) ||
      checkIfDependencyExists(dependenciesChanged, bucket.id);

    if (selfActive) {
      return "border-2 border-indigo-500";
    } else if (othersActive) {
      return "border-dashed border-2 border-purple-500";
    } else if (canDrop && !isOver) {
      return "border-dashed border-2 border-slate-400";
    } else if (isOver) {
      return "border-slate-400";
    } else if (isAbsence && !acknowledged) {
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
