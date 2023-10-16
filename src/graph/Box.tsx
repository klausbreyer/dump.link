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
import { DraggedBucket, DropCollectedProps } from "../types";
import { useGlobalDragging } from "../hooks/useGlobalDragging";

interface BoxProps {
  bucketId: string;
}

const Box: React.FC<BoxProps> = (props) => {
  const { bucketId } = props;
  const {
    removeBucketDependency,
    getBucket,
    addBucketDependency,
    getBucketsAvailbleFor,
    getBucketsDependingOn,
  } = useData();

  const bucket = getBucket(bucketId);

  const availbleIds = getBucketsAvailbleFor(bucketId);

  const dependingIds = getBucketsDependingOn(bucketId);

  const [collectedProps, dropRef] = useDrop(
    {
      accept: availbleIds,

      drop: (item: DraggedBucket) => {
        const fromBucketId = item.bucketId;
        addBucketDependency(fromBucketId, bucketId);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [availbleIds, bucketId, addBucketDependency],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: bucketId,
      item: { bucketId },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {},
    }),
    [bucketId],
  );

  const { globalDragging, setGlobalDragging } = useGlobalDragging();
  useEffect(() => {
    setGlobalDragging(isDragging);
  }, [isDragging, setGlobalDragging]);

  const bgTop = getBucketBackgroundColor(bucket, "top");

  return (
    <div className={`w-full`}>
      <BucketHeader bucketId={bucketId} />
      <div className={`min-h-[2rem] ${bgTop} `}>
        <ul className="p-1 text-sm">
          {dependingIds?.map((id) => (
            <li
              key={id}
              onClick={() => removeBucketDependency(id, bucketId)}
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
                Dependency to
                <Bars2Icon className="block w-5 h-5" />
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
