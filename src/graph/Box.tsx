import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useData } from "../hooks/useData";
import { getBucketBackgroundColor, getHeaderTextColor } from "../common/colors";
import BucketHeader from "../dump/BucketHeader";
import {
  ArrowRightIcon,
  ArrowsUpDownIcon,
  Bars2Icon,
  ExclamationTriangleIcon,
  LinkIcon,
  PlusIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Bucket, DraggedBucket, DropCollectedProps } from "../types";
import { useGlobalDragging } from "../hooks/useGlobalDragging";
import { ArrowIcon } from "../common/icons";

interface BoxProps {
  bucket: Bucket;
  context: "graph" | "foliation";
}

const Box: React.FC<BoxProps> = (props) => {
  const { bucket, context } = props;
  const {
    removeBucketDependency,
    getBucket,
    addBucketDependency,
    getBucketsAvailbleFor,
    getBucketsDependingOn,
  } = useData();

  const availbleIds = getBucketsAvailbleFor(bucket.id);

  const dependingIds = getBucketsDependingOn(bucket.id);

  const [collectedProps, dropRef] = useDrop(
    {
      accept: availbleIds,

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
    [availbleIds, bucket, addBucketDependency],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const [{ isDragging: graphIsDragging }, graphDragRef, previewRev] = useDrag(
    () => ({
      type: bucket.id,
      item: { bucketId: bucket.id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {},
    }),
    [bucket],
  );

  const { globalDragging, setGlobalDragging } = useGlobalDragging();
  useEffect(() => {
    setGlobalDragging(graphIsDragging);
  }, [graphIsDragging, setGlobalDragging]);

  const bgTop = getBucketBackgroundColor(bucket, "top");
  const showFoliationIcon =
    context === "foliation" &&
    (dependingIds.length > 0 || bucket.dependencies.length > 0);

  return (
    <div className={`w-full`} ref={previewRev}>
      <BucketHeader bucket={bucket} />
      <div className={`min-h-[2rem] ${bgTop} `}>
        <ul className="p-1 text-sm">
          {dependingIds?.map((id) => (
            <li
              key={id}
              onClick={() => removeBucketDependency(id, bucket.id)}
              className={`flex items-center justify-start gap-1 p-0.5 cursor-pointer group hover:underline
                ${getHeaderTextColor(getBucket(id))}
              `}
            >
              <LinkIcon className="block w-4 h-4 shrink-0 group-hover:hidden" />
              <XMarkIcon className="hidden w-4 h-4 shrink-0 group-hover:block" />
              {getBucket(id)?.name}
            </li>
          ))}
          <li
            ref={dropRef}
            className={`flex border-2 h-8 items-center justify-between gap-1 p-1
            ${canDrop && !isOver && "border-dashed border-2 border-gray-400"}
            ${isOver && " border-gray-400"}
            ${!canDrop && !isOver && " border-transparent"}
            `}
          >
            {!globalDragging && (
              <>
                <div>
                  {showFoliationIcon && (
                    <ArrowsUpDownIcon className="block w-5 h-5" />
                  )}
                </div>
                <div ref={graphDragRef}>
                  <ArrowIcon className="block w-3 h-3 cursor-move" />
                </div>
              </>
            )}
            {globalDragging}
            {canDrop}
            {globalDragging && canDrop && <></>}
            {globalDragging && !canDrop && !graphIsDragging && (
              <>
                Unavailble <ExclamationTriangleIcon className="w-5 h-5" />
              </>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Box;
