import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getTasksByState, useData } from "../hooks/useData";
import { getBucketBackgroundColor, getHeaderTextColor } from "../common/colors";
import BucketHeader from "../dump/BucketHeader";
import {
  ArrowRightIcon,
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
}

const Box: React.FC<BoxProps> = (props) => {
  const { bucket } = props;
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
        const fromBucketId = item.bucketId;
        addBucketDependency(fromBucketId, bucket.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [availbleIds, bucket, addBucketDependency],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const [{ isDragging }, dragRef] = useDrag(
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
    setGlobalDragging(isDragging);
  }, [isDragging, setGlobalDragging]);

  const bgTop = getBucketBackgroundColor(bucket, "top");

  return (
    <div className={`w-full`}>
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
              <LinkIcon className="block w-5 h-5 group-hover:hidden" />
              <XMarkIcon className="hidden w-5 h-5 group-hover:block" />
              {getBucket(id)?.name}
            </li>
          ))}
          <li
            ref={(node) => dragRef(dropRef(node))}
            className={`flex border-2 h-8 items-center justify-between gap-1 p-1 cursor-pointer hover:underline
            ${canDrop && !isOver && "border-dashed border-2 border-gray-400"}
            ${isOver && " border-gray-400"}
            ${!canDrop && !isOver && " border-transparent"}
            `}
          >
            {!globalDragging && (
              <>
                Drag Dependency
                <ArrowIcon className="block w-3 h-3" />
              </>
            )}
            {globalDragging}
            {canDrop}
            {globalDragging && canDrop && <></>}
            {globalDragging && !canDrop && !isDragging && (
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
